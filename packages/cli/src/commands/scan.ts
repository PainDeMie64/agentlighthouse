import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  confidenceRank,
  renderCliReport,
  renderGithubStepSummary,
  renderJsonReport,
  renderMarkdownReport,
  renderPrSummaryReport,
  renderSarifReport,
  scanProject,
  severityRank
} from "@agentlighthouse/core";
import type { ScanProfile, ScoreConfidenceLevel, Severity } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";

export type ScanFormat = "text" | "json" | "markdown" | "sarif" | "pr-summary";

export interface ScanCommandOptions {
  json?: boolean;
  format?: ScanFormat;
  profile?: ScanProfile;
  probe?: string[];
  runProbes?: boolean;
  output?: string;
  failUnder?: string;
  failOnSeverity?: Severity;
  minConfidence?: ScoreConfidenceLevel;
  githubStepSummary?: boolean;
  include?: string[];
  exclude?: string[];
  color?: boolean;
}

export async function runScanCommand(
  targetPath: string,
  options: ScanCommandOptions
): Promise<void> {
  const scanPath = resolveFromInvocationCwd(targetPath);
  const format = options.json ? "json" : (options.format ?? "text");
  if (!["text", "json", "markdown", "sarif", "pr-summary"].includes(format)) {
    throw new Error(
      `Unsupported format "${format}". Use text, json, markdown, sarif, or pr-summary.`
    );
  }
  if (
    options.profile &&
    !["default", "devtool", "api", "mcp", "docs", "library", "internal"].includes(options.profile)
  ) {
    throw new Error(`Unsupported profile "${options.profile}".`);
  }
  if (
    options.failOnSeverity &&
    !["critical", "high", "medium", "low", "info"].includes(options.failOnSeverity)
  ) {
    throw new Error(`Unsupported fail-on-severity "${options.failOnSeverity}".`);
  }
  if (options.minConfidence && !["low", "medium", "high"].includes(options.minConfidence)) {
    throw new Error(`Unsupported min-confidence "${options.minConfidence}".`);
  }
  const probes = new Set(options.probe ?? []);
  if ([...probes].some((probe) => probe !== "commands")) {
    throw new Error(`Unsupported probe. Use --probe commands.`);
  }
  const result = await scanProject(scanPath, {
    include: options.include ?? [],
    exclude: options.exclude ?? [],
    profile: options.profile,
    probes: {
      commands: options.runProbes === true || probes.has("commands")
    }
  });
  const failUnder = options.failUnder ? Number.parseInt(options.failUnder, 10) : undefined;
  if (options.failUnder && Number.isNaN(failUnder)) {
    throw new Error(`Invalid fail-under score "${options.failUnder}".`);
  }
  const gateResult = evaluateGates(result, {
    failUnder,
    failOnSeverity: options.failOnSeverity,
    minConfidence: options.minConfidence
  });
  const outputOption = options.output;
  const outputPath = outputOption ? resolveFromInvocationCwd(outputOption) : undefined;
  const reportPaths = outputOption ? [outputOption] : [];
  const rendered = renderResult(result, format, options.color ?? true, {
    status: gateResult.failed ? "failed" : "passed",
    reasons: gateResult.reasons,
    reportPaths
  });
  if (outputPath) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
  }

  process.stdout.write(`${rendered}\n`);

  if (options.githubStepSummary) {
    await writeGithubStepSummary(result, {
      status: gateResult.failed ? "failed" : "passed",
      reasons: gateResult.reasons,
      reportPaths
    });
  }

  if (gateResult.failed) {
    for (const reason of gateResult.reasons) {
      process.stderr.write(`${reason}\n`);
    }
    process.exitCode = 1;
  }
}

function renderResult(
  result: Awaited<ReturnType<typeof scanProject>>,
  format: ScanFormat,
  color: boolean,
  options: {
    status: "passed" | "failed";
    reasons: string[];
    reportPaths: string[];
  }
): string {
  if (format === "json") {
    return renderJsonReport(result);
  }
  if (format === "markdown") {
    return renderMarkdownReport(result);
  }
  if (format === "sarif") {
    return renderSarifReport(result);
  }
  if (format === "pr-summary") {
    return renderPrSummaryReport(result, options);
  }
  return renderCliReport(result, color);
}

function evaluateGates(
  result: Awaited<ReturnType<typeof scanProject>>,
  options: {
    failUnder?: number;
    failOnSeverity?: Severity;
    minConfidence?: ScoreConfidenceLevel;
  }
): { failed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (options.failUnder !== undefined && result.score < options.failUnder) {
    reasons.push(
      `AgentLighthouse score ${result.score} is below fail-under threshold ${options.failUnder}.`
    );
  }
  if (options.failOnSeverity) {
    const threshold = severityRank(options.failOnSeverity);
    const blocking = result.findings.filter(
      (finding) => severityRank(finding.severity) >= threshold
    );
    if (blocking.length > 0) {
      reasons.push(
        `AgentLighthouse found ${blocking.length} finding(s) at or above ${options.failOnSeverity} severity.`
      );
    }
  }
  if (
    options.minConfidence &&
    confidenceRank(result.scoreConfidence) < confidenceRank(options.minConfidence)
  ) {
    reasons.push(
      `AgentLighthouse confidence ${result.scoreConfidence} is below minimum ${options.minConfidence}.`
    );
  }
  return { failed: reasons.length > 0, reasons };
}

async function writeGithubStepSummary(
  result: Awaited<ReturnType<typeof scanProject>>,
  options: {
    status: "passed" | "failed";
    reasons: string[];
    reportPaths: string[];
  }
): Promise<void> {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    process.stderr.write("GITHUB_STEP_SUMMARY is not set; skipping GitHub step summary output.\n");
    return;
  }
  await appendFile(summaryPath, `${renderGithubStepSummary(result, options)}\n`, "utf8");
}
