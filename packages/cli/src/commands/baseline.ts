import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderJsonReport, scanProject } from "@agentlighthouse/core";
import type { ScanProfile } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";
import { readScanResultFile } from "./compare.js";

export interface BaselineCreateOptions {
  output?: string;
  profile?: ScanProfile;
}

export interface BaselineValidateOptions {
  json?: boolean;
}

export async function runBaselineCreateCommand(
  targetPath: string,
  options: BaselineCreateOptions
): Promise<void> {
  const output = options.output ?? "agentlighthouse-baseline.json";
  const outputPath = resolveFromInvocationCwd(output);
  const result = await scanProject(resolveFromInvocationCwd(targetPath), {
    profile: options.profile
  });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderJsonReport(result), "utf8");

  process.stdout.write(
    [
      "AgentLighthouse baseline created.",
      `Output: ${output}`,
      `Score: ${result.score}/100`,
      `Confidence: ${result.scoreConfidence} (${result.scoreConfidenceScore}/100)`,
      `Coverage: ${result.coverage.coveragePercent}%`,
      `Profile: ${result.profile}`,
      "",
      "A baseline is a normal scan-result JSON file. Commit or update it intentionally when the team accepts the current agent-readiness state."
    ].join("\n") + "\n"
  );
}

export async function runBaselineValidateCommand(
  baselinePath: string,
  options: BaselineValidateOptions = {}
): Promise<void> {
  void options;
  const result = await readScanResultFile(baselinePath);
  process.stdout.write(`${baselineSummary(result, baselinePath)}\n`);
}

export async function runBaselineSummaryCommand(baselinePath: string): Promise<void> {
  const result = await readScanResultFile(baselinePath);
  process.stdout.write(`${baselineSummary(result, baselinePath)}\n`);
}

function baselineSummary(
  result: Awaited<ReturnType<typeof scanProject>>,
  baselinePath: string
): string {
  const severityCounts = result.findings.reduce<Record<string, number>>((counts, finding) => {
    counts[finding.severity] = (counts[finding.severity] ?? 0) + 1;
    return counts;
  }, {});
  return [
    `AgentLighthouse baseline: ${baselinePath}`,
    `Scan ID: ${result.scanId}`,
    `Project: ${result.projectName ?? result.detectedProject.name ?? result.scannedPath}`,
    `Score: ${result.score}/100`,
    `Confidence: ${result.scoreConfidence} (${result.scoreConfidenceScore}/100)`,
    `Coverage: ${result.coverage.coveragePercent}%`,
    `Profile: ${result.profile}`,
    `Completed: ${result.completedAt}`,
    `AgentLighthouse version: ${result.agentLighthouseVersion}`,
    `Scoring model: ${result.scoringModelVersion}`,
    `Findings: ${result.findings.length}`,
    `Severity counts: ${Object.entries(severityCounts)
      .map(([severity, count]) => `${severity}=${count}`)
      .join(", ")}`
  ].join("\n");
}
