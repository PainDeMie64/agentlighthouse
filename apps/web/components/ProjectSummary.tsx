import type { ScanResult } from "@agentlighthouse/core";

export function ProjectSummary({ result }: { result: ScanResult }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Project Detection</h2>
      <div className="mt-4 grid gap-3 text-sm text-ink/72">
        <div className="flex justify-between gap-4">
          <span>Type</span>
          <span className="font-semibold text-ink">{result.detectedProject.type}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Confidence</span>
          <span className="font-semibold text-ink">
            {Math.round(result.detectedProject.confidence * 100)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Package manager</span>
          <span className="font-semibold text-ink">{result.detectedProject.packageManager}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Score confidence</span>
          <span className="font-semibold text-ink">
            {result.scoreConfidence} ({result.scoreConfidenceScore}/100)
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Coverage</span>
          <span className="font-semibold text-ink">{result.coverage.coveragePercent}%</span>
        </div>
        <div>
          <span>Evidence</span>
          <p className="mt-1 leading-6 text-ink/70">{result.detectedProject.evidence.join(" ")}</p>
        </div>
      </div>
    </section>
  );
}
