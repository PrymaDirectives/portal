import Link from "next/link";
import { getAllSubscriptions } from "@/lib/subscription";
import { SubscriptionTable } from "@/components/admin/SubscriptionTable";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const subscriptions = await getAllSubscriptions();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
            Subscriptions
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage recurring billing for your clients via Stripe.
          </p>
        </div>
        <Link
          href="/admin/subscriptions/new"
          className="rounded-sm bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition"
        >
          + New Subscription
        </Link>
      </div>
      <SubscriptionTable subscriptions={subscriptions} />
    </div>
  );
}
