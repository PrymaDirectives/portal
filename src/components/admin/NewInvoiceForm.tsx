"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { InvoiceTemplate } from "@/types/template";

interface Defaults {
  senderBrand: string;
  senderName: string;
  senderEmail: string;
  senderLocation: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  projectName: string;
  projectDescription: string;
  currency: string;
  hourlyRate: string;
  taxAmount: string;
  toolsUsed: string;
  notes: string;
}

const EMPTY_DEFAULTS: Defaults = {
  senderBrand: "Pryma",
  senderName: "Pryma",
  senderEmail: "hello@pryma.tech",
  senderLocation: "Los Angeles, CA",
  clientName: "",
  clientContact: "",
  clientEmail: "",
  projectName: "",
  projectDescription: "",
  currency: "USD",
  hourlyRate: "0",
  taxAmount: "0",
  toolsUsed: "",
  notes: "",
};

export function NewInvoiceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template picker state
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [defaults, setDefaults] = useState<Defaults>(EMPTY_DEFAULTS);
  const [loadedBadge, setLoadedBadge] = useState<string | null>(null);

  // Line items state
  const [lineItems, setLineItems] = useState([
    { item: "", description: "", hours: 0, rate: 0, amount: 0 },
  ]);

  useEffect(() => {
    fetch("/api/admin/templates")
      .then((r) => r.json())
      .then((d: { templates?: InvoiceTemplate[] }) => setTemplates(d.templates ?? []))
      .catch(() => {});
  }, []);

  function handleLoadTemplate(templateId: string) {
    if (!templateId) return;
    const t = templates.find((t) => t.id === templateId);
    if (!t) return;
    setDefaults({
      senderBrand: t.senderBrand || "Pryma",
      senderName: t.senderName || "",
      senderEmail: t.senderEmail || "",
      senderLocation: t.senderLocation || "",
      clientName: t.clientName || "",
      clientContact: t.clientContact || "",
      clientEmail: t.clientEmail || "",
      projectName: t.projectName || "",
      projectDescription: t.projectDescription || "",
      currency: t.currency || "USD",
      hourlyRate: String(t.hourlyRate ?? 0),
      taxAmount: String(t.taxAmount ?? 0),
      toolsUsed: t.toolsUsed.join(", "),
      notes: t.notes || "",
    });
    if (t.lineItems.length > 0) {
      setLineItems(
        t.lineItems.map((li) => ({
          item: li.item,
          description: li.description,
          hours: li.hours,
          rate: li.rate,
          amount: li.amount,
        }))
      );
    }
    setLoadedBadge(t.name);
    setFormKey((k) => k + 1);
  }

  function updateLineItem(
    i: number,
    field: keyof (typeof lineItems)[0],
    value: string | number
  ) {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      const hours =
        field === "hours" ? Number(value) : Number(updated[i].hours);
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

  const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const taxAmount = Number(fd.get("taxAmount")) || 0;

    const payload = {
      publicInvoiceId: fd.get("publicInvoiceId") as string,
      invoiceNumber: fd.get("invoiceNumber") as string,
      status: "unpaid",
      dateIssued: fd.get("dateIssued") as string,
      paymentDue: fd.get("paymentDue") as string,
      senderName: fd.get("senderName") as string,
      senderEmail: fd.get("senderEmail") as string,
      senderLocation: fd.get("senderLocation") as string,
      senderBrand: fd.get("senderBrand") as string,
      clientName: fd.get("clientName") as string,
      clientContact: fd.get("clientContact") as string,
      clientEmail: fd.get("clientEmail") as string,
      projectName: fd.get("projectName") as string,
      projectDescription: fd.get("projectDescription") as string,
      currency: (fd.get("currency") as string) || "USD",
      hoursWorked: lineItems.reduce((s, li) => s + li.hours, 0),
      hourlyRate: Number(fd.get("hourlyRate")) || 0,
      subtotal,
      taxAmount,
      totalDue: subtotal + taxAmount,
      toolsUsed: ((fd.get("toolsUsed") as string) || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: fd.get("notes") as string,
      internalNotes: fd.get("internalNotes") as string,
      lineItems: lineItems.map((li, i) => ({ ...li, sortOrder: i })),
    };

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { invoice?: { id: string }; error?: unknown };
      if (!res.ok) {
        setError("Failed to create invoice. Check all required fields.");
        setLoading(false);
        return;
      }
      router.push(`/admin/invoices/${data.invoice!.id}`);
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
    <div className="space-y-6">
      {/* ── Template Picker ───────────────────────────────── */}
      {templates.length > 0 && (
        <div className="rounded-sm bg-neutral-50 border border-neutral-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap">
              Load template
            </label>
            <select
              className="flex-1 rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-neutral-400 transition"
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                handleLoadTemplate(e.target.value);
              }}
            >
              <option value="">— choose a template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.ownerEmail ? ` (${t.ownerEmail})` : ""}
                </option>
              ))}
            </select>
          </div>
          {loadedBadge && (
            <p className="mt-2 text-xs text-emerald-600">
              ✓ Loaded from <strong>{loadedBadge}</strong> — all defaults applied.
            </p>
          )}
        </div>
      )}

      <form key={formKey} onSubmit={handleSubmit} className="space-y-8">
      {/* Invoice IDs */}
      <fieldset className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Public Invoice ID</label>
          <input name="publicInvoiceId" required placeholder="inv-001" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Invoice Number</label>
          <input name="invoiceNumber" required placeholder="INV-001" className={inputCls} />
        </div>
      </fieldset>

      {/* Dates */}
      <fieldset className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date Issued</label>
          <input
            name="dateIssued"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Payment Due</label>
          <input name="paymentDue" type="date" required className={inputCls} />
        </div>
      </fieldset>

      <hr className="border-neutral-100" />

      {/* Sender */}
      <div>
        <p className="invoice-label mb-3">Sender</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Brand</label>
            <input name="senderBrand" required defaultValue={defaults.senderBrand} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Name</label>
            <input name="senderName" required defaultValue={defaults.senderName} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input name="senderEmail" type="email" required defaultValue={defaults.senderEmail} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input name="senderLocation" required defaultValue={defaults.senderLocation} className={inputCls} />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Client */}
      <div>
        <p className="invoice-label mb-3">Client</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client / Brand Name</label>
            <input name="clientName" required defaultValue={defaults.clientName} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Name</label>
            <input name="clientContact" required defaultValue={defaults.clientContact} className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Client Email</label>
            <input name="clientEmail" type="email" required defaultValue={defaults.clientEmail} className={inputCls} />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Project */}
      <div>
        <p className="invoice-label mb-3">Project</p>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Project Name</label>
            <input name="projectName" required defaultValue={defaults.projectName} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              name="projectDescription"
              required
              rows={2}
              className={inputCls}
              defaultValue={defaults.projectDescription}
              placeholder="Brief summary of work completed…"
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Line Items */}
      <div>
        <p className="invoice-label mb-3">Line Items</p>
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
        {/* Subtotal preview */}
        <div className="mt-4 flex justify-end">
          <div className="text-sm text-neutral-500">
            Subtotal:{" "}
            <span className="font-semibold text-neutral-800 tabular-nums">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Billing */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Currency</label>
          <select name="currency" defaultValue={defaults.currency} className={inputCls}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Hourly Rate ($)</label>
          <input name="hourlyRate" type="number" min="0" step="1" defaultValue={defaults.hourlyRate} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Tax Amount ($)</label>
          <input name="taxAmount" type="number" min="0" step="0.01" defaultValue={defaults.taxAmount} className={inputCls} />
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Tools & Notes */}
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Tools Used (comma-separated)</label>
          <input
            name="toolsUsed"
            className={inputCls}
            defaultValue={defaults.toolsUsed}
            placeholder="Next.js, Stripe, Firebase, GitHub Copilot"
          />
        </div>
        <div>
          <label className={labelCls}>Notes (public)</label>
          <textarea name="notes" rows={3} defaultValue={defaults.notes} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Internal Notes (private)</label>
          <textarea name="internalNotes" rows={2} className={inputCls} />
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
          {loading ? "Creating…" : "Create Invoice"}
        </button>
      </div>
    </form>
    </div>
  );
}
