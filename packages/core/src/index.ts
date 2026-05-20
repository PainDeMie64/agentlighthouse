import type { ScanOptions, ScanResult } from "./schemas/types.js";
import { ReadinessAnalyzer } from "./analyzers/readiness.js";
import { StarterArtifactGenerator } from "./generators/artifacts.js";
import { LocalFilesystemScanner } from "./scanners/filesystem.js";
import { TransparentScoringModel } from "./scoring/model.js";

export * from "./schemas/types.js";
export * from "./analyzers/readiness.js";
export * from "./generators/artifacts.js";
export * from "./reporters/cli.js";
export * from "./scanners/filesystem.js";
export * from "./scoring/model.js";

export async function scanProject(
  projectPath: string,
  options: ScanOptions = {}
): Promise<ScanResult> {
  const scanner = new LocalFilesystemScanner();
  const analyzer = new ReadinessAnalyzer();
  const scoring = new TransparentScoringModel();
  const signals = await scanner.scan(projectPath, options);
  const findings = analyzer.analyze(signals);
  const scored = scoring.score(findings, signals);
  return {
    ...scored,
    scannedAt: new Date().toISOString(),
    signals
  };
}

export async function generateStarterArtifacts(projectPath: string, options: ScanOptions = {}) {
  const scanner = new LocalFilesystemScanner();
  const generator = new StarterArtifactGenerator();
  const signals = await scanner.scan(projectPath, options);
  return generator.generate(signals);
}

export const sampleScanResult: ScanResult = {
  projectPath: "/sample/agent-ready-project",
  projectName: "sample-agent-ready-project",
  scannedAt: "2026-05-20T00:00:00.000Z",
  scoringModelVersion: "0.1.0",
  score: 72,
  summary: "Useful foundation, but 2 high-priority readiness issue(s) should be fixed.",
  subscores: [
    { id: "agent_instructions", label: "Agent Instructions", score: 78 },
    { id: "documentation", label: "Documentation", score: 82 },
    { id: "api_and_tooling", label: "API & Tooling", score: 65 },
    { id: "examples_and_tasks", label: "Examples & Tasks", score: 55 },
    { id: "security_and_privacy", label: "Security & Privacy", score: 80 },
    { id: "freshness_and_consistency", label: "Freshness & Consistency", score: 90 }
  ],
  findings: [
    {
      id: "setup.missing-test-script",
      title: "No test script in package.json",
      severity: "high",
      category: "setup_and_tests",
      description: "Agents cannot reliably run tests without a package script.",
      evidence: ['package.json scripts does not include "test".'],
      recommendation: "Add a package.json test script or document the equivalent command clearly.",
      affectedFile: "package.json",
      suggestedFixType: "add_script"
    },
    {
      id: "benchmarks.missing-agent-task-file",
      title: "Missing agent task benchmark file",
      severity: "medium",
      category: "task_benchmarks",
      description: "The project has no task benchmark describing realistic agent workflows.",
      evidence: ["No benchmark file was found."],
      recommendation: "Add a benchmark file with realistic developer tasks.",
      affectedFile: "benchmarks/agent-tasks.yaml",
      suggestedFixType: "create_file"
    },
    {
      id: "security.agent-secret-guidance-missing",
      title: "Instructions do not tell agents how to handle secrets",
      severity: "medium",
      category: "security_and_privacy",
      description:
        "Agent-facing instructions should state how to avoid exposing secrets or private data.",
      evidence: ["No secret/privacy guidance was detected in AGENTS.md."],
      recommendation:
        "Add a security section explaining secret handling and external LLM constraints.",
      affectedFile: "AGENTS.md",
      suggestedFixType: "add_section"
    }
  ],
  recommendedActions: [
    "Add or document setup, test, lint, and typecheck commands.",
    "Add task benchmarks for the top developer workflows agents should complete.",
    "Document secret-handling and privacy rules for agent workflows."
  ],
  signals: {
    rootPath: "/sample/agent-ready-project",
    projectName: "sample-agent-ready-project",
    scannedFiles: ["README.md", "package.json", "AGENTS.md"],
    artifacts: {},
    docsMarkdownFiles: ["docs/ARCHITECTURE.md"],
    openApiFiles: [],
    mcpFiles: [],
    configFiles: ["package.json"],
    benchmarkFiles: [],
    packageJson: {
      path: "package.json",
      name: "sample-agent-ready-project",
      scripts: { build: "tsc" },
      dependencies: [],
      devDependencies: []
    },
    textByPath: {}
  }
};
