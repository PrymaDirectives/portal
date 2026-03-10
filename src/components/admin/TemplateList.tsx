"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InvoiceTemplate } from "@/types/template";

export function TemplateList({ templates }: { templates: InvoiceTemplate[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-neutral-200 py-16 text-center">
        <p className="text-sm text-neutral-400">No templates yet.</p>
        <Link
          href="/admin/templates/new"
          className="mt-3 inline-block text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
        >
          Create your first template →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-neutral-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Template
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Rate
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Line Items
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50 bg-white">
          {templates.map((t) => (
            <tr key={t.id} className="group hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-4">
                <p className="font-medium text-neutral-900">{t.name}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-neutral-400 truncate max-w-[200px]">
                    {t.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-4 text-neutral-600">{t.ownerEmail}</td>
              <td className="px-4 py-4">
                {t.clientName ? (
                  <>
                    <p className="text-neutral-800">{t.clientName}</p>
                    {t.clientEmail && (
                      <p className="text-xs text-neutral-400">{t.clientEmail}</p>
                    )}
                  </>
                ) : (
                  <span className="text-neutral-300">—</span>
                )}
              </td>
              <td className="px-4 py-4 tabular-nums text-neutral-600">
                {t.hourlyRate > 0 ? `$${t.hourlyRate}/hr` : "—"}
              </td>
              <td className="px-4 py-4 text-neutral-500">{t.lineItems.length}</td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/templates/${t.id}/edit`}
                    className="text-xs text-neutral-400 hover:text-neutral-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    disabled={deleting === t.id}
                    className="text-xs text-neutral-300 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {deleting === t.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
