import type { ScanResult } from "@agentlighthouse/core";

export function ScoreCard({ result }: { result: ScanResult }) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <section className="rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase text-harbor">Agent-readiness score</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-normal text-ink">
            {result.score}/100
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink/70">{result.summary}</p>
        </div>
        <svg
          className="h-32 w-32 shrink-0"
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${result.score} out of 100`}
        >
          <circle cx="60" cy="60" r="46" fill="none" stroke="#e5e0d5" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#0f766e"
            strokeLinecap="round"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="66" textAnchor="middle" className="fill-ink text-xl font-semibold">
            {result.score}
          </text>
        </svg>
      </div>
    </section>
  );
}
