import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getInvoiceByPublicId, updateInvoice } from "@/lib/invoice";
import { z } from "zod";

const CheckoutSchema = z.object({
  publicInvoiceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const invoice = await getInvoiceByPublicId(parsed.data.publicInvoiceId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured — add STRIPE_SECRET_KEY to environment" },
        { status: 503 }
      );
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: invoice.projectName,
              description: `Invoice ${invoice.invoiceNumber} — ${invoice.clientName}`,
            },
            unit_amount: Math.round(invoice.totalDue * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        publicInvoiceId: invoice.publicInvoiceId,
        invoiceNumber: invoice.invoiceNumber,
      },
      customer_email: invoice.clientEmail,
      success_url: `${appUrl}/invoice/${invoice.publicInvoiceId}?payment=success`,
      cancel_url: `${appUrl}/invoice/${invoice.publicInvoiceId}?payment=cancelled`,
    });
    await updateInvoice(invoice.id, {
      stripeCheckoutSessionId: session.id,
      stripePaymentLink: session.url ?? undefined,
      status: "open",
    });
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[POST /api/stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
