import { mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  analyzeMcp,
  analyzeOpenApi,
  analyzeTaskBenchmarks,
  LocalFilesystemScanner,
  scanProject
} from "../index.js";

const repoRoot = path.resolve(import.meta.dirname, "../../../../");

describe("semantic analyzers", () => {
  it("analyzes OpenAPI operations and flags weak specs", async () => {
    const scanner = new LocalFilesystemScanner();
    const good = await scanner.scan(path.join(repoRoot, "examples/openapi-good-project"));
    const bad = await scanner.scan(path.join(repoRoot, "examples/openapi-bad-project"));

    const goodResult = analyzeOpenApi(good);
    const badResult = analyzeOpenApi(bad);

    expect(goodResult.analysis.operationCount).toBeGreaterThan(1);
    expect(goodResult.analysis.operationsWithExamples).toBeGreaterThan(0);
    expect(goodResult.analysis.destructiveOperations.length).toBeGreaterThan(0);
    expect(badResult.findings.map((finding) => finding.id)).toContain(
      "OPENAPI_MISSING_ERROR_RESPONSES"
    );
    expect(badResult.findings.map((finding) => finding.id)).toContain(
      "OPENAPI_AMBIGUOUS_OPERATION_NAME"
    );
    expect(badResult.findings.map((finding) => finding.id)).toContain(
      "OPENAPI_DESTRUCTIVE_OPERATION_UNMARKED"
    );
  });

  it("analyzes MCP tools and flags ambiguous unsafe tools", async () => {
    const scanner = new LocalFilesystemScanner();
    const good = await scanner.scan(path.join(repoRoot, "examples/mcp-good-project"));
    const bad = await scanner.scan(path.join(repoRoot, "examples/mcp-bad-project"));

    const goodResult = analyzeMcp(good);
    const badResult = analyzeMcp(bad);

    expect(goodResult.analysis.detected).toBe(true);
    expect(goodResult.analysis.toolCount).toBe(2);
    expect(goodResult.analysis.toolsWithSchemas).toBe(2);
    expect(badResult.findings.map((finding) => finding.id)).toContain("MCP_TOOL_NAME_AMBIGUOUS");
    expect(badResult.findings.map((finding) => finding.id)).toContain(
      "MCP_TOOL_INPUT_SCHEMA_MISSING"
    );
  });

  it("keeps command probes disabled by default and enables them explicitly", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "agentlighthouse-probes-"));
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "probe-fixture",
        scripts: {
          test: 'node -e "process.exit(0)"'
        }
      }),
      "utf8"
    );

    const defaultResult = await scanProject(root);
    const probedResult = await scanProject(root, {
      probes: { commands: true, allowedScripts: ["test"], timeoutMs: 5000 }
    });

    expect(defaultResult.commandProbes.enabled).toBe(false);
    expect(defaultResult.findings.map((finding) => finding.id)).toContain(
      "COMMAND_VERIFICATION_SKIPPED"
    );
    expect(probedResult.commandProbes.enabled).toBe(true);
    expect(probedResult.commandProbes.passed).toBe(1);
  });

  it("flags vague benchmark tasks and accepts richer task metadata", async () => {
    const scanner = new LocalFilesystemScanner();
    const good = await scanner.scan(path.join(repoRoot, "examples/openapi-good-project"));
    const badRoot = await mkdtemp(path.join(tmpdir(), "agentlighthouse-tasks-"));
    await writeFile(
      path.join(badRoot, "agentlighthouse.tasks.yaml"),
      "version: 0.1.0\ntasks:\n  - id: vague\n    title: Vague\n    objective: Fix it\n",
      "utf8"
    );
    const bad = await scanner.scan(badRoot);

    expect(analyzeTaskBenchmarks(good)).toHaveLength(0);
    expect(analyzeTaskBenchmarks(bad).map((finding) => finding.id)).toContain(
      "TASK_SUCCESS_CRITERIA_MISSING"
    );
  });

  it("profiles change API and MCP emphasis", async () => {
    const apiAsDocs = await scanProject(path.join(repoRoot, "examples/openapi-bad-project"), {
      profile: "docs"
    });
    const apiAsApi = await scanProject(path.join(repoRoot, "examples/openapi-bad-project"), {
      profile: "api"
    });
    const mcp = await scanProject(path.join(repoRoot, "examples/mcp-bad-project"), {
      profile: "mcp"
    });

    expect(apiAsApi.score).toBeLessThanOrEqual(apiAsDocs.score);
    expect(mcp.profile).toBe("mcp");
    expect(mcp.findings.some((finding) => finding.id.startsWith("MCP_"))).toBe(true);
  });

  it("reports include semantic sections and agent failure modes", async () => {
    const result = await scanProject(path.join(repoRoot, "examples/openapi-bad-project"));

    expect(result.apiAnalysis.operationCount).toBeGreaterThan(0);
    expect(result.scoreInterpretation.agentReadinessScore).toBe(result.score);
    expect(result.findings.some((finding) => finding.agentFailureMode)).toBe(true);
  });
});
