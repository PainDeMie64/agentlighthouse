import { access } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");

describe("CI distribution assets", () => {
  it("includes the composite action and example workflows", async () => {
    await expect(access(path.join(repoRoot, "action.yml"))).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, ".github/workflows/agentlighthouse.yml"))
    ).resolves.toBeUndefined();
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
    await expect(
      access(path.join(repoRoot, "examples/github-actions/pr-aware-delta.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/changed-files-list.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/scan-only.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/committed-baseline-pr.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/generated-baseline-main.yml"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "examples/github-actions/sarif-code-scanning.yml"))
    ).resolves.toBeUndefined();
  });
});
