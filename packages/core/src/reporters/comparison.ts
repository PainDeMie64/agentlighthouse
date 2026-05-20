import type { ComparisonFinding, ComparisonResult } from "../schemas/types.js";
import { severityOrder, severityRank, titleCase } from "./shared.js";

export function renderComparisonJsonReport(result: ComparisonResult): string {
  return JSON.stringify(result, null, 2);
}

export function renderComparisonCliReport(result: ComparisonResult): string {
  const lines: string[] = [];
  lines.push(`AgentLighthouse PR Delta: ${titleCase(result.summary.verdict)}`);
  lines.push(
    `Score: ${result.baseline.score} -> ${result.current.score} (${formatDelta(result.deltas.scoreDelta)})`
  );
  lines.push(
    `Confidence: ${result.baseline.confidence} -> ${result.current.confidence} (${formatDelta(result.deltas.confidenceDelta)})`
  );
  lines.push(
    `Coverage: ${result.baseline.coverage}% -> ${result.current.coverage}% (${formatDelta(result.deltas.coverageDelta)}%)`
  );
  lines.push("");
  lines.push(`New findings: ${result.findings.new.length}`);
  lines.push(`Resolved findings: ${result.findings.resolved.length}`);
  lines.push(`Worsened findings: ${result.findings.worsened.length}`);
  lines.push(`Improved findings: ${result.findings.improved.length}`);
  lines.push(`Unchanged findings: ${result.findings.unchanged.length}`);
  if (result.summary.recommendedActions.length > 0) {
    lines.push("");
    lines.push("Recommended actions:");
    result.summary.recommendedActions.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
  }
  if (result.summary.caveats.length > 0) {
    lines.push("");
    lines.push("Caveats:");
    result.summary.caveats.forEach((caveat) => lines.push(`- ${caveat}`));
  }
  return lines.join("\n");
}

export function renderComparisonMarkdownReport(result: ComparisonResult): string {
  return `# AgentLighthouse Comparison Report

Verdict: **${titleCase(result.summary.verdict)}**

AgentLighthouse compares **agent-readiness**, not general software quality. A score regression means agents have less usable context, weaker verifiability, or new semantic risk under the selected profile.

## Delta Summary

| Metric | Baseline | Current | Delta |
| --- | ---: | ---: | ---: |
| Score | ${result.baseline.score} | ${result.current.score} | ${formatDelta(result.deltas.scoreDelta)} |
| Confidence score | ${result.baseline.confidenceScore} | ${result.current.confidenceScore} | ${formatDelta(result.deltas.confidenceDelta)} |
| Coverage | ${result.baseline.coverage}% | ${result.current.coverage}% | ${formatDelta(result.deltas.coverageDelta)}% |
| Findings | ${totalFindings(result, "baseline")} | ${totalFindings(result, "current")} | ${formatDelta(result.deltas.findingCountDelta)} |

## Severity Count Deltas

| Severity | Delta |
| --- | ---: |
${severityOrder.map((severity) => `| ${severity} | ${formatDelta(result.deltas.severityCountDeltas[severity] ?? 0)} |`).join("\n")}

## New Findings

${renderFindingList(result.findings.new)}

## Resolved Findings

${renderFindingList(result.findings.resolved)}

## Worsened Findings

${renderFindingList(result.findings.worsened)}

## Improved Findings

${renderFindingList(result.findings.improved)}

## Unchanged

${result.findings.unchanged.length} finding(s) remained unchanged.

## Recommended Actions

${result.summary.recommendedActions.map((action, index) => `${index + 1}. ${action}`).join("\n") || "No comparison-specific actions."}

## Caveats

${result.summary.caveats.map((caveat) => `- ${caveat}`).join("\n") || "No caveats."}

## Metadata

- Baseline scan: \`${result.baseline.scanId}\` (${result.baseline.completedAt})
- Current scan: \`${result.current.scanId}\` (${result.current.completedAt})
- Baseline profile: \`${result.baseline.profile}\`
- Current profile: \`${result.current.profile}\`
- Comparison model: \`${result.metadata.comparisonModelVersion}\`
`;
}

export function renderComparisonPrSummaryReport(
  result: ComparisonResult,
  options: { status?: "passed" | "failed"; reasons?: string[]; reportPaths?: string[] } = {}
): string {
  const newHighRisk = result.findings.new.filter(
    (finding) => severityRank(finding.severity) >= severityRank("high")
  );
  return `## AgentLighthouse PR Delta: ${titleCase(result.summary.verdict)}

**Status:** ${options.status === "failed" ? "Failed" : "Passed"}

Score: **${result.baseline.score} -> ${result.current.score}** (${formatDelta(result.deltas.scoreDelta)})
Confidence: **${result.baseline.confidence} -> ${result.current.confidence}** (${formatDelta(result.deltas.confidenceDelta)})
Coverage: **${result.baseline.coverage}% -> ${result.current.coverage}%** (${formatDelta(result.deltas.coverageDelta)}%)

${options.reasons && options.reasons.length > 0 ? `### Gate Result\n\n${options.reasons.map((reason) => `- ${reason}`).join("\n")}\n` : ""}
### New High-Severity Findings

${renderFindingList(newHighRisk.slice(0, 5))}

### Top New Findings

${renderFindingList(result.findings.new.slice(0, 5))}

### Top Resolved Findings

${renderFindingList(result.findings.resolved.slice(0, 5))}

### Recommended Actions

${
  result.summary.recommendedActions
    .slice(0, 5)
    .map((action, index) => `${index + 1}. ${action}`)
    .join("\n") || "No comparison-specific actions."
}

### Reports

${options.reportPaths?.map((reportPath) => `- ${reportPath}`).join("\n") || "No comparison report artifact path was provided."}
`;
}

function renderFindingList(findings: ComparisonFinding[]): string {
  if (findings.length === 0) {
    return "None.";
  }
  return findings
    .map((finding, index) => {
      const severityChange =
        finding.previousSeverity && finding.currentSeverity
          ? ` (${finding.previousSeverity} -> ${finding.currentSeverity})`
          : "";
      return `${index + 1}. **${finding.severity}** \`${finding.ruleId}\`: ${finding.title}${severityChange}${finding.affectedFile ? ` (${finding.affectedFile})` : ""}`;
    })
    .join("\n");
}

function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function totalFindings(result: ComparisonResult, side: "baseline" | "current"): number {
  if (side === "baseline") {
    return (
      result.findings.resolved.length +
      result.findings.unchanged.length +
      result.findings.worsened.length +
      result.findings.improved.length
    );
  }
  return (
    result.findings.new.length +
    result.findings.unchanged.length +
    result.findings.worsened.length +
    result.findings.improved.length
  );
}
