import type { ScanResult } from "@agentlighthouse/core";

const severityStyles = {
  critical: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-900",
  medium: "bg-yellow-100 text-yellow-900",
  low: "bg-slate-100 text-slate-700",
  info: "bg-teal-100 text-teal-800"
};

export function FindingList({ result }: { result: ScanResult }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Sample Findings</h2>
        <span className="text-sm text-ink/60">{result.findings.length} findings</span>
      </div>
      <div className="mt-4 divide-y divide-black/10">
        {result.findings.map((finding) => (
          <article key={finding.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${severityStyles[finding.severity]}`}
              >
                {finding.severity}
              </span>
              <span className="text-xs text-ink/60">{finding.category}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-ink">{finding.title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink/70">{finding.description}</p>
            <p className="mt-2 text-sm font-medium text-harbor">{finding.recommendation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
