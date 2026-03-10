import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaLibSql({ url });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing seed data
  await db.invoiceLineItem.deleteMany();
  await db.stripeWebhookEvent.deleteMany();
  await db.invoice.deleteMany();

  const invoice = await db.invoice.create({
    data: {
      publicInvoiceId: "inv-prm-001",
      invoiceNumber: "INV-2026-001",
      status: "unpaid",
      dateIssued: new Date("2026-03-01"),
      paymentDue: new Date("2026-03-31"),
      senderName: "Pryma",
      senderEmail: "hello@pryma.tech",
      senderLocation: "Los Angeles, CA",
      senderBrand: "Pryma",
      clientName: "Crescent Creative",
      clientContact: "Marcus Webb",
      clientEmail: "marcus@crescentcreative.co",
      projectName: "Creator Merch Shop",
      projectDescription:
        "Full-stack creator merchandise shop built with Next.js, Firebase, and Stripe. " +
        "Includes product catalog, cart, checkout, order management, and admin dashboard. " +
        "Deployed to Google Cloud Run with CI/CD via GitHub Actions.",
      currency: "USD",
      hoursWorked: 52,
      hourlyRate: 175,
      subtotal: 9100,
      taxAmount: 0,
      totalDue: 9100,
      toolsUsedJson: JSON.stringify([
        "Next.js",
        "Firebase",
        "Stripe",
        "Google Cloud Run",
        "GitHub Actions",
        "GitHub Copilot",
        "ChatGPT",
        "Cloudflare (DNS)",
      ]),
      notes:
        "This invoice covers all work completed for the Crescent Creative merch shop project, " +
        "including strategy, design, development, deployment, and handoff documentation.\n\n" +
        "Future updates, feature additions, or ongoing maintenance are not included and will be scoped and billed separately.",
      internalNotes: "Client was referred by Jordan at Studio 44. Fast payer historically.",
      lineItems: {
        create: [
          {
            item: "Strategy & Discovery",
            description: "Project scoping, architecture planning, and client discovery sessions",
            hours: 4,
            rate: 175,
            amount: 700,
            sortOrder: 0,
          },
          {
            item: "UI Design",
            description: "Product pages, cart, checkout, and mobile-responsive layouts",
            hours: 8,
            rate: 175,
            amount: 1400,
            sortOrder: 1,
          },
          {
            item: "Frontend Development",
            description: "Next.js app with product catalog, cart, and Stripe checkout flow",
            hours: 20,
            rate: 175,
            amount: 3500,
            sortOrder: 2,
          },
          {
            item: "Backend & Integrations",
            description: "Firebase data layer, Stripe webhooks, order management API",
            hours: 14,
            rate: 175,
            amount: 2450,
            sortOrder: 3,
          },
          {
            item: "Deployment & CI/CD",
            description: "Google Cloud Run deployment, GitHub Actions workflow, domain config",
            hours: 4,
            rate: 175,
            amount: 700,
            sortOrder: 4,
          },
          {
            item: "Handoff & Documentation",
            description: "Walkthrough recording, admin guide, repo documentation",
            hours: 2,
            rate: 175,
            amount: 350,
            sortOrder: 5,
          },
        ],
      },
    },
  });

  console.log(`✅ Created sample invoice: ${invoice.invoiceNumber} (ID: ${invoice.id})`);
  console.log(`   Public URL: http://localhost:3000/invoice/${invoice.publicInvoiceId}`);
  console.log(`   Admin URL:  http://localhost:3000/admin/invoices/${invoice.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
