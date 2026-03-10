// PaymentPanel — Stripe CTA, payment state messaging, paid confirmation (Phase 4)
import type { Invoice } from "@/types/invoice";
export function PaymentPanel({ invoice }: { invoice: Invoice }) {
  void invoice;
  return <div className="payment-panel" />;
}
