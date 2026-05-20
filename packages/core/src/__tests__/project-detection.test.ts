import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectProject, LocalFilesystemScanner } from "../index.js";

describe("detectProject", () => {
  it("detects Node TypeScript projects", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-ts-"));
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "demo", scripts: {} }));
    await writeFile(path.join(root, "tsconfig.json"), "{}");

    const signals = await new LocalFilesystemScanner().scan(root);

    expect(detectProject(signals).type).toBe("node_typescript");
  });

  it("does not force Node findings onto Python projects", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-python-"));
    await writeFile(path.join(root, "pyproject.toml"), "[project]\nname = 'demo'\n");

    const signals = await new LocalFilesystemScanner().scan(root);

    expect(detectProject(signals).type).toBe("python");
  });
});
