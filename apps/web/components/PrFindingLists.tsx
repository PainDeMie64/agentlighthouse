import type { ComparisonFinding } from "@agentlighthouse/core";

const severityStyles = {
  critical: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-900",
  medium: "bg-yellow-100 text-yellow-900",
  low: "bg-slate-100 text-slate-700",
  info: "bg-teal-100 text-teal-800"
};

export function ChangedFindingList({ findings }: { findings: ComparisonFinding[] }) {
  return <FindingPanel title="New Findings On Changed Files" findings={findings} />;
}

export function GlobalFindingList({ findings }: { findings: ComparisonFinding[] }) {
  return <FindingPanel title="New Global Findings" findings={findings} />;
}

function FindingPanel({ title, findings }: { title: string; findings: ComparisonFinding[] }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 divide-y divide-black/10">
        {findings.length === 0 ? (
          <p className="py-3 text-sm text-ink/60">No findings in this bucket.</p>
        ) : (
          findings.slice(0, 4).map((finding) => (
            <article key={`${title}-${finding.fingerprint}`} className="py-3">
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${severityStyles[finding.severity]}`}
              >
                {finding.severity}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-ink">{finding.title}</h3>
              <p className="mt-1 text-xs font-mono text-ink/50">
                {finding.location?.file ?? finding.affectedFile ?? "project-level"}
                {finding.subject ? `, ${finding.subject}` : ""}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
