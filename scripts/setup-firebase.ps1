<#
.SYNOPSIS
  Fully configures Firebase for the portal project.

.DESCRIPTION
  1. Resolves (or creates) the Firebase Web app and writes all
     NEXT_PUBLIC_FIREBASE_* vars to .env
  2. Creates the default Firestore database (if absent)
  3. Creates a dedicated service account, generates a JSON key,
     base64-encodes it → FIREBASE_SERVICE_ACCOUNT_KEY in .env
  4. Calls scripts/create-admin-user.mjs to provision the admin
     Email/Password user in Firebase Auth

  Prerequisites
  ─────────────
  • firebase-tools installed globally  (npm i -g firebase-tools)
  • gcloud CLI installed + authenticated (gcloud auth login)
  • firebase login  (already done)
  • .firebaserc exists OR -ProjectId supplied

.PARAMETER ProjectId
  Firebase/GCP project ID. Falls back to .firebaserc → default.

.PARAMETER AdminEmail
  E-mail for the admin user (prompted if omitted).

.PARAMETER Region
  Firestore location code. Default: us-central1

.EXAMPLE
  .\scripts\setup-firebase.ps1 -ProjectId "my-project-123" -AdminEmail "admin@example.com"
#>

param(
    [string]$ProjectId,
    [string]$AdminEmail,
    [string]$Region = "us-central1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Helpers ────────────────────────────────────────────────────────────────────

function Write-Step([string]$msg) { Write-Host "`n► $msg" -ForegroundColor Cyan }
function Write-Ok([string]$msg)   { Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn([string]$msg) { Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Abort([string]$msg)      { Write-Host "`n✗ $msg" -ForegroundColor Red; exit 1 }

# Upsert a key=value line in a .env file
function Set-EnvVar([string]$File, [string]$Key, [string]$Value) {
    $content = if (Test-Path $File) { Get-Content $File -Raw } else { "" }
    $escaped  = [regex]::Escape($Value)
    if ($content -match "(?m)^$Key=") {
        $content = $content -replace "(?m)^$Key=.*", "$Key=$Value"
    } else {
        $content = $content.TrimEnd() + "`n$Key=$Value"
    }
    Set-Content -Path $File -Value $content.TrimStart() -NoNewline
}

# ── Resolve project ID ─────────────────────────────────────────────────────────

if (-not $ProjectId) {
    $rc = Join-Path $PSScriptRoot "..\\.firebaserc"
    if (Test-Path $rc) {
        $rcJson = Get-Content $rc -Raw | ConvertFrom-Json
        $ProjectId = $rcJson.projects.default
    }
}

if (-not $ProjectId) {
    $ProjectId = Read-Host "Firebase project ID"
}

if (-not $ProjectId) { Abort "Project ID is required." }

$EnvFile = Join-Path $PSScriptRoot "..\.env"
Write-Host "`nProject : $ProjectId" -ForegroundColor White
Write-Host "Region  : $Region"      -ForegroundColor White
Write-Host ".env    : $EnvFile"     -ForegroundColor White

# ── 1. Firebase Web app → SDK config ──────────────────────────────────────────

Write-Step "Resolving Firebase Web app & SDK config"

$appsJson  = firebase apps:list WEB --project $ProjectId --json 2>$null | ConvertFrom-Json
$webApps   = @($appsJson.result)

if ($webApps.Count -eq 0) {
    Write-Warn "No Web app found – creating one named 'portal'..."
    firebase apps:create WEB portal --project $ProjectId | Out-Null
    $appsJson = firebase apps:list WEB --project $ProjectId --json 2>$null | ConvertFrom-Json
    $webApps  = @($appsJson.result)
}

$appId     = $webApps[0].appId
Write-Ok "App ID: $appId"

$cfgJson   = firebase apps:sdkconfig web $appId --project $ProjectId --json 2>$null | ConvertFrom-Json
$cfg       = $cfgJson.result.sdkConfig

Set-EnvVar $EnvFile "NEXT_PUBLIC_FIREBASE_API_KEY"            $cfg.apiKey
Set-EnvVar $EnvFile "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"        $cfg.authDomain
Set-EnvVar $EnvFile "NEXT_PUBLIC_FIREBASE_PROJECT_ID"         $cfg.projectId
Set-EnvVar $EnvFile "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"     $cfg.storageBucket
Set-EnvVar $EnvFile "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" $cfg.messagingSenderId
Set-EnvVar $EnvFile "NEXT_PUBLIC_FIREBASE_APP_ID"             $cfg.appId
Set-EnvVar $EnvFile "FIREBASE_STORAGE_BUCKET"                 $cfg.storageBucket
Set-EnvVar $EnvFile "GCP_PROJECT_ID"                          $cfg.projectId

Write-Ok "SDK config written to .env"

# ── 2. Firestore database ──────────────────────────────────────────────────────

Write-Step "Ensuring default Firestore database exists"

$dbList = firebase firestore:databases:list --project $ProjectId --json 2>$null | ConvertFrom-Json
$exists = ($dbList.result | Where-Object { $_.name -match "/databases/\(default\)" }).Count -gt 0

if ($exists) {
    Write-Ok "Default database already exists"
} else {
    Write-Warn "Creating Firestore database in $Region..."
    firebase firestore:databases:create `
        --project  $ProjectId `
        --location $Region `
        --type     FIRESTORE_NATIVE 2>&1 | Out-Null
    Write-Ok "Firestore database created"
}

# ── 3. Service account key ─────────────────────────────────────────────────────

Write-Step "Creating service account & generating key"

$saName    = "portal-admin"
$saEmail   = "${saName}@${ProjectId}.iam.gserviceaccount.com"
$keyFile   = Join-Path $PSScriptRoot "..\service-account-key.json"

# Create SA if missing
$saExists = gcloud iam service-accounts describe $saEmail --project $ProjectId 2>$null
if (-not $saExists) {
    gcloud iam service-accounts create $saName `
        --display-name "Portal Admin" `
        --project $ProjectId | Out-Null
    Write-Ok "Service account created: $saEmail"
} else {
    Write-Ok "Service account already exists: $saEmail"
}

# Grant Firebase Admin + Firestore roles
$roles = @(
    "roles/firebase.admin",
    "roles/datastore.user",
    "roles/firebaseauth.admin"
)
foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $ProjectId `
        --member  "serviceAccount:$saEmail" `
        --role    $role `
        --condition None 2>&1 | Out-Null
}
Write-Ok "IAM roles granted"

# Generate the key
gcloud iam service-accounts keys create $keyFile `
    --iam-account $saEmail `
    --project     $ProjectId 2>&1 | Out-Null

$b64Key = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keyFile))
Set-EnvVar $EnvFile "FIREBASE_SERVICE_ACCOUNT_KEY" $b64Key

Remove-Item $keyFile -Force
Write-Ok "Service account key written to .env (key file deleted)"

# ── 4. Create admin user ───────────────────────────────────────────────────────

Write-Step "Creating admin user in Firebase Auth"

if (-not $AdminEmail) {
    $AdminEmail = Read-Host "Admin email"
}

$AdminPassword = Read-Host "Admin password" -AsSecureString
$plainPwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminPassword)
)

$nodeScript = Join-Path $PSScriptRoot "create-admin-user.mjs"
node $nodeScript $AdminEmail $plainPwd $b64Key

# ── Done ──────────────────────────────────────────────────────────────────────

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Setup complete!  Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "  1. In Firebase Console → Authentication → Sign-in method"
Write-Host "     enable  Email/Password  (one-time console click)"
Write-Host ""
Write-Host "  2. Start the dev server:"
Write-Host "       npm run dev"
Write-Host ""
Write-Host "  3. Login at  http://localhost:3000/admin/login"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
