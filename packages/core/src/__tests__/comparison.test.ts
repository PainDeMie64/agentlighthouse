import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  compareScanResults,
  deriveFindingIdentity,
  ensureFindingIdentity,
  inferLocation,
  parseChangedFilesText,
  parseGitNameStatus,
  sampleScanResult,
  scanProject
} from "../index.js";

describe("finding identity", () => {
  it("is stable across repeated scans", async () => {
    const samplePath = path.resolve(
      import.meta.dirname,
      "../../../../examples/openapi-bad-project"
    );
    const first = await scanProject(samplePath);
    const second = await scanProject(samplePath);

    expect(first.findings.map((finding) => finding.fingerprint)).toEqual(
      second.findings.map((finding) => finding.fingerprint)
    );
  });

  it("differs for different rule IDs and OpenAPI operations", () => {
    const first = deriveFindingIdentity({
      ruleId: "OPENAPI_MISSING_REQUEST_EXAMPLE",
      affectedFile: "openapi.yaml",
      evidence: ["openapi.yaml: POST /customers (createCustomer)"]
    });
    const second = deriveFindingIdentity({
      ruleId: "OPENAPI_MISSING_RESPONSE_EXAMPLE",
      affectedFile: "openapi.yaml",
      evidence: ["openapi.yaml: POST /customers (createCustomer)"]
    });
    const third = deriveFindingIdentity({
      ruleId: "OPENAPI_MISSING_REQUEST_EXAMPLE",
      affectedFile: "openapi.yaml",
      evidence: ["openapi.yaml: POST /invoices (createInvoice)"]
    });

    expect(first.identityParts).not.toEqual(second.identityParts);
    expect(first.identityParts).not.toEqual(third.identityParts);
  });

  it("differs for different MCP tools and normalizes paths", () => {
    const first = deriveFindingIdentity({
      ruleId: "MCP_TOOL_DESCRIPTION_SHALLOW",
      affectedFile: ".\\src\\server.ts",
      evidence: [".\\src\\server.ts: create"]
    });
    const second = deriveFindingIdentity({
      ruleId: "MCP_TOOL_DESCRIPTION_SHALLOW",
      affectedFile: "./src/server.ts",
      evidence: ["./src/server.ts: delete"]
    });

    expect(first.locationKey).toContain("src/server.ts");
    expect(first.identityParts).not.toEqual(second.identityParts);
  });
});

describe("compareScanResults", () => {
  it("detects new, resolved, unchanged, score deltas, and severity deltas", () => {
    const baseline = {
      ...sampleScanResult,
      scanId: "baseline",
      score: 80,
      findings: [sampleScanResult.findings[0]!, sampleScanResult.findings[1]!]
    };
    const current = {
      ...sampleScanResult,
      scanId: "current",
      score: 70,
      findings: [
        sampleScanResult.findings[0]!,
        {
          ...sampleScanResult.findings[2]!,
          id: "new-security",
          ruleId: "security.new",
          fingerprint: undefined
        }
      ]
    };

    const comparison = compareScanResults(baseline, current);

    expect(comparison.deltas.scoreDelta).toBe(-10);
    expect(comparison.findings.new).toHaveLength(1);
    expect(comparison.findings.resolved).toHaveLength(1);
    expect(comparison.findings.unchanged).toHaveLength(1);
    expect(comparison.deltas.severityCountDeltas.medium).toBe(0);
    expect(comparison.summary.regressionDetected).toBe(true);
  });

  it("classifies worsened and improved severities", () => {
    const baseFinding = ensureFindingIdentity(sampleScanResult.findings[1]!);
    const comparison = compareScanResults(
      {
        ...sampleScanResult,
        scanId: "baseline",
        findings: [{ ...baseFinding, severity: "low" }]
      },
      {
        ...sampleScanResult,
        scanId: "current",
        findings: [{ ...baseFinding, severity: "high" }]
      }
    );

    expect(comparison.findings.worsened).toHaveLength(1);
    expect(comparison.findings.worsened[0]?.previousSeverity).toBe("low");
    expect(comparison.findings.worsened[0]?.currentSeverity).toBe("high");
  });

  it("classifies PR impact using changed files", () => {
    const baselineFinding = ensureFindingIdentity({
      ...sampleScanResult.findings[0]!,
      affectedFile: "README.md",
      location: { file: "README.md", startLine: 4, sourceKind: "markdown" }
    });
    const newFinding = ensureFindingIdentity({
      ...sampleScanResult.findings[1]!,
      id: "new-task",
      ruleId: "TASK_SUCCESS_CRITERIA_MISSING",
      affectedFile: "agentlighthouse.tasks.yaml",
      location: { file: "agentlighthouse.tasks.yaml", startLine: 8, sourceKind: "task" }
    });
    const globalFinding = ensureFindingIdentity({
      ...sampleScanResult.findings[2]!,
      id: "global-command",
      ruleId: "COMMAND_VERIFICATION_SKIPPED",
      affectedFile: undefined
    });
    const comparison = compareScanResults(
      { ...sampleScanResult, scanId: "baseline", findings: [baselineFinding] },
      {
        ...sampleScanResult,
        scanId: "current",
        findings: [baselineFinding, newFinding, globalFinding]
      },
      {
        changedFiles: [{ path: "agentlighthouse.tasks.yaml", status: "added", source: "explicit" }]
      }
    );

    expect(comparison.prImpact?.newFindingsOnChangedFiles).toHaveLength(1);
    expect(comparison.prImpact?.newFindingsOnChangedFiles[0]?.prImpactClassification).toBe(
      "touched"
    );
    expect(comparison.prImpact?.globalNewFindings).toHaveLength(1);
    expect(comparison.prImpact?.unrelatedExistingFindings).toHaveLength(1);
  });
});

describe("changed file parsing", () => {
  it("parses explicit and git name-status formats", () => {
    expect(parseChangedFilesText("M\tREADME.md\nR100\told name.md\tnew name.md")).toEqual([
      { path: "README.md", status: "modified", source: "explicit" },
      { path: "new name.md", oldPath: "old name.md", status: "renamed", source: "explicit" }
    ]);

    expect(parseGitNameStatus("A\0src/new.ts\0D\0src/old.ts\0R100\0a.ts\0b.ts\0")).toEqual([
      { path: "src/new.ts", status: "added", source: "git" },
      { path: "src/old.ts", status: "deleted", source: "git" },
      { path: "b.ts", oldPath: "a.ts", status: "renamed", source: "git" }
    ]);
  });
});

describe("finding locations", () => {
  it("locates markdown headings and OpenAPI operations", () => {
    const signals = {
      ...sampleScanResult.signals,
      textByPath: {
        "README.md": "# Project\n\n## Installation\n\nRun pnpm install\n",
        "openapi.yaml": "openapi: 3.1.0\npaths:\n  /customers:\n    post:\n      summary: Create\n"
      }
    };

    expect(
      inferLocation(signals, {
        affectedFile: "README.md",
        ruleId: "README_MISSING_VERIFICATION_STEP",
        title: "README has installation but no verification step",
        evidence: []
      })?.startLine
    ).toBe(3);
    expect(
      inferLocation(signals, {
        affectedFile: "openapi.yaml",
        ruleId: "OPENAPI_MISSING_REQUEST_EXAMPLE",
        title: "Missing request example",
        evidence: ["openapi.yaml: POST /customers"],
        subject: "POST /customers",
        locationKey: "openapi.yaml#/paths/~1customers/post"
      })?.startLine
    ).toBe(4);
  });
});
