import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInitCommand } from "../commands/init.js";

describe("runInitCommand", () => {
  it("does not overwrite existing files unless forced", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-init-"));
    await mkdir(path.join(root, "docs"));
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "demo", scripts: {} }));
    await writeFile(path.join(root, "AGENTS.md"), "Existing instructions");

    await runInitCommand(root, {});

    await expect(readFile(path.join(root, "AGENTS.md"), "utf8")).resolves.toBe(
      "Existing instructions"
    );
    await expect(readFile(path.join(root, "CLAUDE.md"), "utf8")).resolves.toContain(
      "Claude Project Memory"
    );
  });
});
