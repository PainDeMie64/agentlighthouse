const commands = [
  ["Scan", "agentlighthouse scan . --report-dir agentlighthouse-reports"],
  ["Baseline", "agentlighthouse baseline create . --output agentlighthouse-baseline.json"],
  [
    "Compare",
    "agentlighthouse scan . --baseline agentlighthouse-baseline.json --comparison-output agentlighthouse-delta.md"
  ],
  [
    "PR gate",
    "agentlighthouse scan . --baseline agentlighthouse-baseline.json --git-base origin/main --git-head HEAD --fail-on-pr-regression"
  ]
];

const artifacts = [
  "agentlighthouse-reports/scan.json",
  "agentlighthouse-reports/scan.md",
  "agentlighthouse-reports/scan.sarif",
  "agentlighthouse-reports/pr-summary.md",
  "agentlighthouse-reports/comparison-pr-summary.md"
];

export function WorkflowDemo() {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Workflow</h2>
      <div className="mt-4 space-y-3">
        {commands.map(([label, command]) => (
          <div key={label} className="rounded border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase text-ink/50">{label}</p>
            <code className="mt-1 block break-words text-sm text-ink">{command}</code>
          </div>
        ))}
      </div>
      <h3 className="mt-5 text-sm font-semibold uppercase text-ink/60">Report bundle</h3>
      <ul className="mt-2 space-y-1 text-sm text-ink/70">
        {artifacts.map((artifact) => (
          <li key={artifact} className="font-mono">
            {artifact}
          </li>
        ))}
      </ul>
    </section>
  );
}
