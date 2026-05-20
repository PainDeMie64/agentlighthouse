#!/usr/bin/env node
import { Command } from "commander";
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
  .option("--format <format>", "Output format: text, json, or markdown", "text")
  .option("--output <file>", "Write report output to a file")
  .option("--fail-under <score>", "Exit with code 1 when score is below the threshold")
  .option("--include <glob...>", "Only include paths containing these patterns")
  .option("--exclude <glob...>", "Exclude paths matching these patterns")
  .option("--no-color", "Disable terminal color")
  .description("Scan a local project directory.")
  .action((targetPath: string, options: Parameters<typeof runScanCommand>[1]) => {
    runScanCommand(targetPath, options).catch(handleError);
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
