import type { ScanResult } from "@agentlighthouse/core";
import { CheckCircle2 } from "lucide-react";

export function RecommendationList({ result }: { result: ScanResult }) {
  return (
    <section className="rounded-lg border border-black/10 bg-ink p-5 text-white">
      <h2 className="text-lg font-semibold">Recommended Fixes</h2>
      <div className="mt-4 space-y-3">
        {result.recommendedActions.map((action) => (
          <div key={action} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-signal" aria-hidden="true" />
            <p className="text-sm leading-6 text-white/82">{action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
