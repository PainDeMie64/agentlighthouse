import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  compareScanResults,
  deriveFindingIdentity,
  ensureFindingIdentity,
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
});
