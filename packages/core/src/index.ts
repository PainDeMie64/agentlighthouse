import type {
  ApiAnalysis,
  CommandProbeSummary,
  McpAnalysis,
  ProjectSignals,
  ScanOptions,
  ScanResult,
  ScoreInterpretation
} from "./schemas/types.js";
import { analyzeMcp } from "./analyzers/mcp.js";
import { analyzeOpenApi } from "./analyzers/openapi.js";
import { ReadinessAnalyzer } from "./analyzers/readiness.js";
import { analyzeTaskBenchmarks } from "./analyzers/tasks.js";
import { compareScanResults } from "./comparison/compare.js";
import { resolveConfig, resolveProfile } from "./config/profile.js";
import { detectProject, detectedArtifacts } from "./detection/project.js";
import { enrichFindingLocations } from "./findings/locations.js";
import { StarterArtifactGenerator } from "./generators/artifacts.js";
import { runCommandProbes } from "./probes/commands.js";
import { LocalFilesystemScanner } from "./scanners/filesystem.js";
import { calibrateScore } from "./scoring/calibration.js";
import { TransparentScoringModel } from "./scoring/model.js";

export const agentLighthouseVersion = "0.1.0-alpha.1";

export * from "./schemas/types.js";
export * from "./analyzers/mcp.js";
export * from "./analyzers/openapi.js";
export * from "./analyzers/readiness.js";
export * from "./analyzers/tasks.js";
export * from "./changes/files.js";
export * from "./config/profile.js";
export * from "./comparison/compare.js";
export * from "./detection/project.js";
export * from "./findings/helpers.js";
export * from "./findings/locations.js";
export * from "./generators/artifacts.js";
export * from "./probes/commands.js";
export * from "./reporters/cli.js";
export * from "./reporters/comparison.js";
export * from "./reporters/github-summary.js";
export * from "./reporters/json.js";
export * from "./reporters/markdown.js";
export * from "./reporters/pr-summary.js";
export * from "./reporters/sarif.js";
export * from "./reporters/shared.js";
export * from "./scanners/filesystem.js";
export * from "./scoring/model.js";

export async function scanProject(
  projectPath: string,
  options: ScanOptions = {}
): Promise<ScanResult> {
  const startedAt = new Date();
  const scanner = new LocalFilesystemScanner();
  const scoring = new TransparentScoringModel();
  const warnings: string[] = [];
  const errors: string[] = [];
  let signals = await scanner.scan(projectPath, options);
  const config = resolveConfig(signals);
  const profile = resolveProfile(signals, options).profile;
  const probes = {
    ...config.probes,
    ...options.probes,
    allowedScripts: options.probes?.allowedScripts ?? config.probes?.allowedScripts
  };
  const analyzer = new ReadinessAnalyzer(profile);
  const detectedProject = detectProject(signals);
  const openApi = analyzeOpenApi(signals);
  const mcp = analyzeMcp(signals);
  const commandProbeRun = await runCommandProbes(signals, detectedProject, {
    ...options,
    probes
  });
  const findings = enrichFindingLocations(signals, [
    ...analyzer.analyze(signals),
    ...openApi.findings,
    ...mcp.findings,
    ...analyzeTaskBenchmarks(signals),
    ...commandProbeRun.findings
  ]);
  const scored = scoring.score(findings, signals);
  const artifacts = detectedArtifacts(signals);
  const calibrated = calibrateScore({
    rawScore: scored.score,
    findings,
    signals,
    detectedProject,
    detectedArtifacts: artifacts,
    profile
  });
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
    profile,
    ...scored,
    ...calibrated,
    projectName: signals.projectName,
    findings,
    scoreInterpretation: interpretScore({
      score: calibrated.score,
      signals,
      apiAnalysis: openApi.analysis,
      mcpAnalysis: mcp.analysis,
      commandProbes: commandProbeRun.summary
    }),
    apiAnalysis: openApi.analysis,
    mcpAnalysis: mcp.analysis,
    commandProbes: commandProbeRun.summary,
    detectedProject,
    detectedArtifacts: artifacts,
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

function interpretScore(input: {
  score: number;
  signals: ProjectSignals;
  apiAnalysis: ApiAnalysis;
  mcpAnalysis: McpAnalysis;
  commandProbes: CommandProbeSummary;
}): ScoreInterpretation {
  const humanSignals = [
    input.signals.artifacts["README.md"]?.exists ? "README present" : undefined,
    input.signals.docsMarkdownFiles.length > 0
      ? `${input.signals.docsMarkdownFiles.length} Markdown doc file(s)`
      : undefined,
    input.signals.packageJson ? "package metadata present" : undefined,
    input.apiAnalysis.specFiles.length > 0 ? "OpenAPI spec present" : undefined,
    input.mcpAnalysis.detected ? "MCP files or dependencies present" : undefined
  ].filter((signal): signal is string => Boolean(signal));
  const agentSignals = [
    input.signals.artifacts["AGENTS.md"]?.exists ? "AGENTS.md present" : undefined,
    input.signals.artifacts["CLAUDE.md"]?.exists ? "CLAUDE.md present" : undefined,
    input.signals.artifacts["llms.txt"]?.exists ? "llms.txt present" : undefined,
    input.signals.artifacts[".cursor/rules"]?.exists ? "Cursor rules present" : undefined,
    input.signals.artifacts[".github/copilot-instructions.md"]?.exists
      ? "Copilot instructions present"
      : undefined,
    input.signals.benchmarkFiles.length > 0 ? "agent task benchmark present" : undefined
  ].filter((signal): signal is string => Boolean(signal));
  const verifiabilitySignals = [
    input.signals.packageJson?.scripts.test ? "test script declared" : undefined,
    input.signals.packageJson?.scripts.lint ? "lint script declared" : undefined,
    input.signals.packageJson?.scripts.typecheck ? "typecheck script declared" : undefined,
    input.apiAnalysis.operationsWithExamples > 0
      ? `${input.apiAnalysis.operationsWithExamples} API operation(s) have examples`
      : undefined,
    input.commandProbes.enabled
      ? `${input.commandProbes.passed}/${input.commandProbes.attempted} command probes passed`
      : "command probes not run"
  ].filter((signal): signal is string => Boolean(signal));

  return {
    agentReadinessScore: input.score,
    humanReadableProjectSignals: {
      score: boundedScore(
        humanSignals.length * 20 + Math.min(input.apiAnalysis.operationCount, 5) * 3
      ),
      summary:
        "Human-readable project signals describe conventional repo, docs, examples, and API context.",
      signals: humanSignals
    },
    agentSpecificContextLayer: {
      score: boundedScore(agentSignals.length * 17),
      summary:
        "Agent-specific context is the machine-readable layer that helps coding agents work safely.",
      signals: agentSignals
    },
    verifiability: {
      score: boundedScore(
        verifiabilitySignals.filter((signal) => signal !== "command probes not run").length * 20 +
          (input.commandProbes.enabled ? 15 : 0)
      ),
      summary:
        "Verifiability measures whether setup, tests, examples, and workflows can be checked.",
      signals: verifiabilitySignals
    }
  };
}

function boundedScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export const sampleScanResult: ScanResult = {
  scanId: "scan_demo",
  scannedPath: "/sample/agent-ready-project",
  startedAt: "2026-05-20T00:00:00.000Z",
  completedAt: "2026-05-20T00:00:00.120Z",
  durationMs: 120,
  agentLighthouseVersion,
  profile: "devtool",
  projectName: "sample-agent-ready-project",
  scoringModelVersion: "0.1.0",
  score: 72,
  rawScore: 82,
  scoreConfidence: "medium",
  scoreConfidenceScore: 76,
  coverage: {
    evaluatedChecks: 12,
    skippedChecks: 0,
    notApplicableChecks: 2,
    notEvaluatedChecks: 3,
    evaluatedCategories: [
      "agent_instructions",
      "documentation",
      "setup_and_tests",
      "security_and_privacy",
      "freshness_and_consistency"
    ],
    missingCategories: ["examples", "task_benchmarks"],
    coveragePercent: 80
  },
  scoringCaps: [
    {
      id: "cap.no-task-benchmarks",
      maxScore: 90,
      reason: "No realistic agent task benchmark file was found."
    }
  ],
  scoreInterpretation: {
    agentReadinessScore: 72,
    humanReadableProjectSignals: {
      score: 75,
      summary:
        "Human-readable project signals describe conventional repo, docs, examples, and API context.",
      signals: ["README present", "package metadata present", "OpenAPI spec present"]
    },
    agentSpecificContextLayer: {
      score: 51,
      summary:
        "Agent-specific context is the machine-readable layer that helps coding agents work safely.",
      signals: ["AGENTS.md present", "agent task benchmark present"]
    },
    verifiability: {
      score: 60,
      summary:
        "Verifiability measures whether setup, tests, examples, and workflows can be checked.",
      signals: ["test script declared", "command probes not run"]
    }
  },
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
      ruleId: "setup.missing-test-script",
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
      id: "TASK_BENCHMARK_MISSING",
      ruleId: "TASK_BENCHMARK_MISSING",
      title: "Missing agent task benchmark file",
      severity: "medium",
      category: "task_benchmarks",
      description: "The project has no task benchmark describing realistic agent workflows.",
      evidence: ["No benchmark file was found."],
      recommendation: "Add a benchmark file with realistic developer tasks.",
      affectedFile: "agentlighthouse.tasks.yaml",
      suggestedFixType: "create_file"
    },
    {
      id: "security.agent-secret-guidance-missing",
      ruleId: "security.agent-secret-guidance-missing",
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
  apiAnalysis: {
    specFiles: ["openapi.yaml"],
    operationCount: 8,
    operationsWithExamples: 4,
    operationsMissingDescriptions: 2,
    destructiveOperations: ["openapi.yaml: DELETE /v1/widgets/{id} (deleteWidget)"],
    authSchemes: ["bearerAuth"],
    weakOperations: ["openapi.yaml: POST /v1/widgets (createWidget)"],
    highRiskOperations: ["openapi.yaml: DELETE /v1/widgets/{id} (deleteWidget)"]
  },
  mcpAnalysis: {
    detected: false,
    files: [],
    toolCount: 0,
    toolsWithSchemas: 0,
    toolsWithExamples: 0,
    ambiguousTools: [],
    destructiveTools: [],
    privacySensitiveTools: [],
    weakTools: []
  },
  commandProbes: {
    enabled: false,
    attempted: 0,
    skipped: 3,
    passed: 0,
    failed: 0,
    timedOut: 0,
    results: []
  },
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

export const sampleComparisonResult = compareScanResults(
  {
    ...sampleScanResult,
    scanId: "scan_demo_baseline",
    completedAt: "2026-05-19T00:00:00.120Z",
    score: 63,
    scoreConfidence: "low",
    scoreConfidenceScore: 55,
    coverage: {
      ...sampleScanResult.coverage,
      coveragePercent: 51
    },
    findings: [
      ...sampleScanResult.findings,
      {
        ...sampleScanResult.findings[0]!,
        id: "llms.missing",
        ruleId: "llms.missing",
        title: "Missing llms.txt",
        severity: "medium",
        category: "agent_instructions",
        description: "The baseline lacked an LLM-readable project map.",
        evidence: ["llms.txt was not found at the repository root."],
        recommendation: "Create llms.txt with links to README, docs, architecture, and examples.",
        affectedFile: "llms.txt",
        suggestedFixType: "create_file"
      }
    ]
  },
  sampleScanResult,
  {
    changedFiles: [
      { path: "package.json", status: "modified", source: "explicit" },
      { path: "AGENTS.md", status: "modified", source: "explicit" },
      { path: "llms.txt", status: "added", source: "explicit" }
    ]
  }
);
