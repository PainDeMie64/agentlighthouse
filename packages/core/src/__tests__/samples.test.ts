import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanProject } from "../index.js";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");

describe("sample project scoring", () => {
  it("scores the good sample meaningfully higher than the bad sample", async () => {
    const good = await scanProject(path.join(repoRoot, "examples/sample-good-project"));
    const bad = await scanProject(path.join(repoRoot, "examples/sample-bad-project"));

    expect(good.score).toBeGreaterThanOrEqual(75);
    expect(bad.score).toBeLessThanOrEqual(55);
    expect(good.score - bad.score).toBeGreaterThanOrEqual(25);
  });
});
