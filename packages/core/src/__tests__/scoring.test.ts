import { describe, expect, it } from "vitest";
import { TransparentScoringModel } from "../scoring/model.js";
import type { Finding, ProjectSignals } from "../schemas/types.js";

const signals: ProjectSignals = {
  rootPath: "/tmp/demo",
  projectName: "demo",
  scannedFiles: [],
  artifacts: {},
  docsMarkdownFiles: [],
  openApiFiles: [],
  mcpFiles: [],
  configFiles: [],
  benchmarkFiles: [],
  ignoredPaths: [],
  warnings: [],
  errors: [],
  scanStats: {
    filesScanned: 0,
    textFilesRead: 0,
    bytesRead: 0,
    docsMarkdownFileCount: 0,
    openApiFileCount: 0,
    benchmarkFileCount: 0
  },
  textByPath: {}
};

describe("TransparentScoringModel", () => {
  it("subtracts severity weights and clamps score", () => {
    const findings: Finding[] = [
      baseFinding("critical"),
      baseFinding("high"),
      baseFinding("medium"),
      baseFinding("low"),
      baseFinding("info")
    ];

    const result = new TransparentScoringModel().score(findings, signals);

    expect(result.score).toBe(63);
    expect(result.scoringModelVersion).toBe("0.1.0");
  });

  it("computes subscores by category", () => {
    const result = new TransparentScoringModel().score(
      [{ ...baseFinding("high"), category: "security_and_privacy" }],
      signals
    );

    expect(result.subscores.find((subscore) => subscore.id === "security_and_privacy")?.score).toBe(
      90
    );
    expect(result.subscores.find((subscore) => subscore.id === "documentation")?.score).toBe(100);
  });
});

function baseFinding(severity: Finding["severity"]): Finding {
  return {
    id: `finding.${severity}`,
    title: "Finding",
    severity,
    category: "agent_instructions",
    description: "Description",
    evidence: ["Evidence"],
    recommendation: "Recommendation",
    suggestedFixType: "review_manually"
  };
}
