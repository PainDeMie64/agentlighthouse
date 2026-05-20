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
export const suggestedFixTypes = [
  "create_file",
  "update_file",
  "add_section",
  "add_script",
  "add_example",
  "review_manually",
  "none"
] as const;

export const severitySchema = z.enum(severities);
export const findingCategorySchema = z.enum(findingCategories);
export const suggestedFixTypeSchema = z.enum(suggestedFixTypes);

export const findingSchema = z.object({
  id: z.string(),
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
  sizeBytes: z.number().nonnegative().optional(),
  contentPreview: z.string().optional()
});

export const packageJsonSignalSchema = z.object({
  path: z.string(),
  name: z.string().optional(),
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
  packageJson: packageJsonSignalSchema.optional(),
  textByPath: z.record(z.string())
});

export const subscoreSchema = z.object({
  id: z.string(),
  label: z.string(),
  score: z.number().min(0).max(100)
});

export const scanResultSchema = z.object({
  projectPath: z.string(),
  projectName: z.string(),
  scannedAt: z.string(),
  scoringModelVersion: z.string(),
  score: z.number().min(0).max(100),
  summary: z.string(),
  subscores: z.array(subscoreSchema),
  findings: z.array(findingSchema),
  recommendedActions: z.array(z.string()),
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
export type Finding = z.infer<typeof findingSchema>;
export type ArtifactSignal = z.infer<typeof artifactSignalSchema>;
export type PackageJsonSignal = z.infer<typeof packageJsonSignalSchema>;
export type ProjectSignals = z.infer<typeof projectSignalsSchema>;
export type Subscore = z.infer<typeof subscoreSchema>;
export type ScanResult = z.infer<typeof scanResultSchema>;
export type GeneratedArtifact = z.infer<typeof generatedArtifactSchema>;

export interface ScanOptions {
  include?: string[];
  exclude?: string[];
  maxFileSizeBytes?: number;
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
  score(findings: Finding[], signals: ProjectSignals): Omit<ScanResult, "signals" | "scannedAt">;
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
