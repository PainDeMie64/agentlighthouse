#!/usr/bin/env node
import { Command } from "commander";
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
  .option("--include <glob...>", "Only include paths containing these patterns")
  .option("--exclude <glob...>", "Exclude paths matching these patterns")
  .option("--no-color", "Disable terminal color")
  .description("Scan a local project directory.")
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
  .description("Compare two saved AgentLighthouse JSON scan reports.")
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
  .action((targetPath: string, options: Parameters<typeof runInitCommand>[1]) => {
    runInitCommand(targetPath, options).catch(handleError);
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
