import type {
  Coverage,
  DetectedArtifact,
  DetectedProject,
  Finding,
  FindingCategory,
  ProjectSignals,
  ScanProfile,
  ScoreCap,
  ScoreConfidenceLevel
} from "../schemas/types.js";

const allCategories: FindingCategory[] = [
  "agent_instructions",
  "documentation",
  "api_schema",
  "mcp_tools",
  "examples",
  "setup_and_tests",
  "security_and_privacy",
  "task_benchmarks",
  "repo_structure",
  "freshness_and_consistency"
];

const profileCategories: Record<ScanProfile, FindingCategory[]> = {
  default: [
    "agent_instructions",
    "documentation",
    "setup_and_tests",
    "security_and_privacy",
    "task_benchmarks",
    "freshness_and_consistency"
  ],
  devtool: [
    "agent_instructions",
    "documentation",
    "examples",
    "setup_and_tests",
    "security_and_privacy",
    "task_benchmarks",
    "freshness_and_consistency"
  ],
  api: [
    "agent_instructions",
    "documentation",
    "api_schema",
    "examples",
    "setup_and_tests",
    "security_and_privacy",
    "task_benchmarks",
    "freshness_and_consistency"
  ],
  mcp: [
    "agent_instructions",
    "documentation",
    "mcp_tools",
    "examples",
    "setup_and_tests",
    "security_and_privacy",
    "task_benchmarks",
    "freshness_and_consistency"
  ],
  docs: [
    "agent_instructions",
    "documentation",
    "security_and_privacy",
    "task_benchmarks",
    "freshness_and_consistency"
  ],
  library: [
    "agent_instructions",
    "documentation",
    "examples",
    "setup_and_tests",
    "security_and_privacy",
    "task_benchmarks",
    "freshness_and_consistency"
  ],
  internal: [
    "agent_instructions",
    "documentation",
    "setup_and_tests",
    "security_and_privacy",
    "freshness_and_consistency"
  ]
};

export interface CalibratedScore {
  score: number;
  rawScore: number;
  scoreConfidence: ScoreConfidenceLevel;
  scoreConfidenceScore: number;
  coverage: Coverage;
  scoringCaps: ScoreCap[];
}

export function calibrateScore(input: {
  rawScore: number;
  findings: Finding[];
  signals: ProjectSignals;
  detectedProject: DetectedProject;
  detectedArtifacts: DetectedArtifact[];
  profile: ScanProfile;
}): CalibratedScore {
  const coverage = computeCoverage(input);
  const scoringCaps = computeScoreCaps(input, coverage);
  const cappedScore = scoringCaps.reduce(
    (score, cap) => Math.min(score, cap.maxScore),
    input.rawScore
  );
  const confidenceScore = computeConfidenceScore(input, coverage, scoringCaps);
  return {
    score: Math.round(cappedScore),
    rawScore: input.rawScore,
    scoreConfidence: confidenceScore >= 85 ? "high" : confidenceScore >= 60 ? "medium" : "low",
    scoreConfidenceScore: confidenceScore,
    coverage,
    scoringCaps
  };
}

function computeCoverage(input: {
  findings: Finding[];
  signals: ProjectSignals;
  detectedProject: DetectedProject;
  detectedArtifacts: DetectedArtifact[];
  profile: ScanProfile;
}): Coverage {
  const applicable = profileCategories[input.profile];
  const notApplicable = allCategories.filter((category) => !applicable.includes(category));
  const notEvaluatedFindings = input.findings.filter((finding) =>
    finding.id.includes("not-evaluated")
  );
  const evaluatedCategories = applicable.filter((category) =>
    categoryWasEvaluated(category, input)
  );
  const missingCategories = applicable.filter(
    (category) => !evaluatedCategories.includes(category)
  );
  const evaluatedChecks =
    evaluatedCategories.length +
    input.findings.filter((finding) => finding.severity !== "info").length;
  const notEvaluatedChecks = notEvaluatedFindings.length + missingCategories.length;
  const applicableChecks = evaluatedChecks + notEvaluatedChecks;
  return {
    evaluatedChecks,
    skippedChecks: 0,
    notApplicableChecks: notApplicable.length,
    notEvaluatedChecks,
    evaluatedCategories,
    missingCategories,
    coveragePercent:
      applicableChecks === 0 ? 0 : Math.round((evaluatedChecks / applicableChecks) * 100)
  };
}

function categoryWasEvaluated(
  category: FindingCategory,
  input: {
    findings: Finding[];
    signals: ProjectSignals;
    detectedProject: DetectedProject;
    detectedArtifacts: DetectedArtifact[];
  }
): boolean {
  if (
    input.findings.some(
      (finding) => finding.category === category && !finding.id.includes("not-evaluated")
    )
  ) {
    return true;
  }
  if (category === "agent_instructions") {
    return input.detectedArtifacts.some(
      (artifact) =>
        ["AGENTS.md", "CLAUDE.md", "llms.txt"].includes(artifact.path) && artifact.exists
    );
  }
  if (category === "documentation") {
    return (
      input.signals.artifacts["README.md"]?.exists === true ||
      input.signals.docsMarkdownFiles.length > 0
    );
  }
  if (category === "setup_and_tests") {
    return (
      Boolean(input.signals.packageJson) ||
      input.detectedProject.type === "python" ||
      input.detectedProject.type === "rust" ||
      input.detectedProject.type === "go"
    );
  }
  if (category === "api_schema") return input.signals.openApiFiles.length > 0;
  if (category === "task_benchmarks") {
    return input.signals.benchmarkFiles.length > 0;
  }
  if (category === "security_and_privacy") {
    return (
      input.signals.artifacts[".agentlighthouseignore"]?.exists === true ||
      input.signals.artifacts["AGENTS.md"]?.exists === true
    );
  }
  return false;
}

function computeScoreCaps(
  input: {
    findings: Finding[];
    signals: ProjectSignals;
    detectedProject: DetectedProject;
    detectedArtifacts: DetectedArtifact[];
    profile: ScanProfile;
  },
  coverage: Coverage
): ScoreCap[] {
  const ids = new Set(input.findings.map((finding) => finding.id));
  const caps: ScoreCap[] = [];
  const hasAnyAgentInstructions =
    input.signals.artifacts["AGENTS.md"]?.exists ||
    input.signals.artifacts["CLAUDE.md"]?.exists ||
    input.signals.artifacts["llms.txt"]?.exists;
  if (!hasAnyAgentInstructions) {
    caps.push({
      id: "cap.no-agent-instructions",
      maxScore: 80,
      reason: "No agent instruction artifact exists."
    });
  }
  if (ids.has("setup.package-json-no-scripts") || ids.has("setup.missing-test-script")) {
    caps.push({
      id: "cap.setup-or-tests-not-verifiable",
      maxScore: 85,
      reason: "Setup or test commands are not verifiable from project scripts."
    });
  }
  if (
    ids.has("docs.missing-readme") ||
    (input.signals.docsMarkdownFiles.length === 0 && !input.signals.artifacts["README.md"]?.exists)
  ) {
    caps.push({
      id: "cap.docs-missing",
      maxScore: 70,
      reason: "Documentation is missing or not analyzable."
    });
  }
  if (input.detectedProject.type === "unknown") {
    caps.push({
      id: "cap.unknown-project-type",
      maxScore: 75,
      reason: "Project type could not be confidently detected."
    });
  }
  if (input.signals.benchmarkFiles.length === 0 && input.profile !== "internal") {
    caps.push({
      id: "cap.no-task-benchmarks",
      maxScore: 90,
      reason: "No realistic agent task benchmark file was found."
    });
  }
  if (coverage.coveragePercent < 70) {
    caps.push({
      id: "cap.low-coverage",
      maxScore: 85,
      reason: "Less than 70% of applicable checks were evaluated."
    });
  }
  if (coverage.coveragePercent < 50) {
    caps.push({
      id: "cap.very-low-coverage",
      maxScore: 70,
      reason: "Less than half of applicable checks were evaluated."
    });
  }
  if (
    input.detectedArtifacts.some(
      (artifact) =>
        ["AGENTS.md", "README.md", "llms.txt"].includes(artifact.path) &&
        artifact.exists &&
        (artifact.quality === "thin" || artifact.quality === "partial")
    )
  ) {
    caps.push({
      id: "cap.shallow-key-artifacts",
      maxScore: 95,
      reason: "One or more key agent-readiness artifacts are shallow or partial."
    });
  }
  if (input.profile === "api" && input.signals.openApiFiles.length === 0) {
    caps.push({
      id: "cap.api-profile-without-openapi",
      maxScore: 82,
      reason: "API profile selected but no OpenAPI schema was detected."
    });
  }
  if (input.profile === "mcp" && input.signals.mcpFiles.length === 0) {
    caps.push({
      id: "cap.mcp-profile-without-tools",
      maxScore: 82,
      reason: "MCP profile selected but no MCP files or tool definitions were detected."
    });
  }
  return caps.sort((a, b) => a.maxScore - b.maxScore);
}

function computeConfidenceScore(
  input: {
    findings: Finding[];
    signals: ProjectSignals;
    detectedProject: DetectedProject;
  },
  coverage: Coverage,
  caps: ScoreCap[]
): number {
  let score = Math.round(
    coverage.coveragePercent * 0.55 + input.detectedProject.confidence * 100 * 0.25
  );
  if (input.signals.artifacts["README.md"]?.exists) score += 5;
  if (input.signals.docsMarkdownFiles.length > 0) score += 5;
  if (input.signals.benchmarkFiles.length > 0) score += 5;
  if (input.signals.packageJson?.scripts.test || input.detectedProject.type === "docs_only")
    score += 5;
  score -= input.findings.filter((finding) => finding.id.includes("not-evaluated")).length * 6;
  score -= caps.length * 3;
  return Math.max(0, Math.min(100, Math.round(score)));
}
