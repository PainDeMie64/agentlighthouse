import type { Finding, ScanResult } from "../schemas/types.js";

const severityOrder: Finding["severity"][] = ["critical", "high", "medium", "low", "info"];

export function renderCliReport(result: ScanResult, color = false): string {
  const lines: string[] = [];
  lines.push(`AgentLighthouse Score: ${result.score}/100`);
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
    }
    lines.push("");
  }
  if (result.recommendedActions.length > 0) {
    lines.push("Recommended next actions:");
    result.recommendedActions.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
  }
  const report = lines.join("\n").trimEnd();
  return color ? report : report;
}

export function renderMarkdownReport(result: ScanResult): string {
  const findings = result.findings
    .map(
      (finding) => `### ${finding.title}

- Severity: ${finding.severity}
- Category: ${finding.category}
- Affected file: ${finding.affectedFile ?? "n/a"}
- Recommendation: ${finding.recommendation}
- Evidence: ${finding.evidence.join("; ")}
`
    )
    .join("\n");

  return `# AgentLighthouse Report: ${result.projectName}

Score: **${result.score}/100**

${result.summary}

## Subscores

${result.subscores.map((subscore) => `- ${subscore.label}: ${subscore.score}/100`).join("\n")}

## Recommended Actions

${result.recommendedActions.map((action, index) => `${index + 1}. ${action}`).join("\n")}

## Findings

${findings}
`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
