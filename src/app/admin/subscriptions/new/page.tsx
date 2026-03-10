import { SubscriptionForm } from "@/components/admin/SubscriptionForm";

export default function NewSubscriptionPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          New Subscription
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Set up a recurring Stripe billing subscription for a client.
        </p>
      </div>
      <SubscriptionForm />
    </div>
  );
}
