import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanProject } from "../index.js";

describe("artifact quality analysis", () => {
  it("reports specific missing AGENTS.md sections", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-artifact-"));
    await writeFile(path.join(root, "README.md"), "# Demo\n\n## Quickstart\n\npnpm install");
    await writeFile(path.join(root, "AGENTS.md"), "# Agents\n\nRun `pnpm test`.");
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "demo", scripts: { test: "vitest" } })
    );

    const result = await scanProject(root);

    expect(result.findings.map((finding) => finding.id)).toContain(
      "artifact-quality.AGENTSmd.missing-architecture-map"
    );
  });
});
