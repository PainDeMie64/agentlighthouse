import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  compareScanResults,
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
import type { CompareCommandOptions, CompareFormat } from "./compare.js";
import {
  evaluateComparisonGates,
  readChangedFiles,
  readScanResultFile,
  renderComparisonResult
} from "./compare.js";

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
  baseline?: string;
  comparisonOutput?: string;
  comparisonFormat?: CompareFormat;
  changedFiles?: string;
  gitBase?: string;
  gitHead?: string;
  failOnRegression?: boolean;
  failOnScoreDrop?: string;
  failOnCoverageDrop?: string;
  failOnConfidenceDrop?: string;
  failOnNewSeverity?: Severity;
  failOnNewCritical?: boolean;
  failOnNewHigh?: boolean;
  failOnNewChangedSeverity?: Severity;
  failOnNewChangedCritical?: boolean;
  failOnNewChangedHigh?: boolean;
  failOnPrRegression?: boolean;
  reportDir?: string;
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
    options.comparisonFormat &&
    !["text", "json", "markdown", "pr-summary"].includes(options.comparisonFormat)
  ) {
    throw new Error(
      `Unsupported comparison-format "${options.comparisonFormat}". Use text, json, markdown, or pr-summary.`
    );
  }
  if (!options.baseline && hasComparisonOnlyOptions(options)) {
    throw new Error(
      "Comparison options require --baseline <file>. Example: agentlighthouse scan . --baseline agentlighthouse-baseline.json --comparison-output agentlighthouse-delta.md"
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
  const bundlePaths: string[] = [];
  if (options.reportDir) {
    bundlePaths.push(...(await writeReportBundle(options.reportDir, result)));
  }
  const comparison = options.baseline
    ? compareScanResults(await readScanResultFile(options.baseline), result, {
        changedFiles: await readChangedFiles(options)
      })
    : undefined;
  const comparisonGateResult = comparison
    ? evaluateComparisonGates(comparison, comparisonOptions(options))
    : { failed: false, reasons: [] };
  const allReasons = [...gateResult.reasons, ...comparisonGateResult.reasons];
  const failed = gateResult.failed || comparisonGateResult.failed;
  const comparisonOutputOption = options.comparisonOutput;
  const comparisonOutputPath = comparisonOutputOption
    ? resolveFromInvocationCwd(comparisonOutputOption)
    : undefined;
  const comparisonFormat = options.comparisonFormat ?? "pr-summary";
  const rendered = renderResult(result, format, options.color ?? true, {
    status: failed ? "failed" : "passed",
    reasons: allReasons,
    reportPaths: [...reportPaths, ...bundlePaths]
  });
  if (outputPath) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
  }
  if (comparison && options.reportDir) {
    bundlePaths.push(
      ...(await writeComparisonBundle(options.reportDir, comparison, {
        status: failed ? "failed" : "passed",
        reasons: comparisonGateResult.reasons
      }))
    );
  }
  if (comparison && comparisonOutputPath) {
    const comparisonRendered = renderComparisonResult(comparison, comparisonFormat, {
      status: failed ? "failed" : "passed",
      reasons: comparisonGateResult.reasons,
      reportPaths: comparisonOutputOption ? [comparisonOutputOption] : []
    });
    await mkdir(path.dirname(comparisonOutputPath), { recursive: true });
    await writeFile(comparisonOutputPath, comparisonRendered, "utf8");
  }

  process.stdout.write(`${rendered}\n`);
  if (comparison) {
    const comparisonRendered = renderComparisonResult(comparison, comparisonFormat, {
      status: failed ? "failed" : "passed",
      reasons: comparisonGateResult.reasons,
      reportPaths: [
        ...(comparisonOutputOption ? [comparisonOutputOption] : []),
        ...bundlePaths.filter((file) => file.includes("comparison"))
      ]
    });
    process.stdout.write(`${comparisonRendered}\n`);
  }
  if (options.reportDir) {
    process.stdout.write(`AgentLighthouse report bundle written to ${options.reportDir}\n`);
  }

  if (options.githubStepSummary) {
    await writeGithubStepSummary(result, {
      status: failed ? "failed" : "passed",
      reasons: allReasons,
      reportPaths: [...reportPaths, ...bundlePaths]
    });
  }

  if (failed) {
    for (const reason of allReasons) {
      process.stderr.write(`${reason}\n`);
    }
    process.exitCode = 1;
  }
}

function hasComparisonOnlyOptions(options: ScanCommandOptions): boolean {
  return Boolean(
    options.comparisonOutput ||
    options.changedFiles ||
    options.gitBase ||
    options.gitHead ||
    options.failOnRegression ||
    options.failOnScoreDrop ||
    options.failOnCoverageDrop ||
    options.failOnConfidenceDrop ||
    options.failOnNewSeverity ||
    options.failOnNewCritical ||
    options.failOnNewHigh ||
    options.failOnNewChangedSeverity ||
    options.failOnNewChangedCritical ||
    options.failOnNewChangedHigh ||
    options.failOnPrRegression
  );
}

function comparisonOptions(options: ScanCommandOptions): CompareCommandOptions {
  return {
    failOnRegression: options.failOnRegression,
    failOnScoreDrop: options.failOnScoreDrop,
    failOnCoverageDrop: options.failOnCoverageDrop,
    failOnConfidenceDrop: options.failOnConfidenceDrop,
    failOnNewSeverity: options.failOnNewSeverity,
    failOnNewCritical: options.failOnNewCritical,
    failOnNewHigh: options.failOnNewHigh,
    failOnNewChangedSeverity: options.failOnNewChangedSeverity,
    failOnNewChangedCritical: options.failOnNewChangedCritical,
    failOnNewChangedHigh: options.failOnNewChangedHigh,
    failOnPrRegression: options.failOnPrRegression
  };
}

async function writeReportBundle(
  reportDir: string,
  result: Awaited<ReturnType<typeof scanProject>>
): Promise<string[]> {
  const resolved = resolveFromInvocationCwd(reportDir);
  await mkdir(resolved, { recursive: true });
  const files = [
    ["scan.json", renderJsonReport(result)],
    ["scan.md", renderMarkdownReport(result)],
    ["scan.sarif", renderSarifReport(result)],
    [
      "pr-summary.md",
      renderPrSummaryReport(result, {
        reportPaths: [
          path.posix.join(reportDir, "scan.json"),
          path.posix.join(reportDir, "scan.md"),
          path.posix.join(reportDir, "scan.sarif")
        ]
      })
    ]
  ] as const;
  for (const [fileName, contents] of files) {
    await writeFile(path.join(resolved, fileName), contents, "utf8");
  }
  return files.map(([fileName]) => path.posix.join(reportDir, fileName));
}

async function writeComparisonBundle(
  reportDir: string,
  comparison: Parameters<typeof renderComparisonResult>[0],
  options: { status: "passed" | "failed"; reasons: string[] }
): Promise<string[]> {
  const resolved = resolveFromInvocationCwd(reportDir);
  await mkdir(resolved, { recursive: true });
  const files = [
    [
      "comparison.json",
      renderComparisonResult(comparison, "json", bundleComparisonOptions(options))
    ],
    [
      "comparison.md",
      renderComparisonResult(comparison, "markdown", bundleComparisonOptions(options))
    ],
    [
      "comparison-pr-summary.md",
      renderComparisonResult(comparison, "pr-summary", bundleComparisonOptions(options))
    ]
  ] as const;
  for (const [fileName, contents] of files) {
    await writeFile(path.join(resolved, fileName), contents, "utf8");
  }
  return files.map(([fileName]) => path.posix.join(reportDir, fileName));
}

function bundleComparisonOptions(options: { status: "passed" | "failed"; reasons: string[] }): {
  status: "passed" | "failed";
  reasons: string[];
  reportPaths: string[];
} {
  return {
    status: options.status,
    reasons: options.reasons,
    reportPaths: []
  };
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
