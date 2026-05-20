import type { ComparisonFinding, ComparisonResult } from "@agentlighthouse/core";

const severityStyles = {
  critical: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-900",
  medium: "bg-yellow-100 text-yellow-900",
  low: "bg-slate-100 text-slate-700",
  info: "bg-teal-100 text-teal-800"
};

export function FindingDeltaList({ comparison }: { comparison: ComparisonResult }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Finding Delta</h2>
        <span className="text-sm text-ink/60">
          {comparison.findings.new.length} new, {comparison.findings.resolved.length} resolved
        </span>
      </div>
      <FindingGroup label="New" findings={comparison.findings.new.slice(0, 3)} />
      <FindingGroup label="Resolved" findings={comparison.findings.resolved.slice(0, 3)} />
    </section>
  );
}

function FindingGroup({ label, findings }: { label: string; findings: ComparisonFinding[] }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold uppercase text-ink/60">{label}</h3>
      <div className="mt-2 divide-y divide-black/10">
        {findings.length === 0 ? (
          <p className="py-3 text-sm text-ink/60">No findings in this bucket.</p>
        ) : (
          findings.map((finding) => (
            <article key={`${label}-${finding.fingerprint}`} className="py-3">
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${severityStyles[finding.severity]}`}
              >
                {finding.severity}
              </span>
              <h4 className="mt-2 text-sm font-semibold text-ink">{finding.title}</h4>
              <p className="mt-1 text-sm text-ink/70">{finding.recommendation}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
