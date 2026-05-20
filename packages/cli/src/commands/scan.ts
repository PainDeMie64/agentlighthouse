import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderCliReport, scanProject } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";

export interface ScanCommandOptions {
  json?: boolean;
  output?: string;
  failUnder?: string;
  include?: string[];
  exclude?: string[];
  color?: boolean;
}

export async function runScanCommand(
  targetPath: string,
  options: ScanCommandOptions
): Promise<void> {
  const scanPath = resolveFromInvocationCwd(targetPath);
  const result = await scanProject(scanPath, {
    include: options.include ?? [],
    exclude: options.exclude ?? []
  });
  const failUnder = options.failUnder ? Number.parseInt(options.failUnder, 10) : undefined;
  if (options.output) {
    const outputPath = resolveFromInvocationCwd(options.output);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      options.json ? JSON.stringify(result, null, 2) : renderCliReport(result),
      "utf8"
    );
  }

  const rendered = options.json
    ? JSON.stringify(result, null, 2)
    : renderCliReport(result, options.color ?? true);
  process.stdout.write(`${rendered}\n`);

  if (failUnder !== undefined && result.score < failUnder) {
    process.stderr.write(
      `AgentLighthouse score ${result.score} is below fail-under threshold ${failUnder}.\n`
    );
    process.exitCode = 1;
  }
}
