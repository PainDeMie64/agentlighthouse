import type { ScanResult } from "@agentlighthouse/core";

export function SemanticSummary({ result }: { result: ScanResult }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Semantic Analysis</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SummaryBlock
          title="Human Signals"
          score={result.scoreInterpretation.humanReadableProjectSignals.score}
          lines={result.scoreInterpretation.humanReadableProjectSignals.signals}
        />
        <SummaryBlock
          title="Agent Context"
          score={result.scoreInterpretation.agentSpecificContextLayer.score}
          lines={result.scoreInterpretation.agentSpecificContextLayer.signals}
        />
        <SummaryBlock
          title="Verifiability"
          score={result.scoreInterpretation.verifiability.score}
          lines={result.scoreInterpretation.verifiability.signals}
        />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Metric label="API operations" value={String(result.apiAnalysis.operationCount)} />
        <Metric label="MCP tools" value={String(result.mcpAnalysis.toolCount)} />
        <Metric
          label="Command probes"
          value={result.commandProbes.enabled ? `${result.commandProbes.passed} passed` : "off"}
        />
      </div>
    </section>
  );
}

function SummaryBlock({ title, score, lines }: { title: string; score: number; lines: string[] }) {
  return (
    <div className="rounded border border-black/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className="text-sm font-semibold text-harbor">{score}/100</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-ink/65">{lines.slice(0, 3).join(", ") || "none"}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded bg-cream px-3 py-2 text-sm">
      <span className="text-ink/70">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
