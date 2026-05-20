import type { ComparisonResult } from "@agentlighthouse/core";

export function PrImpactSummary({ comparison }: { comparison: ComparisonResult }) {
  const impact = comparison.prImpact;
  if (!impact) {
    return null;
  }

  const rows = [
    ["Changed files", impact.changedFileCount],
    ["New on changed files", impact.newFindingsOnChangedFiles.length],
    ["Resolved on changed files", impact.resolvedFindingsOnChangedFiles.length],
    ["New global findings", impact.globalNewFindings.length],
    ["Unknown-location findings", impact.unknownLocationFindings.length]
  ];

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">PR Impact</h2>
      <p className="mt-2 text-sm text-ink/70">{impact.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase text-ink/50">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
