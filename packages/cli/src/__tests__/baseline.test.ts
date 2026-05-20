import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  compareScanResults,
  renderComparisonJsonReport,
  renderJsonReport,
  scanProject
} from "@agentlighthouse/core";
import {
  runBaselineCreateCommand,
  runBaselineSummaryCommand,
  runBaselineValidateCommand
} from "../commands/baseline.js";

describe("baseline commands", () => {
  const originalExitCode = process.exitCode;
  let stdoutOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    vi.spyOn(process.stdout, "write").mockImplementation((message) => {
      stdoutOutput.push(String(message));
      return true;
    });
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("creates a valid scan-result JSON baseline", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-baseline-"));
    const outputPath = path.join(outputDir, "agentlighthouse-baseline.json");

    await runBaselineCreateCommand(sampleGoodPath(), { output: outputPath });

    const parsed = JSON.parse(await readFile(outputPath, "utf8")) as { scanId?: string };
    expect(parsed.scanId).toMatch(/^scan_/);
    expect(stdoutOutput.join("")).toContain("baseline created");
  });

  it("validates and summarizes scan-result JSON baselines", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-baseline-"));
    const result = await scanProject(sampleGoodPath());
    const baselinePath = path.join(outputDir, "baseline.json");
    await writeFile(baselinePath, renderJsonReport(result), "utf8");

    await runBaselineValidateCommand(baselinePath);
    await runBaselineSummaryCommand(baselinePath);

    expect(stdoutOutput.join("")).toContain("Score:");
    expect(stdoutOutput.join("")).toContain("Scoring model:");
  });

  it("rejects comparison-result JSON as a baseline", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-baseline-"));
    const baseline = await scanProject(sampleGoodPath());
    const current = await scanProject(sampleBadPath());
    const comparisonPath = path.join(outputDir, "comparison.json");
    await writeFile(
      comparisonPath,
      renderComparisonJsonReport(compareScanResults(baseline, current)),
      "utf8"
    );

    await expect(runBaselineValidateCommand(comparisonPath)).rejects.toThrow(
      "comparison report, not a scan-result JSON"
    );
  });

  it("rejects unsupported scoring model versions", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-baseline-"));
    const result = await scanProject(sampleGoodPath());
    const baselinePath = path.join(outputDir, "baseline.json");
    await writeFile(
      baselinePath,
      JSON.stringify({ ...result, scoringModelVersion: "999.0.0" }),
      "utf8"
    );

    await expect(runBaselineValidateCommand(baselinePath)).rejects.toThrow(
      "unsupported scoring model"
    );
  });
});

function sampleGoodPath(): string {
  return path.resolve(import.meta.dirname, "../../../../examples/sample-good-project");
}

function sampleBadPath(): string {
  return path.resolve(import.meta.dirname, "../../../../examples/sample-bad-project");
}
