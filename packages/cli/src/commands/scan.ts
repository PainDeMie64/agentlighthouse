import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderCliReport, renderMarkdownReport, scanProject } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";

export type ScanFormat = "text" | "json" | "markdown";

export interface ScanCommandOptions {
  json?: boolean;
  format?: ScanFormat;
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
  const format = options.json ? "json" : (options.format ?? "text");
  if (!["text", "json", "markdown"].includes(format)) {
    throw new Error(`Unsupported format "${format}". Use text, json, or markdown.`);
  }
  const rendered = renderResult(result, format, options.color ?? true);
  if (options.output) {
    const outputPath = resolveFromInvocationCwd(options.output);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, rendered, "utf8");
  }

  process.stdout.write(`${rendered}\n`);

  if (failUnder !== undefined && result.score < failUnder) {
    process.stderr.write(
      `AgentLighthouse score ${result.score} is below fail-under threshold ${failUnder}.\n`
    );
    process.exitCode = 1;
  }
}

function renderResult(
  result: Awaited<ReturnType<typeof scanProject>>,
  format: ScanFormat,
  color: boolean
): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }
  if (format === "markdown") {
    return renderMarkdownReport(result);
  }
  return renderCliReport(result, color);
}
