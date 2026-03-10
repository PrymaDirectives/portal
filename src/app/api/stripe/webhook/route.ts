import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { markInvoicePaid, updateInvoice } from "@/lib/invoice";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }
  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  // Extract invoice identifiers from metadata
  const metadata =
    (event.data.object as { metadata?: Record<string, string> }).metadata ?? {};
  const invoiceId = metadata.invoiceId;
  // Log the event
  try {
    await db!.stripeWebhookEvent.upsert({
      where: { stripeEventId: event.id },
      update: {},
      create: {
        stripeEventId: event.id,
        type: event.type,
        invoiceId: invoiceId ?? null,
        payloadJson: JSON.stringify(event.data.object),
      },
    });
  } catch (err) {
    console.error("[Webhook] Failed to log event:", err);
  }
  // Handle event types
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          payment_intent?: string;
          customer?: string;
          status?: string;
        };
        if (invoiceId) {
          await markInvoicePaid(invoiceId, {
            stripePaymentIntentId: session.payment_intent ?? undefined,
            stripeCustomerId: session.customer ?? undefined,
            stripeStatus: session.status ?? undefined,
          });
        }
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object as { id: string; customer?: string };
        if (invoiceId) {
          await markInvoicePaid(invoiceId, {
            stripePaymentIntentId: pi.id,
            stripeCustomerId: pi.customer ?? undefined,
            stripeStatus: "succeeded",
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        if (invoiceId) {
          await updateInvoice(invoiceId, {
            status: "failed",
            stripeStatus: "failed",
            webhookLastSyncedAt: new Date(),
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[Webhook] Failed to process ${event.type}:`, err);
  }
  return NextResponse.json({ received: true });
}
