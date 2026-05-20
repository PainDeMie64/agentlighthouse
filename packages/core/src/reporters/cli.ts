import type { Finding, ScanResult } from "../schemas/types.js";

const severityOrder: Finding["severity"][] = ["critical", "high", "medium", "low", "info"];

export function renderCliReport(result: ScanResult, color = false): string {
  const lines: string[] = [];
  lines.push(`AgentLighthouse Score: ${result.score}/100`);
  lines.push(`Project: ${result.detectedProject.name} (${result.detectedProject.type})`);
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
  if (result.recommendations.length > 0) {
    lines.push("Recommended next actions:");
    result.recommendations.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
  }
  const report = lines.join("\n").trimEnd();
  return color ? report : report;
}

export function renderMarkdownReport(result: ScanResult): string {
  const topFindings = result.findings
    .filter((finding) => finding.severity !== "info")
    .slice(0, 5)
    .map(
      (finding) =>
        `- **${finding.severity}**: ${finding.title}${finding.affectedFile ? ` (${finding.affectedFile})` : ""}`
    )
    .join("\n");
  const groupedFindings = severityOrder
    .map((severity) => {
      const findings = result.findings.filter((finding) => finding.severity === severity);
      if (findings.length === 0) {
        return "";
      }
      return `### ${titleCase(severity)}

${findings
  .map(
    (finding) => `#### ${finding.title}

- Severity: ${finding.severity}
- Category: ${finding.category}
- Affected file: ${finding.affectedFile ?? "n/a"}
- Recommendation: ${finding.recommendation}
- Evidence: ${finding.evidence.join("; ")}
`
  )
  .join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");
  const artifactTable = result.detectedArtifacts
    .map(
      (artifact) =>
        `| ${artifact.path} | ${artifact.exists ? "yes" : "no"} | ${artifact.kind} | ${artifact.quality} | ${artifact.role} |`
    )
    .join("\n");

  return `# AgentLighthouse Report: ${result.projectName}

Score: **${result.score}/100**

${result.summary}

## Project Detection

- Type: \`${result.detectedProject.type}\`
- Confidence: ${Math.round(result.detectedProject.confidence * 100)}%
- Package manager: \`${result.detectedProject.packageManager}\`
- Frameworks: ${result.detectedProject.frameworks.length > 0 ? result.detectedProject.frameworks.join(", ") : "none detected"}
- Evidence: ${result.detectedProject.evidence.join("; ")}

## Subscores

${result.subscores.map((subscore) => `- ${subscore.label}: ${subscore.score}/100`).join("\n")}

## Top Findings

${topFindings || "No non-informational findings."}

## Recommended Actions

${result.recommendations.map((action, index) => `${index + 1}. ${action}`).join("\n") || "No prioritized actions."}

## Detected Artifacts

| Path | Exists | Kind | Quality | Role |
| --- | --- | --- | --- | --- |
${artifactTable}

## Scan Metadata

- Scan ID: \`${result.scanId}\`
- AgentLighthouse version: \`${result.agentLighthouseVersion}\`
- Scoring model: \`${result.scoringModelVersion}\`
- Started: ${result.startedAt}
- Completed: ${result.completedAt}
- Duration: ${result.durationMs}ms
- Files scanned: ${result.scanStats.filesScanned}
- Text files read: ${result.scanStats.textFilesRead}
- Ignored paths observed: ${result.ignoredPaths.length}
- Warnings: ${result.warnings.length}
- Errors: ${result.errors.length}

## Findings

${groupedFindings || "No findings."}
`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
