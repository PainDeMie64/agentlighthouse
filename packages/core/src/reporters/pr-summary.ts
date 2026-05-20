import type { ScanResult } from "../schemas/types.js";
import { titleCase, topActionableFindings } from "./shared.js";

export interface PrSummaryOptions {
  status?: "passed" | "failed";
  reasons?: string[];
  reportPaths?: string[];
}

export function renderPrSummaryReport(result: ScanResult, options: PrSummaryOptions = {}): string {
  const status = options.status ?? "passed";
  const findings = topActionableFindings(result.findings, 5);
  const reportPaths = options.reportPaths ?? [];
  return `## AgentLighthouse PR Summary

**Status:** ${status === "passed" ? "Passed" : "Failed"}

AgentLighthouse measures **agent-readiness**, not general software quality. It checks whether AI coding agents have enough context, examples, API/tool semantics, and verifiable workflows to use this project safely.

- Score: **${result.score}/100**
- Confidence: **${titleCase(result.scoreConfidence)}** (${result.scoreConfidenceScore}/100)
- Coverage: **${result.coverage.coveragePercent}%**
- Profile: \`${result.profile}\`
- Project type: \`${result.detectedProject.type}\`

${options.reasons && options.reasons.length > 0 ? `### Gate Result\n\n${options.reasons.map((reason) => `- ${reason}`).join("\n")}\n` : ""}
### Top Findings

${findings.map((finding) => `- **${finding.severity}** \`${finding.ruleId}\`: ${finding.title}${finding.affectedFile ? ` (${finding.affectedFile})` : ""}`).join("\n") || "No non-informational findings."}

### Recommended Next Actions

${
  result.recommendations
    .slice(0, 5)
    .map((action, index) => `${index + 1}. ${action}`)
    .join("\n") || "No prioritized actions."
}

### Reports

${reportPaths.map((reportPath) => `- ${reportPath}`).join("\n") || "No external report artifact path was provided."}

### What Changed

Diff comparison is planned for a future baseline mode. For now, compare this summary with the saved baseline report or previous CI artifact.
`;
}
