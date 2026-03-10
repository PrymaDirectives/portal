export function ToolsUsed({ tools }: { tools: string[] }) {
  if (!tools || tools.length === 0) return null;
  return (
    <div className="invoice-section">
      <p className="invoice-label mb-3">Tools &amp; Infrastructure Used</p>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <span
            key={tool}
            className="inline-block rounded-sm border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 bg-neutral-50"
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}
