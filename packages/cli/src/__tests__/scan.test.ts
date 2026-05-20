import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runScanCommand } from "../commands/scan.js";

describe("runScanCommand", () => {
  const originalExitCode = process.exitCode;
  const originalGithubStepSummary = process.env.GITHUB_STEP_SUMMARY;
  let stderrOutput: string[];

  beforeEach(() => {
    stderrOutput = [];
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation((message) => {
      stderrOutput.push(String(message));
      return true;
    });
    delete process.env.GITHUB_STEP_SUMMARY;
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    if (originalGithubStepSummary === undefined) {
      delete process.env.GITHUB_STEP_SUMMARY;
    } else {
      process.env.GITHUB_STEP_SUMMARY = originalGithubStepSummary;
    }
    vi.restoreAllMocks();
  });

  it("writes markdown output before applying fail-under", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-cli-"));
    const outputPath = path.join(outputDir, "report.md");
    const samplePath = path.resolve(import.meta.dirname, "../../../../examples/sample-bad-project");

    await runScanCommand(samplePath, {
      format: "markdown",
      output: outputPath,
      failUnder: "95"
    });

    const report = await readFile(outputPath, "utf8");
    expect(report).toContain("# AgentLighthouse Report");
    expect(process.exitCode).toBe(1);
  });

  it("writes SARIF output before applying severity gates", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-cli-"));
    const outputPath = path.join(outputDir, "report.sarif");
    const samplePath = path.resolve(import.meta.dirname, "../../../../examples/sample-bad-project");

    await runScanCommand(samplePath, {
      format: "sarif",
      output: outputPath,
      failOnSeverity: "high"
    });

    const sarif = JSON.parse(await readFile(outputPath, "utf8")) as {
      version: string;
      runs: Array<{ tool: { driver: { rules: unknown[] } }; results: unknown[] }>;
    };
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.tool.driver.rules.length).toBeGreaterThan(0);
    expect(sarif.runs[0]?.results.length).toBeGreaterThan(0);
    expect(process.exitCode).toBe(1);
  });

  it("fails when confidence is below the requested minimum", async () => {
    const samplePath = path.resolve(import.meta.dirname, "../../../../examples/sample-bad-project");

    await runScanCommand(samplePath, {
      format: "pr-summary",
      minConfidence: "high"
    });

    expect(process.exitCode).toBe(1);
    expect(stderrOutput).toEqual(expect.arrayContaining([expect.stringContaining("confidence")]));
  });

  it("appends GitHub step summaries when the environment variable is set", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "agentlighthouse-cli-"));
    const summaryPath = path.join(outputDir, "step-summary.md");
    const samplePath = path.resolve(
      import.meta.dirname,
      "../../../../examples/sample-good-project"
    );
    process.env.GITHUB_STEP_SUMMARY = summaryPath;

    await runScanCommand(samplePath, {
      format: "pr-summary",
      githubStepSummary: true
    });

    const summary = await readFile(summaryPath, "utf8");
    expect(summary).toContain("AgentLighthouse PR Summary");
    expect(summary).toContain("Score:");
  });

  it("warns but does not fail when GitHub step summary is requested outside GitHub", async () => {
    const samplePath = path.resolve(
      import.meta.dirname,
      "../../../../examples/sample-good-project"
    );

    await runScanCommand(samplePath, {
      format: "pr-summary",
      githubStepSummary: true
    });

    expect(stderrOutput).toEqual(
      expect.arrayContaining([expect.stringContaining("GITHUB_STEP_SUMMARY is not set")])
    );
    expect(process.exitCode).not.toBe(1);
  });
});
