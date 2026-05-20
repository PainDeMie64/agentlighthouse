import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  compareScanResults,
  renderComparisonCliReport,
  renderComparisonJsonReport,
  renderComparisonMarkdownReport,
  renderComparisonPrSummaryReport,
  scanResultSchema,
  severityRank
} from "@agentlighthouse/core";
import type { ComparisonResult, Severity } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";

export type CompareFormat = "text" | "json" | "markdown" | "pr-summary";

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
  const baseline = await readScanResult(options.baseline);
  const current = await readScanResult(options.current);
  const comparison = compareScanResults(baseline, current);
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

async function readScanResult(filePath: string) {
  const resolved = resolveFromInvocationCwd(filePath);
  const parsed = JSON.parse(await readFile(resolved, "utf8")) as unknown;
  return scanResultSchema.parse(parsed);
}

function renderComparisonResult(
  result: ComparisonResult,
  format: CompareFormat,
  options: { status: "passed" | "failed"; reasons: string[]; reportPaths: string[] }
): string {
  if (format === "json") {
    return renderComparisonJsonReport(result);
  }
  if (format === "markdown") {
    return renderComparisonMarkdownReport(result);
  }
  if (format === "pr-summary") {
    return renderComparisonPrSummaryReport(result, options);
  }
  return renderComparisonCliReport(result);
}

function evaluateComparisonGates(
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
