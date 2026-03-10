# Pryma Invoice Portal — Project Roadmap

**Live URL target:** `portal.pryma.tech/invoice/{invoiceID}`
**Repo:** `github.com/PrymaDirectives/portal`
**Stack:** Next.js · Stripe · PostgreSQL · Google Cloud Storage · Google Cloud Run · GitHub Actions

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Complete |
| `[!]` | Blocked / needs review |

---

## Phase 0 — Foundation & Repo Setup

- [x] Create repo under `PrymaDirectives/portal`
- [x] Create project roadmap (`ROADMAP.md`)
- [ ] Scaffold Next.js 14 app with TypeScript and App Router
- [ ] Set up ESLint, Prettier, and `.editorconfig`
- [ ] Configure `tsconfig.json` with strict mode
- [ ] Set up `src/` directory structure and route layout
- [ ] Add `.env.example` with all required variable keys
- [ ] Add `.gitignore` (Next.js, Node, env, cloud)
- [ ] Commit and push initial scaffold

> **Checkpoint 0:** Repo has a running `next dev` baseline. All configs present. Push to `main` and confirm GitHub shows green file tree.

---

## Phase 1 — Data Model & Database Layer

- [ ] Choose and configure database (PostgreSQL via Neon or Cloud SQL)
- [ ] Set up Prisma ORM with schema
- [ ] Define `Invoice` model with all fields:
  - core metadata (id, publicInvoiceId, invoiceNumber, status, dates)
  - sender fields
  - client fields
  - project fields
  - billing fields (lineItems, subtotal, taxAmount, totalDue, currency)
  - tools / notes fields
  - Stripe fields (checkoutSessionId, paymentIntentId, paymentLink, stripeStatus)
  - storage fields (pdfUrl, pdfVersion, pdfGeneratedAt)
  - admin fields (internalNotes, createdBy, lastEditedBy)
- [ ] Define `InvoiceLineItem` model (normalized or embedded)
- [ ] Define `StripeWebhookEvent` model for audit logging
- [ ] Run initial migration
- [ ] Seed a sample invoice record for local dev

> **Checkpoint 1:** `prisma studio` shows schema. Sample invoice queryable. Commit schema and migration files. Push.

---

## Phase 2 — Core API Layer

- [ ] Set up `/api/invoices/[invoiceID]` — fetch public invoice by ID
- [ ] Set up `/api/admin/invoices` — list all invoices (authenticated)
- [ ] Set up `/api/admin/invoices/[invoiceID]` — get/update/delete invoice (authenticated)
- [ ] Set up `/api/admin/invoices/new` — create invoice
- [ ] Set up `/api/stripe/checkout` — create Stripe checkout session
- [ ] Set up `/api/stripe/webhook` — handle Stripe webhook events
- [ ] Add input validation (Zod) to all API routes
- [ ] Add error handling and typed API response shapes

> **Checkpoint 2:** All API routes return expected shapes when hit with a REST client. Stripe test checkout session generates successfully. Commit and push.

---

## Phase 3 — Stripe Integration

- [ ] Install and configure Stripe SDK (`stripe`, `@stripe/stripe-js`)
- [ ] Create checkout session tied to invoice amount and metadata
- [ ] Store `stripeCheckoutSessionId` on invoice creation/session start
- [ ] Implement webhook endpoint at `/api/stripe/webhook`
- [ ] Handle webhook events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- [ ] On successful payment: mark invoice `paid`, store `paidAt`, store Stripe metadata
- [ ] On failed payment: update `stripeStatus` accordingly
- [ ] Log all incoming webhook events to `StripeWebhookEvent` table
- [ ] Test full payment flow end-to-end in Stripe test mode

> **Checkpoint 3:** Full test payment in Stripe test mode marks invoice as paid in DB. Webhook events logged. Invoice status updates live. Commit and push.

---

## Phase 4 — Public Invoice Page UI

- [ ] Build `/invoice/[invoiceID]` page route (server component, SSR)
- [ ] Build `InvoiceView` component
- [ ] Build `InvoiceHeader` section (title, sender info, invoice meta, status)
- [ ] Build `BillTo` section
- [ ] Build `ProjectSection` section
- [ ] Build `WorkSummaryTable` component (Item, Description, Hours, Rate, Amount)
- [ ] Build `InvoiceTotals` section (subtotal, tax, total due)
- [ ] Build `ToolsUsed` section
- [ ] Build `InvoiceNotes` section
- [ ] Build `PaymentPanel` component (Stripe CTA, payment state messaging)
- [ ] Build `StatusBadge` component (unpaid / open / processing / paid / overdue / failed / void)
- [ ] Style all components: invoice-sheet aesthetic, crisp, premium, mobile-responsive
- [ ] Handle all payment states visually (paid confirmation, overdue warning, etc.)
- [ ] Add Pryma brand mark (subtle, premium)

> **Checkpoint 4:** Public invoice page renders at `localhost:3000/invoice/[sampleID]`. Looks like a premium invoice. All sections present. Payment CTA visible. Mobile-responsive. Commit and push.

---

## Phase 5 — Admin Invoices Area

- [ ] Set up authentication (NextAuth or Clerk) restricted to Pryma internal users
- [ ] Build `/admin/invoices` — invoice list page with search and filter
- [ ] Build `/admin/invoices/new` — create invoice form
- [ ] Build `/admin/invoices/[invoiceID]` — invoice detail / edit page
- [ ] Add ability to:
  - view full invoice
  - edit invoice fields
  - view payment status
  - copy public invoice URL
  - regenerate Stripe payment link
  - view and download archived PDF
  - add/edit internal notes
- [ ] Build `InvoiceTable` component for the list view
- [ ] Add search/filter/sort to invoice list
- [ ] Protect all `/admin` routes with auth middleware

> **Checkpoint 5:** Admin area fully functional behind auth. Can create, view, edit invoices. Can access PDF link. Commit and push.

---

## Phase 6 — PDF Archival

- [ ] Install PDF generation library (`@react-pdf/renderer` or `puppeteer`)
- [ ] Build `InvoicePDF` template component (matches HTML invoice design)
- [ ] Implement `generateInvoicePDF(invoiceID)` service function
- [ ] Configure Google Cloud Storage client (`@google-cloud/storage`)
- [ ] Implement `uploadPDFToGCS(buffer, invoiceID, version)` function
- [ ] Store PDF at path: `invoices/{invoiceID}/invoice-v{n}.pdf`
- [ ] Store `pdfUrl`, `pdfVersion`, `pdfGeneratedAt` on invoice record
- [ ] Trigger PDF generation on:
  - invoice creation
  - invoice content update (increment version)
- [ ] Surface PDF download link in admin invoices area
- [ ] Test GCS upload and access in local dev with service account credentials

> **Checkpoint 6:** Invoice PDF generates, uploads to GCS bucket, and link appears in admin panel. Version increments on edit. Commit and push.

---

## Phase 7 — Containerization

- [ ] Write production `Dockerfile` (multi-stage build, Node Alpine)
- [ ] Write `.dockerignore`
- [ ] Configure Next.js for standalone output (`output: 'standalone'` in `next.config.ts`)
- [ ] Test Docker build locally: `docker build -t portal .`
- [ ] Test Docker run locally: `docker run -p 3000:3000 portal`
- [ ] Confirm environment variable injection at runtime (not baked into image)
- [ ] Verify health check endpoint (e.g. `/api/health`)

> **Checkpoint 7:** Docker container runs locally and serves the invoice page. Health check returns 200. Commit and push.

---

## Phase 8 — CI/CD and Cloud Run Deployment

- [ ] Create GitHub Actions workflow `.github/workflows/deploy.yml`
- [ ] Workflow triggers on push to `main`
- [ ] Workflow steps:
  - Checkout code
  - Authenticate to Google Cloud (Workload Identity Federation or service account key)
  - Configure Docker for Artifact Registry
  - Build and tag Docker image
  - Push image to Google Artifact Registry
  - Deploy to Google Cloud Run
  - Pass environment variables / secrets via Secret Manager or Cloud Run env config
- [ ] Create Cloud Run service for `portal.pryma.tech`
- [ ] Map custom domain `portal.pryma.tech` to Cloud Run service
- [ ] Set up Google Artifact Registry repository
- [ ] Configure Cloud Run env vars (Stripe keys, DB URL, GCS bucket, auth secret)
- [ ] Run first successful deploy

> **Checkpoint 8:** Pushing to `main` triggers GitHub Actions, builds image, deploys to Cloud Run. `portal.pryma.tech` is live. Commit and push.

---

## Phase 9 — QA, Polish & Production Hardening

- [ ] Test full payment flow on production with Stripe test mode
- [ ] Test webhook delivery on production (Stripe Dashboard → webhook endpoint)
- [ ] Test all invoice status states visually
- [ ] Add rate limiting to webhook endpoint
- [ ] Validate Stripe webhook signature (`stripe.webhooks.constructEvent`)
- [ ] Security review: all admin routes require auth, no sensitive data in public routes
- [ ] Add `robots.txt` and `sitemap.xml` configuration
- [ ] Confirm mobile responsiveness across breakpoints
- [ ] Confirm Pryma branding is subtle and consistent
- [ ] Lighthouse audit on public invoice page (target 90+)
- [ ] Final review of all environment variables and secrets
- [ ] Remove all seed/test data from production DB

> **Checkpoint 9:** Full end-to-end test passes. Production is clean. Final commit and push.

---

## Phase 10 — Post-Launch

- [ ] Monitor Cloud Run logs post-launch
- [ ] Set up error alerting (Cloud Monitoring or Sentry)
- [ ] Document environment variable requirements in `README.md`
- [ ] Document how to create a new invoice (admin guide)
- [ ] Document Stripe webhook setup steps
- [ ] Document GCS bucket setup and IAM permissions

> **Checkpoint 10:** System is stable. Documentation complete. Repo is clean and tagged with `v1.0.0`.

---

## Key Environment Variables (tracked in `.env.example`)

```
# App
NEXT_PUBLIC_APP_URL=

# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Google Cloud
GCP_PROJECT_ID=
GCS_BUCKET_NAME=
GOOGLE_APPLICATION_CREDENTIALS=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ADMIN_EMAIL=
```

---

## Route Map

| Route | Type | Access |
|-------|------|--------|
| `/invoice/[invoiceID]` | Public | Anyone with URL |
| `/admin/invoices` | Admin | Authenticated only |
| `/admin/invoices/new` | Admin | Authenticated only |
| `/admin/invoices/[invoiceID]` | Admin | Authenticated only |
| `/api/invoices/[invoiceID]` | API | Public (read) |
| `/api/admin/invoices` | API | Authenticated |
| `/api/stripe/checkout` | API | Authenticated / invoice-scoped |
| `/api/stripe/webhook` | API | Stripe (signature-verified) |
| `/api/health` | API | Public |

---

*Last updated: Phase 0 — Repo initialized.*
