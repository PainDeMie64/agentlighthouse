import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LocalFilesystemScanner, scanProject } from "../index.js";

describe("LocalFilesystemScanner", () => {
  it("detects core agent-readiness artifacts", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-scan-"));
    await mkdir(path.join(root, "docs"));
    await writeFile(
      path.join(root, "README.md"),
      "# Demo\n\n## Quickstart\n\npnpm install\n\n## Example\n\nRun it."
    );
    await writeFile(path.join(root, "AGENTS.md"), "Run pnpm test. Keep secrets private.");
    await writeFile(path.join(root, "docs", "ARCHITECTURE.md"), "# Architecture");
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "demo",
        scripts: { test: "vitest", lint: "eslint .", typecheck: "tsc --noEmit" }
      })
    );

    const scanner = new LocalFilesystemScanner();
    const signals = await scanner.scan(root);

    expect(signals.projectName).toBe("demo");
    expect(signals.artifacts["README.md"]?.exists).toBe(true);
    expect(signals.docsMarkdownFiles).toContain("docs/ARCHITECTURE.md");
    expect(signals.packageJson?.scripts.test).toBe("vitest");
  });

  it("produces actionable findings for an incomplete project", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-incomplete-"));
    await writeFile(path.join(root, "README.md"), "# Demo\n\nTODO: docs coming soon.");
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "demo", scripts: {} }));

    const result = await scanProject(root);

    expect(result.score).toBeLessThan(100);
    expect(result.findings.map((finding) => finding.id)).toContain(
      "agent-instructions.missing-agents-md"
    );
    expect(result.findings.map((finding) => finding.id)).toContain("setup.package-json-no-scripts");
  });

  it("handles glob-like ignore rules safely", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-ignore-"));
    await writeFile(path.join(root, ".agentlighthouseignore"), "*.log\n");
    await writeFile(path.join(root, "debug.log"), "ignore me");
    await writeFile(path.join(root, "README.md"), "# Demo");

    const scanner = new LocalFilesystemScanner();
    const signals = await scanner.scan(root);

    expect(signals.scannedFiles).toContain("README.md");
    expect(signals.scannedFiles).not.toContain("debug.log");
  });

  it("does not treat pnpm option flags as missing scripts", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-readme-command-"));
    await writeFile(
      path.join(root, "README.md"),
      "# Demo\n\n```bash\npnpm --filter @scope/app dev scan examples/sample-project\n```"
    );
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "demo",
        scripts: { test: "vitest", lint: "eslint .", typecheck: "tsc --noEmit" }
      })
    );

    const result = await scanProject(root);

    expect(result.findings.map((finding) => finding.id)).not.toContain(
      "setup.readme-mentions-missing-scripts"
    );
  });
});
