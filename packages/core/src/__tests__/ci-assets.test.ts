import { access } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");

describe("CI distribution assets", () => {
  it("includes the composite action and example workflows", async () => {
    await expect(access(path.join(repoRoot, "action.yml"))).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/basic.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/sarif.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/strict-gate.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/baseline-comparison.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/pr-delta.yml"))
    ).resolves.toBeUndefined();
  });
});
