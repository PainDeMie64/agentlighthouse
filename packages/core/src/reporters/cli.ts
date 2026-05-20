import type { Finding, ScanResult } from "../schemas/types.js";

const severityOrder: Finding["severity"][] = ["critical", "high", "medium", "low", "info"];

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
- Agent failure mode: ${finding.agentFailureMode ?? "n/a"}
- Fix example: ${finding.fixExample ?? "n/a"}
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

Confidence: **${titleCase(result.scoreConfidence)}** (${result.scoreConfidenceScore}/100)

Coverage: **${result.coverage.coveragePercent}%**

## Project Detection

- Type: \`${result.detectedProject.type}\`
- Confidence: ${Math.round(result.detectedProject.confidence * 100)}%
- Package manager: \`${result.detectedProject.packageManager}\`
- Frameworks: ${result.detectedProject.frameworks.length > 0 ? result.detectedProject.frameworks.join(", ") : "none detected"}
- Evidence: ${result.detectedProject.evidence.join("; ")}

## Score Interpretation

- Agent-Readiness Score: ${result.scoreInterpretation.agentReadinessScore}/100
- Human-readable project signals: ${result.scoreInterpretation.humanReadableProjectSignals.score}/100 - ${result.scoreInterpretation.humanReadableProjectSignals.signals.join(", ") || "none detected"}
- Agent-specific context layer: ${result.scoreInterpretation.agentSpecificContextLayer.score}/100 - ${result.scoreInterpretation.agentSpecificContextLayer.signals.join(", ") || "none detected"}
- Verifiability: ${result.scoreInterpretation.verifiability.score}/100 - ${result.scoreInterpretation.verifiability.signals.join(", ") || "none detected"}

## Subscores

${result.subscores.map((subscore) => `- ${subscore.label}: ${subscore.score}/100`).join("\n")}

## API Analysis

- Spec files: ${result.apiAnalysis.specFiles.join(", ") || "none"}
- Operations: ${result.apiAnalysis.operationCount}
- Operations with examples: ${result.apiAnalysis.operationsWithExamples}
- Operations missing descriptions: ${result.apiAnalysis.operationsMissingDescriptions}
- Auth schemes: ${result.apiAnalysis.authSchemes.join(", ") || "none"}
- Destructive operations: ${result.apiAnalysis.destructiveOperations.join("; ") || "none"}
- Weak operations: ${result.apiAnalysis.weakOperations.slice(0, 8).join("; ") || "none"}

## MCP Analysis

- Detected: ${result.mcpAnalysis.detected ? "yes" : "no"}
- Files: ${result.mcpAnalysis.files.join(", ") || "none"}
- Tools: ${result.mcpAnalysis.toolCount}
- Tools with schemas: ${result.mcpAnalysis.toolsWithSchemas}
- Tools with examples: ${result.mcpAnalysis.toolsWithExamples}
- Ambiguous tools: ${result.mcpAnalysis.ambiguousTools.join("; ") || "none"}
- Destructive tools: ${result.mcpAnalysis.destructiveTools.join("; ") || "none"}
- Weak tools: ${result.mcpAnalysis.weakTools.slice(0, 8).join("; ") || "none"}

## Command Probes

- Enabled: ${result.commandProbes.enabled ? "yes" : "no"}
- Attempted: ${result.commandProbes.attempted}
- Passed: ${result.commandProbes.passed}
- Failed: ${result.commandProbes.failed}
- Timed out: ${result.commandProbes.timedOut}
- Skipped: ${result.commandProbes.skipped}

## Coverage

- Evaluated checks: ${result.coverage.evaluatedChecks}
- Skipped checks: ${result.coverage.skippedChecks}
- Not applicable checks: ${result.coverage.notApplicableChecks}
- Not evaluated checks: ${result.coverage.notEvaluatedChecks}
- Evaluated categories: ${result.coverage.evaluatedCategories.join(", ") || "none"}
- Missing categories: ${result.coverage.missingCategories.join(", ") || "none"}

## Scoring Caps

${result.scoringCaps.map((cap) => `- ${cap.id}: max ${cap.maxScore}. ${cap.reason}`).join("\n") || "No scoring caps applied."}

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
