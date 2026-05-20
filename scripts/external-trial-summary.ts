import { readdir } from "node:fs/promises";
import path from "node:path";
import { scanProject } from "@agentlighthouse/core";
import { externalTrialReportPath, repoRoot, writeMarkdownReport } from "./release-utils.js";

type ExternalTrial = {
  name: string;
  score: number;
  confidence: string;
  coverage: number;
  topFindings: Array<{ severity: string; ruleId: string; title: string }>;
  fairnessNote: string;
};

const validationRoot = path.join(repoRoot, ".tmp", "validation-repos");
const trials: ExternalTrial[] = [];

try {
  const entries = await readdir(validationRoot, { withFileTypes: true });
  for (const entry of entries.filter((candidate) => candidate.isDirectory()).slice(0, 5)) {
    const result = await scanProject(path.join(validationRoot, entry.name));
    trials.push({
      name: entry.name,
      score: result.score,
      confidence: result.scoreConfidence,
      coverage: result.coverage.coveragePercent,
      topFindings: result.findings.slice(0, 3).map((finding) => ({
        severity: finding.severity,
        ruleId: finding.ruleId,
        title: finding.title
      })),
      fairnessNote:
        result.score < 40
          ? "Low scores usually reflect missing agent-specific context, task benchmarks, or machine-readable workflows rather than general software quality."
          : "The result looks plausible for alpha calibration; review findings before using as a hard quality gate."
    });
  }
} catch {
  // External validation repositories are optional and intentionally not committed.
}

await writeMarkdownReport(
  externalTrialReportPath,
  [
    "# External Trial Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This report summarizes public or local repositories scanned from `.tmp/validation-repos/` without committing third-party source code or full external reports.",
    "",
    ...(trials.length > 0
      ? [
          "| Repository | Score | Confidence | Coverage | Top Findings | Fairness Note |",
          "| --- | ---: | --- | ---: | --- | --- |",
          ...trials.map(
            (trial) =>
              `| \`${trial.name}\` | ${trial.score}/100 | ${trial.confidence} | ${trial.coverage}% | ${formatFindings(trial.topFindings)} | ${trial.fairnessNote} |`
          )
        ]
      : [
          "No external repositories were available under `.tmp/validation-repos/`.",
          "",
          "Manual trial command:",
          "",
          "```bash",
          "git clone https://github.com/<owner>/<repo>.git .tmp/validation-repos/<repo>",
          "pnpm --filter @agentlighthouse/cli dev scan .tmp/validation-repos/<repo> --format markdown --output validation/reports/external/<repo>.md",
          "```"
        ]),
    "",
    "## Notes",
    "",
    "- External source code is not committed.",
    "- Full external reports should be reviewed for sensitive paths before committing.",
    "- Low agent-readiness scores are expected for mature projects that have not added agent-specific context files yet.",
    ""
  ].join("\n")
);

function formatFindings(findings: ExternalTrial["topFindings"]): string {
  if (findings.length === 0) {
    return "None";
  }
  return findings
    .map((finding) => `${finding.severity} ${finding.ruleId}: ${finding.title}`)
    .join("<br>");
}
