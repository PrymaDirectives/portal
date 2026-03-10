"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InvoiceTemplate } from "@/types/template";

interface TemplateFormProps {
  /** When provided, the form is in "edit" mode and will PATCH the existing template */
  initialData?: InvoiceTemplate;
}

export function TemplateForm({ initialData }: TemplateFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<
    { item: string; description: string; hours: number; rate: number; amount: number }[]
  >(
    initialData?.lineItems.map((li) => ({
      item: li.item,
      description: li.description,
      hours: li.hours,
      rate: li.rate,
      amount: li.amount,
    })) ?? [{ item: "", description: "", hours: 0, rate: 0, amount: 0 }]
  );

  function updateLineItem(i: number, field: keyof (typeof lineItems)[0], value: string | number) {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      const hours = field === "hours" ? Number(value) : Number(updated[i].hours);
      const rate = field === "rate" ? Number(value) : Number(updated[i].rate);
      updated[i].amount = Math.round(hours * rate * 100) / 100;
      return updated;
    });
  }

  function addLineItem() {
    setLineItems((p) => [...p, { item: "", description: "", hours: 0, rate: 0, amount: 0 }]);
  }

  function removeLineItem(i: number) {
    setLineItems((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      name: fd.get("name") as string,
      ownerEmail: fd.get("ownerEmail") as string,
      description: fd.get("description") as string,
      senderBrand: fd.get("senderBrand") as string,
      senderName: fd.get("senderName") as string,
      senderEmail: fd.get("senderEmail") as string,
      senderLocation: fd.get("senderLocation") as string,
      clientName: fd.get("clientName") as string,
      clientContact: fd.get("clientContact") as string,
      clientEmail: fd.get("clientEmail") as string,
      projectName: fd.get("projectName") as string,
      projectDescription: fd.get("projectDescription") as string,
      currency: (fd.get("currency") as string) || "USD",
      hourlyRate: Number(fd.get("hourlyRate")) || 0,
      taxAmount: Number(fd.get("taxAmount")) || 0,
      toolsUsed: ((fd.get("toolsUsed") as string) || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: fd.get("notes") as string,
      lineItems: lineItems.map((li, i) => ({ ...li, sortOrder: i })),
    };

    try {
      const url = isEdit
        ? `/api/admin/templates/${initialData!.id}`
        : "/api/admin/templates";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError("Failed to save template. Check all required fields.");
        setLoading(false);
        return;
      }

      router.push("/admin/templates");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-100 transition";
  const labelCls = "invoice-label block mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Template meta */}
      <fieldset className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Template Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Standard Monthly Retainer"
            defaultValue={initialData?.name ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Owner Email <span className="text-red-400">*</span>
          </label>
          <input
            name="ownerEmail"
            type="email"
            required
            placeholder="e.g. peter.dodge@pryma.tech"
            defaultValue={initialData?.ownerEmail ?? ""}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-neutral-400">The Pryma team member this template belongs to</p>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Template Description (internal)</label>
          <input
            name="description"
            placeholder="Brief note about this template…"
            defaultValue={initialData?.description ?? ""}
            className={inputCls}
          />
        </div>
      </fieldset>

      <hr className="border-neutral-100" />

      {/* Sender defaults */}
      <div>
        <p className="invoice-label mb-3">Sender Defaults</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Brand</label>
            <input
              name="senderBrand"
              defaultValue={initialData?.senderBrand ?? "Pryma"}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Name</label>
            <input
              name="senderName"
              defaultValue={initialData?.senderName ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              name="senderEmail"
              type="email"
              defaultValue={initialData?.senderEmail ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input
              name="senderLocation"
              defaultValue={initialData?.senderLocation ?? "Los Angeles, CA"}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Client defaults */}
      <div>
        <p className="invoice-label mb-3">Client Defaults</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client / Brand Name</label>
            <input
              name="clientName"
              defaultValue={initialData?.clientName ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Contact Name</label>
            <input
              name="clientContact"
              defaultValue={initialData?.clientContact ?? ""}
              className={inputCls}
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Client Email</label>
            <input
              name="clientEmail"
              type="email"
              defaultValue={initialData?.clientEmail ?? ""}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Project defaults */}
      <div>
        <p className="invoice-label mb-3">Project Defaults</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Project Name</label>
            <input
              name="projectName"
              defaultValue={initialData?.projectName ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Project Description</label>
            <textarea
              name="projectDescription"
              rows={2}
              className={inputCls}
              defaultValue={initialData?.projectDescription ?? ""}
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Default line items */}
      <div>
        <p className="invoice-label mb-3">Default Line Items</p>
        <div className="space-y-3">
          {lineItems.map((li, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                {i === 0 && <label className={labelCls}>Item</label>}
                <input
                  placeholder="Item"
                  value={li.item}
                  onChange={(e) => updateLineItem(i, "item", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-4">
                {i === 0 && <label className={labelCls}>Description</label>}
                <input
                  placeholder="Description"
                  value={li.description}
                  onChange={(e) => updateLineItem(i, "description", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-1">
                {i === 0 && <label className={labelCls}>Hrs</label>}
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={li.hours}
                  onChange={(e) => updateLineItem(i, "hours", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                {i === 0 && <label className={labelCls}>Rate ($)</label>}
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={li.rate}
                  onChange={(e) => updateLineItem(i, "rate", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-1">
                {i === 0 && <label className={labelCls}>Amount</label>}
                <p className="py-2.5 text-sm tabular-nums text-neutral-600">
                  ${li.amount.toFixed(2)}
                </p>
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(i)}
                    className="pb-2.5 text-xs text-neutral-300 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLineItem}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition underline underline-offset-2"
          >
            + Add line item
          </button>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Billing defaults */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Default Hourly Rate ($)</label>
          <input
            name="hourlyRate"
            type="number"
            min="0"
            step="1"
            defaultValue={initialData?.hourlyRate ?? 0}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Default Tax Amount ($)</label>
          <input
            name="taxAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialData?.taxAmount ?? 0}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <select name="currency" defaultValue={initialData?.currency ?? "USD"} className={inputCls}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Tools & Notes */}
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Tools Used (comma-separated)</label>
          <input
            name="toolsUsed"
            defaultValue={initialData?.toolsUsed.join(", ") ?? ""}
            className={inputCls}
            placeholder="Next.js, Stripe, Firebase, GitHub Copilot"
          />
        </div>
        <div>
          <label className={labelCls}>Default Notes (public)</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={initialData?.notes ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-sm bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-neutral-900 px-6 py-3 text-sm font-semibold text-white tracking-wide transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-sm border border-neutral-200 px-5 py-3 text-sm text-neutral-600 hover:border-neutral-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
