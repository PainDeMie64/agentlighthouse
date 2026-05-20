import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  compareScanResults,
  renderComparisonJsonReport,
  renderJsonReport,
  scanResultSchema,
  scanProject
} from "@agentlighthouse/core";
import { runCompareCommand } from "../commands/compare.js";

describe("runCompareCommand", () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("writes markdown comparison reports", async () => {
    const { baselinePath, currentPath, outputDir } = await comparisonFixture();
    const outputPath = path.join(outputDir, "delta.md");

    await runCompareCommand({
      baseline: baselinePath,
      current: currentPath,
      format: "markdown",
      output: outputPath
    });

    const report = await readFile(outputPath, "utf8");
    expect(report).toContain("# AgentLighthouse Comparison Report");
    expect(process.exitCode).not.toBe(1);
  });

  it("writes JSON comparison reports", async () => {
    const { baselinePath, currentPath, outputDir } = await comparisonFixture();
    const outputPath = path.join(outputDir, "delta.json");

    await runCompareCommand({
      baseline: baselinePath,
      current: currentPath,
      format: "json",
      output: outputPath
    });

    const report = JSON.parse(await readFile(outputPath, "utf8")) as { comparisonId: string };
    expect(report.comparisonId).toMatch(/^cmp_/);
  });

  it("writes PR summaries before failing regression gates", async () => {
    const { baselinePath, currentPath, outputDir } = await comparisonFixture();
    const outputPath = path.join(outputDir, "delta.md");

    await runCompareCommand({
      baseline: baselinePath,
      current: currentPath,
      format: "pr-summary",
      output: outputPath,
      failOnRegression: true,
      failOnScoreDrop: "5",
      failOnNewSeverity: "high"
    });

    const report = await readFile(outputPath, "utf8");
    expect(report).toContain("AgentLighthouse PR Delta");
    expect(process.exitCode).toBe(1);
  });

  it("writes PR-aware summaries and fails changed-file gates after writing output", async () => {
    const { baselinePath, currentPath, outputDir } = await comparisonFixture();
    const changedFilesPath = path.join(outputDir, "changed-files.txt");
    const outputPath = path.join(outputDir, "delta.md");
    await writeFile(changedFilesPath, "M\tREADME.md\nM\tpackage.json\nA\tAGENTS.md\n", "utf8");

    await runCompareCommand({
      baseline: baselinePath,
      current: currentPath,
      changedFiles: changedFilesPath,
      format: "pr-summary",
      output: outputPath,
      failOnNewChangedHigh: true
    });

    const report = await readFile(outputPath, "utf8");
    expect(report).toContain("Changed files analyzed");
    expect(report).toContain("New Findings On Changed Files");
    expect(process.exitCode).toBe(1);
  });

  it("rejects comparison-result JSON when scan-result JSON is expected", async () => {
    const { baselinePath, currentPath, outputDir } = await comparisonFixture();
    const comparisonPath = path.join(outputDir, "comparison.json");
    const baseline = scanResultSchema.parse(JSON.parse(await readFile(baselinePath, "utf8")));
    const current = scanResultSchema.parse(JSON.parse(await readFile(currentPath, "utf8")));
    await writeFile(
      comparisonPath,
      renderComparisonJsonReport(compareScanResults(baseline, current)),
      "utf8"
    );

    await expect(
      runCompareCommand({
        baseline: comparisonPath,
        current: currentPath,
        format: "json"
      })
    ).rejects.toThrow("comparison report, not a scan-result JSON");
  });
});

async function comparisonFixture(): Promise<{
  baselinePath: string;
  currentPath: string;
  outputDir: string;
}> {
  const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-compare-"));
  const baseline = await scanProject(
    path.resolve(import.meta.dirname, "../../../../examples/sample-good-project")
  );
  const current = await scanProject(
    path.resolve(import.meta.dirname, "../../../../examples/sample-bad-project")
  );
  const baselinePath = path.join(outputDir, "baseline.json");
  const currentPath = path.join(outputDir, "current.json");
  await writeFile(baselinePath, renderJsonReport(baseline), "utf8");
  await writeFile(currentPath, renderJsonReport(current), "utf8");
  return { baselinePath, currentPath, outputDir };
}
