import { TemplateForm } from "@/components/admin/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          New Invoice Template
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Save your defaults so you can pre-fill invoices in seconds.
        </p>
      </div>
      <TemplateForm />
    </div>
  );
}
