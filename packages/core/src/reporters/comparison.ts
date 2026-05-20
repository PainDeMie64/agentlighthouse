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
  if (result.prImpact) {
    lines.push("");
    lines.push(`PR impact: ${result.prImpact.summary}`);
  }
  return lines.join("\n");
}

export function renderComparisonMarkdownReport(
  result: ComparisonResult,
  options: { status?: "passed" | "failed"; reasons?: string[] } = {}
): string {
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

${renderPrImpactMarkdown(result)}

## Gate Status

${renderGateStatus(options)}

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
  const impact = result.prImpact;
  return `## AgentLighthouse PR Delta: ${titleCase(result.summary.verdict)}

**Status:** ${options.status === "failed" ? "Failed" : "Passed"}

Score: **${result.baseline.score} -> ${result.current.score}** (${formatDelta(result.deltas.scoreDelta)})
Confidence: **${result.baseline.confidence} -> ${result.current.confidence}** (${formatDelta(result.deltas.confidenceDelta)})
Coverage: **${result.baseline.coverage}% -> ${result.current.coverage}%** (${formatDelta(result.deltas.coverageDelta)}%)
${impact ? `Changed files analyzed: **${impact.changedFileCount}**\n` : ""}

${options.reasons && options.reasons.length > 0 ? `### Gate Result\n\n${options.reasons.map((reason) => `- ${reason}`).join("\n")}\n` : ""}
${impact ? `### New Findings On Changed Files\n\n${renderFindingList(impact.newFindingsOnChangedFiles.slice(0, 5))}\n\n### Resolved Findings On Changed Files\n\n${renderFindingList(impact.resolvedFindingsOnChangedFiles.slice(0, 5))}\n\n### New Global Findings\n\n${renderFindingList(impact.globalNewFindings.slice(0, 5))}\n` : ""}
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

function renderPrImpactMarkdown(result: ComparisonResult): string {
  const impact = result.prImpact;
  if (!impact) {
    return "";
  }
  return `## PR Impact Summary

${impact.summary}

| Bucket | Count |
| --- | ---: |
| Changed files | ${impact.changedFileCount} |
| New findings on changed files | ${impact.newFindingsOnChangedFiles.length} |
| Resolved findings on changed files | ${impact.resolvedFindingsOnChangedFiles.length} |
| New global findings | ${impact.globalNewFindings.length} |
| Unknown-location findings | ${impact.unknownLocationFindings.length} |
| Unrelated existing findings | ${impact.unrelatedExistingFindings.length} |

## Changed Files

${impact.changedFiles.map((file) => `- ${file.status}: ${file.oldPath ? `${file.oldPath} -> ` : ""}${file.path}`).join("\n") || "None."}

## New Findings On Changed Files

${renderFindingList(impact.newFindingsOnChangedFiles)}

## Resolved Findings On Changed Files

${renderFindingList(impact.resolvedFindingsOnChangedFiles)}

## New Global Findings

${renderFindingList(impact.globalNewFindings)}

## Unknown-Location Findings

${renderFindingList(impact.unknownLocationFindings)}

## Unrelated Existing Findings Summary

${impact.unrelatedExistingFindings.length} unchanged finding(s) are outside the changed-file set.`;
}

function renderGateStatus(options: { status?: "passed" | "failed"; reasons?: string[] }): string {
  if (!options.status) {
    return "No comparison gate status was provided.";
  }
  const status = options.status === "failed" ? "Failed" : "Passed";
  const reasons =
    options.reasons && options.reasons.length > 0
      ? `\n\n${options.reasons.map((reason) => `- ${reason}`).join("\n")}`
      : "";
  return `**${status}**${reasons}`;
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
      return `${index + 1}. **${finding.severity}** \`${finding.ruleId}\`: ${finding.title}${severityChange}${formatFindingLocation(finding)}`;
    })
    .join("\n");
}

function formatFindingLocation(finding: ComparisonFinding): string {
  const file = finding.location?.file ?? finding.affectedFile;
  if (!file) return "";
  const line = finding.location?.startLine ? `:${finding.location.startLine}` : "";
  const subject = finding.subject ?? finding.location?.subject;
  return ` (${file}${line}${subject ? `, ${subject}` : ""})`;
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
