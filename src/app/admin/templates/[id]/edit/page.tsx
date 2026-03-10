import { notFound } from "next/navigation";
import { getTemplateById } from "@/lib/template";
import { TemplateForm } from "@/components/admin/TemplateForm";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Edit Template
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{template.name}</p>
      </div>
      <TemplateForm initialData={template} />
    </div>
  );
}
