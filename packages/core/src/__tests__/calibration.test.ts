import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanProject } from "../index.js";

describe("score calibration", () => {
  it("adds confidence, coverage, and caps", async () => {
    const result = await scanProject(
      path.resolve(import.meta.dirname, "../../../../examples/sample-bad-project")
    );

    expect(result.scoreConfidence).toBe("low");
    expect(result.coverage.coveragePercent).toBeGreaterThan(0);
    expect(result.scoringCaps.map((cap) => cap.id)).toContain("cap.no-agent-instructions");
  });

  it("keeps 100 rare for strong but incomplete projects", async () => {
    const result = await scanProject(
      path.resolve(import.meta.dirname, "../../../../examples/sample-good-project")
    );

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.score).toBeLessThan(100);
    expect(result.scoreConfidence).not.toBe("low");
  });

  it("caps unknown sparse repositories", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-unknown-"));
    await writeFile(path.join(root, "NOTES.txt"), "Some notes");

    const result = await scanProject(root);

    expect(result.detectedProject.type).toBe("unknown");
    expect(result.scoringCaps.map((cap) => cap.id)).toContain("cap.unknown-project-type");
    expect(result.score).toBeLessThanOrEqual(75);
    expect(result.scoreConfidence).toBe("low");
  });

  it("applies profile-specific API expectations", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-api-profile-"));
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "api-ish", scripts: { test: "vitest" } })
    );

    const result = await scanProject(root, { profile: "api" });

    expect(result.profile).toBe("api");
    expect(
      result.findings.find((finding) => finding.id === "api.openapi-not-detected")?.severity
    ).toBe("high");
    expect(result.scoringCaps.map((cap) => cap.id)).toContain("cap.api-profile-without-openapi");
  });

  it("supports docs-only projects without Node-specific penalties", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-docs-"));
    await mkdir(path.join(root, "docs"));
    await writeFile(
      path.join(root, "README.md"),
      "# Docs\n\n## Quickstart\n\nRead docs.\n\n## Example\n\nSee docs."
    );
    await writeFile(path.join(root, "docs", "guide.md"), "# Guide\n\nArchitecture notes.");

    const result = await scanProject(root, { profile: "docs" });

    expect(result.detectedProject.type).toBe("docs_only");
    expect(result.findings.map((finding) => finding.id)).not.toContain(
      "setup.package-json-missing"
    );
  });

  it("adds stable rule IDs to every finding", async () => {
    const result = await scanProject(
      path.resolve(import.meta.dirname, "../../../../examples/sample-project")
    );

    expect(result.findings.length).toBeGreaterThan(0);
    expect(
      result.findings.every((finding) => finding.ruleId === finding.id && finding.ruleId.length > 0)
    ).toBe(true);
  });
});
