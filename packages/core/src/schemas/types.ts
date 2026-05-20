import { z } from "zod";

export const severities = ["critical", "high", "medium", "low", "info"] as const;
export const findingCategories = [
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
] as const;
export const scanProfiles = ["default", "devtool", "api", "docs", "library", "internal"] as const;
export const scoreConfidenceLevels = ["high", "medium", "low"] as const;
export const suggestedFixTypes = [
  "create_file",
  "update_file",
  "add_section",
  "add_script",
  "add_example",
  "review_manually",
  "none"
] as const;
export const projectTypes = [
  "node_typescript",
  "node_javascript",
  "python",
  "rust",
  "go",
  "docs_only",
  "openapi_project",
  "mcp_project",
  "unknown"
] as const;

export const severitySchema = z.enum(severities);
export const findingCategorySchema = z.enum(findingCategories);
export const suggestedFixTypeSchema = z.enum(suggestedFixTypes);
export const projectTypeSchema = z.enum(projectTypes);
export const scanProfileSchema = z.enum(scanProfiles);
export const scoreConfidenceLevelSchema = z.enum(scoreConfidenceLevels);

export const findingSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  title: z.string(),
  severity: severitySchema,
  category: findingCategorySchema,
  description: z.string(),
  evidence: z.array(z.string()),
  recommendation: z.string(),
  affectedFile: z.string().optional(),
  suggestedFixType: suggestedFixTypeSchema
});

export const artifactSignalSchema = z.object({
  path: z.string(),
  exists: z.boolean(),
  kind: z.enum(["file", "directory", "missing"]).default("missing"),
  sizeBytes: z.number().nonnegative().optional(),
  contentPreview: z.string().optional()
});

export const packageJsonSignalSchema = z.object({
  path: z.string(),
  name: z.string().optional(),
  packageManager: z.string().optional(),
  scripts: z.record(z.string()),
  dependencies: z.array(z.string()),
  devDependencies: z.array(z.string())
});

export const projectSignalsSchema = z.object({
  rootPath: z.string(),
  projectName: z.string(),
  scannedFiles: z.array(z.string()),
  artifacts: z.record(artifactSignalSchema),
  docsMarkdownFiles: z.array(z.string()),
  openApiFiles: z.array(z.string()),
  mcpFiles: z.array(z.string()),
  configFiles: z.array(z.string()),
  benchmarkFiles: z.array(z.string()),
  ignoredPaths: z.array(z.string()),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  scanStats: z.object({
    filesScanned: z.number().nonnegative(),
    textFilesRead: z.number().nonnegative(),
    bytesRead: z.number().nonnegative(),
    docsMarkdownFileCount: z.number().nonnegative(),
    openApiFileCount: z.number().nonnegative(),
    benchmarkFileCount: z.number().nonnegative()
  }),
  packageJson: packageJsonSignalSchema.optional(),
  textByPath: z.record(z.string())
});

export const subscoreSchema = z.object({
  id: z.string(),
  label: z.string(),
  score: z.number().min(0).max(100),
  findingsCount: z.number().nonnegative().default(0)
});

export const detectedProjectSchema = z.object({
  type: projectTypeSchema,
  name: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
  packageManager: z.enum(["pnpm", "npm", "yarn", "bun", "pip", "poetry", "cargo", "go", "unknown"]),
  frameworks: z.array(z.string())
});

export const detectedArtifactSchema = z.object({
  path: z.string(),
  exists: z.boolean(),
  kind: z.enum(["file", "directory", "missing"]),
  role: z.string(),
  quality: z.enum(["missing", "thin", "partial", "strong", "unknown"]),
  notes: z.array(z.string())
});

export const scanStatsSchema = z.object({
  filesScanned: z.number().nonnegative(),
  textFilesRead: z.number().nonnegative(),
  bytesRead: z.number().nonnegative(),
  docsMarkdownFileCount: z.number().nonnegative(),
  openApiFileCount: z.number().nonnegative(),
  benchmarkFileCount: z.number().nonnegative(),
  findingCount: z.number().nonnegative()
});

export const coverageSchema = z.object({
  evaluatedChecks: z.number().nonnegative(),
  skippedChecks: z.number().nonnegative(),
  notApplicableChecks: z.number().nonnegative(),
  notEvaluatedChecks: z.number().nonnegative(),
  evaluatedCategories: z.array(findingCategorySchema),
  missingCategories: z.array(findingCategorySchema),
  coveragePercent: z.number().min(0).max(100)
});

export const scoreCapSchema = z.object({
  id: z.string(),
  maxScore: z.number().min(0).max(100),
  reason: z.string()
});

export const scanResultSchema = z.object({
  scanId: z.string(),
  scannedPath: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMs: z.number().nonnegative(),
  agentLighthouseVersion: z.string(),
  profile: scanProfileSchema,
  projectName: z.string(),
  scoringModelVersion: z.string(),
  score: z.number().min(0).max(100),
  rawScore: z.number().min(0).max(100),
  scoreConfidence: scoreConfidenceLevelSchema,
  scoreConfidenceScore: z.number().min(0).max(100),
  coverage: coverageSchema,
  scoringCaps: z.array(scoreCapSchema),
  summary: z.string(),
  subscores: z.array(subscoreSchema),
  findings: z.array(findingSchema),
  recommendations: z.array(z.string()),
  detectedProject: detectedProjectSchema,
  detectedArtifacts: z.array(detectedArtifactSchema),
  scanStats: scanStatsSchema,
  ignoredPaths: z.array(z.string()),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  projectPath: z.string().optional(),
  scannedAt: z.string().optional(),
  recommendedActions: z.array(z.string()).optional(),
  signals: projectSignalsSchema
});

export const generatedArtifactSchema = z.object({
  path: z.string(),
  content: z.string(),
  description: z.string()
});

export type Severity = z.infer<typeof severitySchema>;
export type FindingCategory = z.infer<typeof findingCategorySchema>;
export type SuggestedFixType = z.infer<typeof suggestedFixTypeSchema>;
export type ProjectType = z.infer<typeof projectTypeSchema>;
export type ScanProfile = z.infer<typeof scanProfileSchema>;
export type ScoreConfidenceLevel = z.infer<typeof scoreConfidenceLevelSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type ArtifactSignal = z.infer<typeof artifactSignalSchema>;
export type PackageJsonSignal = z.infer<typeof packageJsonSignalSchema>;
export type ProjectSignals = z.infer<typeof projectSignalsSchema>;
export type Subscore = z.infer<typeof subscoreSchema>;
export type DetectedProject = z.infer<typeof detectedProjectSchema>;
export type DetectedArtifact = z.infer<typeof detectedArtifactSchema>;
export type ScanStats = z.infer<typeof scanStatsSchema>;
export type Coverage = z.infer<typeof coverageSchema>;
export type ScoreCap = z.infer<typeof scoreCapSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
export type GeneratedArtifact = z.infer<typeof generatedArtifactSchema>;

export interface ScanOptions {
  include?: string[];
  exclude?: string[];
  maxFileSizeBytes?: number;
  profile?: ScanProfile;
}

export interface SourceConnector {
  readonly id: string;
  read(source: string, options?: ScanOptions): Promise<ProjectSignals>;
}

export interface Scanner {
  readonly id: string;
  scan(path: string, options?: ScanOptions): Promise<ProjectSignals>;
}

export interface Analyzer {
  readonly id: string;
  analyze(signals: ProjectSignals): Finding[];
}

export interface ScoringModule {
  readonly id: string;
  readonly version: string;
  score(
    findings: Finding[],
    signals: ProjectSignals
  ): {
    scoringModelVersion: string;
    score: number;
    summary: string;
    subscores: Subscore[];
    recommendations: string[];
  };
}

export interface ArtifactGenerator {
  readonly id: string;
  generate(signals: ProjectSignals): GeneratedArtifact[];
}

export interface BenchmarkTask {
  id: string;
  title: string;
  prompt: string;
  successCriteria: string[];
}

export interface BenchmarkProvider {
  readonly id: string;
  getTasks(signals: ProjectSignals): BenchmarkTask[];
}

export interface Evaluator {
  readonly id: string;
  evaluate(task: BenchmarkTask, signals: ProjectSignals): Promise<boolean>;
}

export interface Fixer {
  readonly id: string;
  proposeFix(finding: Finding, signals: ProjectSignals): GeneratedArtifact | undefined;
}

export interface Reporter {
  readonly id: string;
  render(result: ScanResult): string;
}
