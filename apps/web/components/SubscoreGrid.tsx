import type { ScanResult } from "@agentlighthouse/core";

export function SubscoreGrid({ result }: { result: ScanResult }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {result.subscores.map((subscore) => (
        <div key={subscore.id} className="rounded-lg border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">{subscore.label}</h3>
            <span className="text-sm font-semibold text-harbor">{subscore.score}/100</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-harbor"
              style={{ width: `${subscore.score}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
