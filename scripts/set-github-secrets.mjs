/**
 * Sets GitHub Actions secrets for PrymaDirectives/portal
 * Uses libsodium-wrappers to encrypt secrets with the repo's public key.
 * Run: node scripts/set-github-secrets.mjs
 */

import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import _sodium from "libsodium-wrappers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = "PrymaDirectives/portal";
const TOKEN = process.env.GH_PAT;

if (!TOKEN) {
  console.error("ERROR: Set GH_PAT env var first.\n  $env:GH_PAT = 'ghp_...'");
  process.exit(1);
}

// ---------- Read .env ---------------------------------------------------
const envPath = join(__dirname, "..", ".env");
const envText = readFileSync(envPath, "utf-8");
const envMap = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) {
    envMap[m[1]] = m[2].replace(/^"(.*)"$/, "$1"); // strip surrounding quotes
  }
}

// ---------- Secrets to set ----------------------------------------------
const secrets = {
  GCP_SA_KEY: envMap["FIREBASE_SERVICE_ACCOUNT_KEY"], // same key reused for GCP auth
  WIF_PROVIDER: "projects/368604192807/locations/global/workloadIdentityPools/github/providers/github",
  WIF_SERVICE_ACCOUNT: "portal-deploy@pryma-portal.iam.gserviceaccount.com",
  NEXT_PUBLIC_APP_URL: envMap["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000",
  NEXT_PUBLIC_FIREBASE_API_KEY: envMap["NEXT_PUBLIC_FIREBASE_API_KEY"],
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: envMap["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: envMap["NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: envMap["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: envMap["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  NEXT_PUBLIC_FIREBASE_APP_ID: envMap["NEXT_PUBLIC_FIREBASE_APP_ID"],
  FIREBASE_STORAGE_BUCKET: envMap["FIREBASE_STORAGE_BUCKET"],
  FIREBASE_SERVICE_ACCOUNT_KEY: envMap["FIREBASE_SERVICE_ACCOUNT_KEY"],
  STRIPE_SECRET_KEY: envMap["STRIPE_SECRET_KEY"] || "",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: envMap["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] || "",
  STRIPE_WEBHOOK_SECRET: envMap["STRIPE_WEBHOOK_SECRET"] || "",
};

// ---------- GitHub API helpers -----------------------------------------
const API = "https://api.github.com";
const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
  "User-Agent": "set-secrets-script",
};

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (res.status !== 201 && res.status !== 204) {
    throw new Error(`PUT ${path} → ${res.status} ${await res.text()}`);
  }
  return res.status;
}

// ---------- Encrypt secret with repo public key ------------------------
async function encryptSecret(publicKeyB64, secretValue) {
  await _sodium.ready;
  const sodium = _sodium;

  const keyBytes = sodium.from_base64(publicKeyB64, sodium.base64_variants.ORIGINAL);
  const messageBytes = sodium.from_string(secretValue);
  const encrypted = sodium.crypto_box_seal(messageBytes, keyBytes);
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
}

// ---------- Main --------------------------------------------------------
async function main() {
  console.log(`\nFetching repo public key for ${REPO}...`);
  const pk = await apiGet(`/repos/${REPO}/actions/secrets/public-key`);
  console.log(`  key_id: ${pk.key_id}`);

  const entries = Object.entries(secrets);
  let ok = 0;
  let fail = 0;

  for (const [name, value] of entries) {
    try {
      const encrypted = await encryptSecret(pk.key, String(value ?? ""));
      const status = await apiPut(`/repos/${REPO}/actions/secrets/${name}`, {
        encrypted_value: encrypted,
        key_id: pk.key_id,
      });
      console.log(`  ✓ ${name} (${status})`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} set, ${fail} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
