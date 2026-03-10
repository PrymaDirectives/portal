import Link from "next/link";
import { getAllTemplates } from "@/lib/template";
import { TemplateList } from "@/components/admin/TemplateList";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getAllTemplates();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
            Invoice Templates
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Save reusable defaults for faster invoice creation.
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="rounded-sm bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition"
        >
          + New Template
        </Link>
      </div>
      <TemplateList templates={templates} />
    </div>
  );
}
