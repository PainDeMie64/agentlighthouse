import type { ScanOptions, ScanResult } from "./schemas/types.js";
import { ReadinessAnalyzer } from "./analyzers/readiness.js";
import { detectProject, detectedArtifacts } from "./detection/project.js";
import { StarterArtifactGenerator } from "./generators/artifacts.js";
import { LocalFilesystemScanner } from "./scanners/filesystem.js";
import { TransparentScoringModel } from "./scoring/model.js";

export const agentLighthouseVersion = "0.1.0";

export * from "./schemas/types.js";
export * from "./analyzers/readiness.js";
export * from "./detection/project.js";
export * from "./generators/artifacts.js";
export * from "./reporters/cli.js";
export * from "./scanners/filesystem.js";
export * from "./scoring/model.js";

export async function scanProject(
  projectPath: string,
  options: ScanOptions = {}
): Promise<ScanResult> {
  const startedAt = new Date();
  const scanner = new LocalFilesystemScanner();
  const analyzer = new ReadinessAnalyzer();
  const scoring = new TransparentScoringModel();
  const warnings: string[] = [];
  const errors: string[] = [];
  let signals = await scanner.scan(projectPath, options);
  const detectedProject = detectProject(signals);
  const findings = analyzer.analyze(signals);
  const scored = scoring.score(findings, signals);
  const completedAt = new Date();
  signals = {
    ...signals,
    warnings: [...signals.warnings, ...warnings],
    errors: [...signals.errors, ...errors]
  };
  return {
    scanId: createScanId(signals.rootPath, startedAt),
    scannedPath: signals.rootPath,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
    agentLighthouseVersion,
    ...scored,
    projectName: signals.projectName,
    findings,
    detectedProject,
    detectedArtifacts: detectedArtifacts(signals),
    scanStats: {
      ...signals.scanStats,
      findingCount: findings.length
    },
    ignoredPaths: signals.ignoredPaths,
    warnings: signals.warnings,
    errors: signals.errors,
    projectPath: signals.rootPath,
    scannedAt: completedAt.toISOString(),
    recommendedActions: scored.recommendations,
    signals
  };
}

export async function generateStarterArtifacts(projectPath: string, options: ScanOptions = {}) {
  const scanner = new LocalFilesystemScanner();
  const generator = new StarterArtifactGenerator();
  const signals = await scanner.scan(projectPath, options);
  return generator.generate(signals);
}

function createScanId(projectPath: string, startedAt: Date): string {
  const input = `${projectPath}:${startedAt.toISOString()}`;
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return `scan_${hash.toString(16).padStart(8, "0")}`;
}

export const sampleScanResult: ScanResult = {
  scanId: "scan_demo",
  scannedPath: "/sample/agent-ready-project",
  startedAt: "2026-05-20T00:00:00.000Z",
  completedAt: "2026-05-20T00:00:00.120Z",
  durationMs: 120,
  agentLighthouseVersion,
  projectName: "sample-agent-ready-project",
  scoringModelVersion: "0.1.0",
  score: 72,
  summary: "Useful foundation, but 2 high-priority readiness issue(s) should be fixed.",
  subscores: [
    { id: "agent_instructions", label: "Agent Instructions", score: 78, findingsCount: 2 },
    { id: "documentation", label: "Documentation", score: 82, findingsCount: 1 },
    { id: "api_and_tooling", label: "API & Tooling", score: 65, findingsCount: 2 },
    { id: "examples_and_tasks", label: "Examples & Tasks", score: 55, findingsCount: 1 },
    { id: "security_and_privacy", label: "Security & Privacy", score: 80, findingsCount: 1 },
    {
      id: "freshness_and_consistency",
      label: "Freshness & Consistency",
      score: 90,
      findingsCount: 0
    }
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
  recommendations: [
    "Add or document setup, test, lint, and typecheck commands.",
    "Add task benchmarks for the top developer workflows agents should complete.",
    "Document secret-handling and privacy rules for agent workflows."
  ],
  detectedProject: {
    type: "node_typescript",
    name: "sample-agent-ready-project",
    confidence: 0.9,
    evidence: ["package.json plus TypeScript config or source files detected."],
    packageManager: "pnpm",
    frameworks: ["TypeScript", "Vitest"]
  },
  detectedArtifacts: [
    {
      path: "AGENTS.md",
      exists: true,
      kind: "file",
      role: "Primary coding-agent instructions",
      quality: "partial",
      notes: ["Includes setup commands.", "Missing security/privacy guidance."]
    },
    {
      path: "llms.txt",
      exists: false,
      kind: "missing",
      role: "LLM-readable project map",
      quality: "missing",
      notes: ["Artifact exists but no text content was available for quality checks."]
    }
  ],
  scanStats: {
    filesScanned: 42,
    textFilesRead: 38,
    bytesRead: 42000,
    docsMarkdownFileCount: 3,
    openApiFileCount: 0,
    benchmarkFileCount: 0,
    findingCount: 3
  },
  ignoredPaths: ["node_modules"],
  errors: [],
  warnings: [],
  projectPath: "/sample/agent-ready-project",
  scannedAt: "2026-05-20T00:00:00.120Z",
  recommendedActions: [
    "Add or document setup, test, lint, and typecheck commands.",
    "Add task benchmarks for the top developer workflows agents should complete.",
    "Document secret-handling and privacy rules for agent workflows."
  ],
  signals: {
    rootPath: "/sample/agent-ready-project",
    projectName: "sample-agent-ready-project",
    scannedFiles: ["README.md", "package.json", "AGENTS.md"],
    artifacts: {
      "AGENTS.md": { path: "AGENTS.md", exists: true, kind: "file", sizeBytes: 600 },
      "CLAUDE.md": { path: "CLAUDE.md", exists: false, kind: "missing" },
      "llms.txt": { path: "llms.txt", exists: false, kind: "missing" },
      "README.md": { path: "README.md", exists: true, kind: "file", sizeBytes: 2000 },
      ".cursor/rules": { path: ".cursor/rules", exists: false, kind: "missing" },
      ".github/copilot-instructions.md": {
        path: ".github/copilot-instructions.md",
        exists: false,
        kind: "missing"
      },
      ".agentlighthouseignore": { path: ".agentlighthouseignore", exists: true, kind: "file" }
    },
    docsMarkdownFiles: ["docs/ARCHITECTURE.md"],
    openApiFiles: [],
    mcpFiles: [],
    configFiles: ["package.json"],
    benchmarkFiles: [],
    ignoredPaths: ["node_modules"],
    warnings: [],
    errors: [],
    scanStats: {
      filesScanned: 42,
      textFilesRead: 38,
      bytesRead: 42000,
      docsMarkdownFileCount: 1,
      openApiFileCount: 0,
      benchmarkFileCount: 0
    },
    packageJson: {
      path: "package.json",
      name: "sample-agent-ready-project",
      packageManager: "pnpm@10.33.0",
      scripts: { build: "tsc" },
      dependencies: [],
      devDependencies: []
    },
    textByPath: {}
  }
};
