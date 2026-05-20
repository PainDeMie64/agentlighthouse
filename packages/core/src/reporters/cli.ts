import type { ScanResult } from "../schemas/types.js";
import { severityOrder, titleCase } from "./shared.js";

export { renderMarkdownReport } from "./markdown.js";

export function renderCliReport(result: ScanResult, color = false): string {
  const lines: string[] = [];
  lines.push(`AgentLighthouse Score: ${result.score}/100`);
  lines.push(
    `Confidence: ${titleCase(result.scoreConfidence)} (${result.scoreConfidenceScore}/100)`
  );
  lines.push(`Coverage: ${result.coverage.coveragePercent}%`);
  lines.push(`Project: ${result.detectedProject.name} (${result.detectedProject.type})`);
  lines.push(
    `Human signals: ${result.scoreInterpretation.humanReadableProjectSignals.score}/100 | Agent context: ${result.scoreInterpretation.agentSpecificContextLayer.score}/100 | Verifiability: ${result.scoreInterpretation.verifiability.score}/100`
  );
  lines.push("");
  lines.push("Subscores:");
  for (const subscore of result.subscores) {
    lines.push(`- ${subscore.label}: ${subscore.score}/100`);
  }
  lines.push("");
  lines.push(result.summary);
  lines.push("");
  for (const severity of severityOrder) {
    const findings = result.findings.filter((finding) => finding.severity === severity);
    if (findings.length === 0) {
      continue;
    }
    lines.push(`${titleCase(severity)} severity:`);
    for (const finding of findings) {
      const affected = finding.affectedFile ? ` (${finding.affectedFile})` : "";
      lines.push(`- ${finding.title}${affected}`);
      lines.push(`  ${finding.recommendation}`);
      if (finding.agentFailureMode) {
        lines.push(`  Agent failure mode: ${finding.agentFailureMode}`);
      }
    }
    lines.push("");
  }
  if (result.recommendations.length > 0) {
    lines.push("Recommended next actions:");
    result.recommendations.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
  }
  const report = lines.join("\n").trimEnd();
  return color ? report : report;
}
