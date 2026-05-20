import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runScanCommand } from "../commands/scan.js";

describe("runScanCommand", () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
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
});
