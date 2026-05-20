import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  compareScanResults,
  parseChangedFilesText,
  parseGitNameStatus,
  renderComparisonCliReport,
  renderComparisonJsonReport,
  renderComparisonMarkdownReport,
  renderComparisonPrSummaryReport,
  scanResultSchema,
  severityRank
} from "@agentlighthouse/core";
import type { ChangedFile, ComparisonResult, Severity } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";

export type CompareFormat = "text" | "json" | "markdown" | "pr-summary";

const execFileAsync = promisify(execFile);

export interface CompareCommandOptions {
  baseline?: string;
  current?: string;
  format?: CompareFormat;
  output?: string;
  failOnRegression?: boolean;
  failOnScoreDrop?: string;
  failOnCoverageDrop?: string;
  failOnConfidenceDrop?: string;
  failOnNewSeverity?: Severity;
  failOnNewCritical?: boolean;
  failOnNewHigh?: boolean;
  changedFiles?: string;
  gitBase?: string;
  gitHead?: string;
  failOnNewChangedSeverity?: Severity;
  failOnNewChangedCritical?: boolean;
  failOnNewChangedHigh?: boolean;
  failOnPrRegression?: boolean;
}

export async function runCompareCommand(options: CompareCommandOptions): Promise<void> {
  if (!options.baseline) {
    throw new Error("Missing --baseline <file>.");
  }
  if (!options.current) {
    throw new Error("Missing --current <file>.");
  }
  const format = options.format ?? "text";
  if (!["text", "json", "markdown", "pr-summary"].includes(format)) {
    throw new Error(`Unsupported format "${format}". Use text, json, markdown, or pr-summary.`);
  }
  const baseline = await readScanResultFile(options.baseline);
  const current = await readScanResultFile(options.current);
  const changedFiles = await readChangedFiles(options);
  const comparison = compareScanResults(baseline, current, { changedFiles });
  const gateResult = evaluateComparisonGates(comparison, options);
  const outputOption = options.output;
  const outputPath = outputOption ? resolveFromInvocationCwd(outputOption) : undefined;
  const rendered = renderComparisonResult(comparison, format, {
    status: gateResult.failed ? "failed" : "passed",
    reasons: gateResult.reasons,
    reportPaths: outputOption ? [outputOption] : []
  });

  if (outputPath) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
  }

  process.stdout.write(`${rendered}\n`);

  if (gateResult.failed) {
    for (const reason of gateResult.reasons) {
      process.stderr.write(`${reason}\n`);
    }
    process.exitCode = 1;
  }
}

export async function readScanResultFile(filePath: string) {
  const resolved = resolveFromInvocationCwd(filePath);
  let raw: string;
  try {
    raw = await readFile(resolved, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not read scan result JSON at ${filePath}. Expected a file produced by: agentlighthouse scan . --format json --output ${filePath}. ${message}`
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Invalid JSON in ${filePath}. Expected AgentLighthouse scan-result JSON. Recreate it with: agentlighthouse scan . --format json --output ${filePath}. ${message}`
    );
  }
  if (parsed && typeof parsed === "object" && "comparisonId" in parsed && !("scanId" in parsed)) {
    throw new Error(
      `${filePath} is a comparison report, not a scan-result JSON file. Use files produced by: agentlighthouse scan . --format json --output current.json`
    );
  }
  const result = scanResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `${filePath} is not a valid AgentLighthouse scan-result JSON file. Expected fields include scanId, score, coverage, findings, and scoringModelVersion. Recreate it with: agentlighthouse scan . --format json --output ${filePath}`
    );
  }
  if (result.data.scoringModelVersion !== "0.1.0") {
    throw new Error(
      `${filePath} uses unsupported scoring model ${result.data.scoringModelVersion}. This CLI supports scoring model 0.1.0. Regenerate the file with this CLI version.`
    );
  }
  return result.data;
}

export async function readChangedFiles(
  options: Pick<CompareCommandOptions, "changedFiles" | "gitBase" | "gitHead">
): Promise<ChangedFile[] | undefined> {
  const hasExplicit = Boolean(options.changedFiles);
  const hasGit = Boolean(options.gitBase || options.gitHead);
  if (hasExplicit && hasGit) {
    throw new Error("Use either --changed-files or --git-base/--git-head, not both.");
  }
  if (options.changedFiles) {
    const resolved = resolveFromInvocationCwd(options.changedFiles);
    try {
      return parseChangedFilesText(await readFile(resolved, "utf8"), "explicit");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Could not read changed-files list at ${options.changedFiles}. Create one with: git diff --name-status origin/main...HEAD > changed-files.txt. ${message}`
      );
    }
  }
  if (options.gitBase || options.gitHead) {
    if (!options.gitBase || !options.gitHead) {
      throw new Error(
        "Both --git-base and --git-head are required for git changed-file detection."
      );
    }
    try {
      const { stdout } = await execFileAsync(
        "git",
        ["diff", "--name-status", "-z", `${options.gitBase}...${options.gitHead}`],
        {
          cwd: process.cwd(),
          encoding: "utf8",
          maxBuffer: 1024 * 1024
        }
      );
      const files = parseGitNameStatus(stdout, "git");
      if (files.length === 0) {
        process.stderr.write(
          `Git diff ${options.gitBase}...${options.gitHead} returned no changed files; PR impact sections will be empty.\n`
        );
      }
      return files;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Unable to read changed files from git refs ${options.gitBase}...${options.gitHead}: ${message}`
      );
    }
  }
  return undefined;
}

export function renderComparisonResult(
  result: ComparisonResult,
  format: CompareFormat,
  options: { status: "passed" | "failed"; reasons: string[]; reportPaths: string[] }
): string {
  if (format === "json") {
    return renderComparisonJsonReport(result);
  }
  if (format === "markdown") {
    return renderComparisonMarkdownReport(result, options);
  }
  if (format === "pr-summary") {
    return renderComparisonPrSummaryReport(result, options);
  }
  return renderComparisonCliReport(result);
}

export function evaluateComparisonGates(
  result: ComparisonResult,
  options: CompareCommandOptions
): { failed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const scoreDrop = parseOptionalNumber(options.failOnScoreDrop, "fail-on-score-drop");
  const coverageDrop = parseOptionalNumber(options.failOnCoverageDrop, "fail-on-coverage-drop");
  const confidenceDrop = parseOptionalNumber(
    options.failOnConfidenceDrop,
    "fail-on-confidence-drop"
  );
  const newSeverity = options.failOnNewCritical
    ? "critical"
    : options.failOnNewHigh
      ? "high"
      : options.failOnNewSeverity;
  const newChangedSeverity = options.failOnNewChangedCritical
    ? "critical"
    : options.failOnNewChangedHigh
      ? "high"
      : options.failOnNewChangedSeverity;

  if (options.failOnRegression && result.summary.regressionDetected) {
    reasons.push(`AgentLighthouse comparison verdict is ${result.summary.verdict}.`);
  }
  if (scoreDrop !== undefined && result.deltas.scoreDelta <= -scoreDrop) {
    reasons.push(
      `AgentLighthouse score dropped by ${Math.abs(result.deltas.scoreDelta)} point(s), meeting threshold ${scoreDrop}.`
    );
  }
  if (coverageDrop !== undefined && result.deltas.coverageDelta <= -coverageDrop) {
    reasons.push(
      `AgentLighthouse coverage dropped by ${Math.abs(result.deltas.coverageDelta)} point(s), meeting threshold ${coverageDrop}.`
    );
  }
  if (confidenceDrop !== undefined && result.deltas.confidenceDelta <= -confidenceDrop) {
    reasons.push(
      `AgentLighthouse confidence score dropped by ${Math.abs(result.deltas.confidenceDelta)} point(s), meeting threshold ${confidenceDrop}.`
    );
  }
  if (newSeverity) {
    if (!["critical", "high", "medium", "low", "info"].includes(newSeverity)) {
      throw new Error(`Unsupported fail-on-new-severity "${newSeverity}".`);
    }
    const threshold = severityRank(newSeverity);
    const newFindings = result.findings.new.filter(
      (finding) => severityRank(finding.severity) >= threshold
    );
    if (newFindings.length > 0) {
      reasons.push(
        `AgentLighthouse found ${newFindings.length} new finding(s) at or above ${newSeverity} severity.`
      );
    }
  }
  if (newChangedSeverity) {
    if (!["critical", "high", "medium", "low", "info"].includes(newChangedSeverity)) {
      throw new Error(`Unsupported fail-on-new-changed-severity "${newChangedSeverity}".`);
    }
    if (!result.prImpact) {
      reasons.push(
        "Changed-file gate requested, but no changed-file information was supplied. Use --changed-files or --git-base/--git-head."
      );
    } else {
      const threshold = severityRank(newChangedSeverity);
      const changedFindings = result.prImpact.newFindingsOnChangedFiles.filter(
        (finding) => severityRank(finding.severity) >= threshold
      );
      if (changedFindings.length > 0) {
        reasons.push(
          `AgentLighthouse found ${changedFindings.length} new finding(s) at or above ${newChangedSeverity} severity on changed files.`
        );
      }
    }
  }
  if (options.failOnPrRegression) {
    if (!result.prImpact) {
      reasons.push(
        "PR regression gate requested, but no changed-file information was supplied. Use --changed-files or --git-base/--git-head."
      );
    } else {
      const changedHighRisk = result.prImpact.newFindingsOnChangedFiles.filter(
        (finding) => severityRank(finding.severity) >= severityRank("high")
      );
      if (result.deltas.scoreDelta < 0 || changedHighRisk.length > 0) {
        reasons.push(
          `AgentLighthouse PR regression detected: score delta ${result.deltas.scoreDelta}, ${changedHighRisk.length} new high/critical finding(s) on changed files.`
        );
      }
    }
  }
  return { failed: reasons.length > 0, reasons };
}

function parseOptionalNumber(value: string | undefined, optionName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${optionName} value "${value}".`);
  }
  return parsed;
}
