import { describe, expect, it } from "vitest";
import { renderMarkdownReport, sampleScanResult } from "../index.js";

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
