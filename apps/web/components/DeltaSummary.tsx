import type { ComparisonResult } from "@agentlighthouse/core";

export function DeltaSummary({ comparison }: { comparison: ComparisonResult }) {
  const rows = [
    ["Confidence", comparison.baseline.confidence, comparison.current.confidence],
    ["Coverage", `${comparison.baseline.coverage}%`, `${comparison.current.coverage}%`],
    ["New findings", "0", String(comparison.findings.new.length)],
    ["Resolved findings", "0", String(comparison.findings.resolved.length)]
  ];

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Comparison Summary</h2>
      <div className="mt-4 divide-y divide-black/10">
        {rows.map(([label, baseline, current]) => (
          <div key={label} className="grid grid-cols-[1fr_auto_auto] gap-4 py-3 text-sm">
            <span className="font-medium text-ink">{label}</span>
            <span className="text-ink/60">{baseline}</span>
            <span className="font-semibold text-ink">{current}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
