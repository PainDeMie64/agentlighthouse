#!/usr/bin/env node
import { Command } from "commander";
import {
  runBaselineCreateCommand,
  runBaselineSummaryCommand,
  runBaselineValidateCommand
} from "./commands/baseline.js";
import { runCompareCommand } from "./commands/compare.js";
import { runInitCommand } from "./commands/init.js";
import { runScanCommand } from "./commands/scan.js";

const program = new Command();

program
  .name("agentlighthouse")
  .description("Lighthouse for AI agents: scan projects for agent-readiness.")
  .version("0.1.0");

program
  .command("scan")
  .argument("[path]", "Project path to scan", ".")
  .option("--json", "Print JSON output")
  .option("--format <format>", "Output format: text, json, markdown, sarif, or pr-summary", "text")
  .option(
    "--profile <profile>",
    "Scan profile: default, devtool, api, mcp, docs, library, or internal"
  )
  .option("--probe <probe...>", "Opt-in probes to run, currently: commands")
  .option("--run-probes", "Run all safe opt-in probes")
  .option("--output <file>", "Write report output to a file")
  .option("--report-dir <dir>", "Write scan and comparison report bundle files to a directory")
  .option("--baseline <file>", "Compare this scan against a baseline scan-result JSON")
  .option(
    "--comparison-format <format>",
    "Comparison output format when --baseline is used: text, json, markdown, or pr-summary",
    "pr-summary"
  )
  .option("--comparison-output <file>", "Write comparison output when --baseline is used")
  .option("--changed-files <file>", "Classify baseline comparison using a changed-files list")
  .option("--git-base <ref>", "Read changed files from git diff using this base ref")
  .option("--git-head <ref>", "Read changed files from git diff using this head ref")
  .option("--fail-under <score>", "Exit with code 1 when score is below the threshold")
  .option(
    "--fail-on-severity <severity>",
    "Exit with code 1 when any finding is at or above severity: critical, high, medium, low, or info"
  )
  .option(
    "--min-confidence <confidence>",
    "Exit with code 1 when score confidence is below: low, medium, or high"
  )
  .option("--github-step-summary", "Append a concise Markdown summary to GITHUB_STEP_SUMMARY")
  .option("--fail-on-regression", "With --baseline, exit when comparison regresses")
  .option("--fail-on-score-drop <points>", "With --baseline, exit when score drops by points")
  .option("--fail-on-coverage-drop <points>", "With --baseline, exit when coverage drops by points")
  .option(
    "--fail-on-confidence-drop <points>",
    "With --baseline, exit when confidence score drops by points"
  )
  .option(
    "--fail-on-new-severity <severity>",
    "With --baseline, exit when any new finding is at or above severity"
  )
  .option("--fail-on-new-critical", "With --baseline, exit when a new critical finding appears")
  .option("--fail-on-new-high", "With --baseline, exit when a new high/critical finding appears")
  .option(
    "--fail-on-new-changed-severity <severity>",
    "With --baseline and changed files, exit when new changed-file findings meet severity"
  )
  .option(
    "--fail-on-new-changed-critical",
    "With --baseline and changed files, exit when a new critical changed-file finding appears"
  )
  .option(
    "--fail-on-new-changed-high",
    "With --baseline and changed files, exit when a new high/critical changed-file finding appears"
  )
  .option(
    "--fail-on-pr-regression",
    "With --baseline and changed files, exit on score drop or new high/critical changed-file findings"
  )
  .option("--include <glob...>", "Only include paths containing these patterns")
  .option("--exclude <glob...>", "Exclude paths matching these patterns")
  .option("--no-color", "Disable terminal color")
  .description("Scan a local project directory.")
  .addHelpText(
    "after",
    `

Examples:
  agentlighthouse scan .
  agentlighthouse scan . --format markdown --output agentlighthouse-report.md
  agentlighthouse scan . --report-dir agentlighthouse-reports
  agentlighthouse scan . --baseline agentlighthouse-baseline.json --comparison-output agentlighthouse-delta.md
  agentlighthouse scan . --baseline agentlighthouse-baseline.json --git-base origin/main --git-head HEAD --fail-on-pr-regression
`
  )
  .action((targetPath: string, options: Parameters<typeof runScanCommand>[1]) => {
    runScanCommand(targetPath, options).catch(handleError);
  });

program
  .command("compare")
  .requiredOption("--baseline <file>", "Baseline scan result JSON")
  .requiredOption("--current <file>", "Current scan result JSON")
  .option("--format <format>", "Output format: text, json, markdown, or pr-summary", "text")
  .option("--output <file>", "Write comparison report output to a file")
  .option("--fail-on-regression", "Exit with code 1 when any regression is detected")
  .option("--fail-on-score-drop <points>", "Exit with code 1 when score drops by at least points")
  .option(
    "--fail-on-coverage-drop <points>",
    "Exit with code 1 when coverage drops by at least points"
  )
  .option(
    "--fail-on-confidence-drop <points>",
    "Exit with code 1 when confidence score drops by at least points"
  )
  .option(
    "--fail-on-new-severity <severity>",
    "Exit with code 1 when any new finding is at or above severity"
  )
  .option("--fail-on-new-critical", "Exit with code 1 when a new critical finding appears")
  .option("--fail-on-new-high", "Exit with code 1 when a new high or critical finding appears")
  .option(
    "--changed-files <file>",
    "Classify comparison findings using an explicit changed-files list"
  )
  .option("--git-base <ref>", "Read changed files from git diff using this base ref")
  .option("--git-head <ref>", "Read changed files from git diff using this head ref")
  .option(
    "--fail-on-new-changed-severity <severity>",
    "Exit with code 1 when a new finding at or above severity appears on changed files"
  )
  .option(
    "--fail-on-new-changed-critical",
    "Exit with code 1 when a new critical finding appears on changed files"
  )
  .option(
    "--fail-on-new-changed-high",
    "Exit with code 1 when a new high or critical finding appears on changed files"
  )
  .option(
    "--fail-on-pr-regression",
    "Exit with code 1 when score drops or new high/critical findings appear on changed files"
  )
  .description("Compare two saved AgentLighthouse JSON scan reports.")
  .addHelpText(
    "after",
    `

Examples:
  agentlighthouse compare --baseline baseline.json --current current.json
  agentlighthouse compare --baseline baseline.json --current current.json --format markdown --output delta.md
  agentlighthouse compare --baseline baseline.json --current current.json --changed-files changed-files.txt --fail-on-new-changed-high
`
  )
  .action((options: Parameters<typeof runCompareCommand>[0]) => {
    runCompareCommand(options).catch(handleError);
  });

program
  .command("init")
  .argument("[path]", "Project path where starter artifacts should be created", ".")
  .option("--dry-run", "Show what would be generated without writing files")
  .option("--force", "Overwrite existing starter artifacts")
  .option("--yes", "Assume yes for non-destructive generation")
  .description("Generate safe starter agent-readiness artifacts without overwriting by default.")
  .addHelpText(
    "after",
    `

Examples:
  agentlighthouse init .
  agentlighthouse init . --dry-run
`
  )
  .action((targetPath: string, options: Parameters<typeof runInitCommand>[1]) => {
    runInitCommand(targetPath, options).catch(handleError);
  });

const baseline = program
  .command("baseline")
  .description("Create, validate, and summarize baselines.");

baseline
  .command("create")
  .argument("[path]", "Project path to scan for the baseline", ".")
  .option("--output <file>", "Baseline output path", "agentlighthouse-baseline.json")
  .option(
    "--profile <profile>",
    "Scan profile: default, devtool, api, mcp, docs, library, or internal"
  )
  .description("Create a baseline scan-result JSON file.")
  .addHelpText(
    "after",
    `

Examples:
  agentlighthouse baseline create .
  agentlighthouse baseline create . --output agentlighthouse-baseline.json
`
  )
  .action((targetPath: string, options: Parameters<typeof runBaselineCreateCommand>[1]) => {
    runBaselineCreateCommand(targetPath, options).catch(handleError);
  });

baseline
  .command("validate")
  .argument("<file>", "Baseline scan-result JSON file")
  .description("Validate that a baseline file is an AgentLighthouse scan-result JSON.")
  .addHelpText(
    "after",
    `

Examples:
  agentlighthouse baseline validate agentlighthouse-baseline.json
`
  )
  .action((baselinePath: string, options: Parameters<typeof runBaselineValidateCommand>[1]) => {
    runBaselineValidateCommand(baselinePath, options).catch(handleError);
  });

baseline
  .command("summary")
  .argument("<file>", "Baseline scan-result JSON file")
  .description("Print score, confidence, coverage, profile, and finding counts for a baseline.")
  .addHelpText(
    "after",
    `

Examples:
  agentlighthouse baseline summary agentlighthouse-baseline.json
`
  )
  .action((baselinePath: string) => {
    runBaselineSummaryCommand(baselinePath).catch(handleError);
  });

program
  .command("version")
  .description("Print the AgentLighthouse CLI version.")
  .action(() => {
    process.stdout.write(`${program.version()}\n`);
  });

program.parse();

function handleError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`AgentLighthouse error: ${message}\n`);
  process.exitCode = 1;
}
