import { describe, expect, it } from "vitest";
import {
  renderJsonReport,
  renderMarkdownReport,
  renderPrSummaryReport,
  renderSarifReport,
  sampleScanResult
} from "../index.js";

describe("renderMarkdownReport", () => {
  it("includes report sections needed for GitHub issues", () => {
    const report = renderMarkdownReport(sampleScanResult);

    expect(report).toContain("# AgentLighthouse Report");
    expect(report).toContain("## Project Detection");
    expect(report).toContain("## Score Interpretation");
    expect(report).toContain("## API Analysis");
    expect(report).toContain("## MCP Analysis");
    expect(report).toContain("## Command Probes");
    expect(report).toContain("## Top Findings");
    expect(report).toContain("## Detected Artifacts");
    expect(report).toContain("## Scan Metadata");
  });
});

describe("CI reporters", () => {
  it("renders JSON from the scan result shape", () => {
    const parsed = JSON.parse(renderJsonReport(sampleScanResult)) as { scanId?: string };

    expect(parsed.scanId).toBe(sampleScanResult.scanId);
  });

  it("renders SARIF with rules, results, locations, and finding properties", () => {
    const result = {
      ...sampleScanResult,
      findings: [
        {
          ...sampleScanResult.findings[0]!,
          agentFailureMode: "An agent may skip verification because the command is absent.",
          fixExample: 'Add "test": "vitest run" to package.json.'
        }
      ]
    };
    const sarif = JSON.parse(renderSarifReport(result)) as {
      version: string;
      runs: Array<{
        tool: { driver: { rules: Array<{ id: string }> } };
        results: Array<{
          ruleId: string;
          level: string;
          locations?: unknown[];
          properties: { agentFailureMode?: string };
        }>;
      }>;
    };

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.tool.driver.rules[0]?.id).toBe("setup.missing-test-script");
    expect(sarif.runs[0]?.results[0]?.ruleId).toBe("setup.missing-test-script");
    expect(sarif.runs[0]?.results[0]?.level).toBe("error");
    expect(sarif.runs[0]?.results[0]?.locations).toHaveLength(1);
    expect(sarif.runs[0]?.results[0]?.properties.agentFailureMode).toContain("skip verification");
  });

  it("renders concise PR summaries", () => {
    const summary = renderPrSummaryReport(sampleScanResult, {
      status: "failed",
      reasons: ["AgentLighthouse score 72 is below fail-under threshold 80."],
      reportPaths: ["agentlighthouse-report.md"]
    });

    expect(summary).toContain("AgentLighthouse PR Summary");
    expect(summary).toContain("Score: **72/100**");
    expect(summary).toContain("Gate Result");
    expect(summary).toContain("agentlighthouse-report.md");
    expect(summary).not.toContain("signals");
  });
});
