import type { ComparisonResult } from "@agentlighthouse/core";

export function ScoreDeltaCard({ comparison }: { comparison: ComparisonResult }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <p className="text-sm font-medium uppercase text-harbor">PR delta</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <span className="text-3xl font-semibold text-ink">{comparison.baseline.score}</span>
        <span className="pb-1 text-sm font-semibold text-ink/50">to</span>
        <span className="text-3xl font-semibold text-ink">{comparison.current.score}</span>
        <span
          className={`mb-1 rounded px-2 py-1 text-xs font-semibold ${
            comparison.deltas.scoreDelta >= 0 ? "bg-teal-50 text-harbor" : "bg-red-100 text-red-800"
          }`}
        >
          {comparison.deltas.scoreDelta >= 0 ? "+" : ""}
          {comparison.deltas.scoreDelta}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Verdict: <span className="font-semibold text-ink">{comparison.summary.verdict}</span>
      </p>
    </section>
  );
}
