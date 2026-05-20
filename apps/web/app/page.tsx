import Link from "next/link";
import { ArrowRight, Github, Terminal } from "lucide-react";
import { sampleScanResult } from "@agentlighthouse/core";
import { FindingList } from "../components/FindingList";
import { ProductHeader } from "../components/ProductHeader";
import { RecommendationList } from "../components/RecommendationList";
import { ScoreCard } from "../components/ScoreCard";
import { SubscoreGrid } from "../components/SubscoreGrid";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      <ProductHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-harbor">Lighthouse for AI agents</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-normal text-ink md:text-6xl">
            AgentLighthouse
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
            Scan repos, docs, API specs, MCP tools, and agent instruction files to learn whether
            real coding agents can understand and complete your developer workflows.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-harbor px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              View demo dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="https://github.com/PainDeMie64/agentlighthouse"
              className="inline-flex items-center gap-2 rounded-md border border-black/15 px-4 py-3 text-sm font-semibold text-ink hover:bg-white"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>
        <ScoreCard result={sampleScanResult} />
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-4">
          {["Agent instructions", "Docs and APIs", "Task benchmarks", "PR-ready fixes"].map(
            (item) => (
              <div key={item}>
                <p className="text-sm font-semibold text-ink">{item}</p>
                <div className="mt-3 h-1 w-16 rounded-full bg-signal" />
              </div>
            )
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <SubscoreGrid result={sampleScanResult} />
          <FindingList result={sampleScanResult} />
        </div>
        <div className="space-y-6">
          <RecommendationList result={sampleScanResult} />
          <section id="cli" className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-harbor" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Run Locally</h2>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-md bg-ink p-4 text-sm leading-6 text-white">
              <code>{`pnpm --filter @agentlighthouse/cli dev scan .
pnpm --filter @agentlighthouse/cli dev init . --dry-run
pnpm validate:realworld`}</code>
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}
