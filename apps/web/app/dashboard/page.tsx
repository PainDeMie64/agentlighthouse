import { sampleScanResult } from "@agentlighthouse/core";
import { FindingList } from "../../components/FindingList";
import { ProductHeader } from "../../components/ProductHeader";
import { RecommendationList } from "../../components/RecommendationList";
import { ScoreCard } from "../../components/ScoreCard";
import { SubscoreGrid } from "../../components/SubscoreGrid";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-paper">
      <ProductHeader />
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-harbor">Demo dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">
            Agent-readiness report
          </h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <ScoreCard result={sampleScanResult} />
            <SubscoreGrid result={sampleScanResult} />
            <FindingList result={sampleScanResult} />
          </div>
          <RecommendationList result={sampleScanResult} />
        </div>
      </section>
    </main>
  );
}
