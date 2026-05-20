import type {
  DetectedArtifact,
  DetectedProject,
  ProjectSignals,
  ProjectType
} from "../schemas/types.js";

const artifactRoles: Record<string, string> = {
  "AGENTS.md": "Primary coding-agent instructions",
  "CLAUDE.md": "Claude Code project memory",
  "llms.txt": "LLM-readable project map",
  "README.md": "Human and agent entry point",
  ".cursor/rules": "Cursor rules",
  ".github/copilot-instructions.md": "GitHub Copilot instructions",
  ".agentlighthouseignore": "AgentLighthouse ignore rules"
};

export function detectProject(signals: ProjectSignals): DetectedProject {
  const evidence: string[] = [];
  const packageJson = signals.packageJson;
  const has = (file: string) => signals.scannedFiles.includes(file);
  const hasAny = (predicate: (file: string) => boolean) => signals.scannedFiles.some(predicate);
  const dependencies = new Set([
    ...(packageJson?.dependencies ?? []),
    ...(packageJson?.devDependencies ?? [])
  ]);

  let type: ProjectType = "unknown";
  let confidence = 0.3;

  const rootOpenApiFiles = signals.openApiFiles.filter((file) => !file.startsWith("examples/"));

  if (
    signals.mcpFiles.length > 0 ||
    [...dependencies].some((dependency) => dependency.includes("mcp"))
  ) {
    type = "mcp_project";
    confidence = 0.9;
    evidence.push("MCP file or package signal detected.");
  } else if (rootOpenApiFiles.length > 0) {
    type = "openapi_project";
    confidence = 0.85;
    evidence.push(`OpenAPI files detected: ${rootOpenApiFiles.join(", ")}.`);
  } else if (
    packageJson &&
    (has("tsconfig.json") || has("tsconfig.base.json") || hasAny((file) => file.endsWith(".ts")))
  ) {
    type = "node_typescript";
    confidence = 0.9;
    evidence.push("package.json plus TypeScript config or source files detected.");
  } else if (packageJson) {
    type = "node_javascript";
    confidence = 0.8;
    evidence.push("package.json detected.");
  } else if (
    has("pyproject.toml") ||
    has("requirements.txt") ||
    hasAny((file) => file.endsWith(".py"))
  ) {
    type = "python";
    confidence = 0.85;
    evidence.push("Python project files detected.");
  } else if (has("Cargo.toml")) {
    type = "rust";
    confidence = 0.85;
    evidence.push("Cargo.toml detected.");
  } else if (has("go.mod")) {
    type = "go";
    confidence = 0.85;
    evidence.push("go.mod detected.");
  } else if (
    signals.docsMarkdownFiles.length > 0 &&
    signals.scannedFiles.filter((file) => /\.(ts|tsx|js|jsx|py|rs|go)$/i.test(file)).length === 0
  ) {
    type = "docs_only";
    confidence = 0.75;
    evidence.push("Markdown docs detected without common source-code files.");
  }

  return {
    type,
    name: packageJson?.name ?? signals.projectName,
    confidence,
    evidence: evidence.length > 0 ? evidence : ["No strong project-type signal detected."],
    packageManager: detectPackageManager(signals),
    frameworks: detectFrameworks(signals)
  };
}

export function detectedArtifacts(signals: ProjectSignals): DetectedArtifact[] {
  return Object.entries(signals.artifacts).map(([artifactPath, artifact]) => {
    const content = signals.textByPath[artifactPath];
    return {
      path: artifactPath,
      exists: artifact.exists,
      kind: artifact.kind,
      role: artifactRoles[artifactPath] ?? "Agent-readiness artifact",
      quality: artifact.exists ? artifactQuality(artifactPath, content, signals) : "missing",
      notes: artifactNotes(artifactPath, content, signals)
    };
  });
}

function detectPackageManager(signals: ProjectSignals): DetectedProject["packageManager"] {
  const declaredManager = signals.packageJson?.packageManager?.split("@")[0];
  if (
    declaredManager === "pnpm" ||
    declaredManager === "npm" ||
    declaredManager === "yarn" ||
    declaredManager === "bun"
  ) {
    return declaredManager;
  }
  if (signals.scannedFiles.includes("pnpm-lock.yaml")) return "pnpm";
  if (signals.scannedFiles.includes("yarn.lock")) return "yarn";
  if (signals.scannedFiles.includes("bun.lockb") || signals.scannedFiles.includes("bun.lock"))
    return "bun";
  if (signals.scannedFiles.includes("package-lock.json")) return "npm";
  if (signals.scannedFiles.includes("pyproject.toml")) return "poetry";
  if (signals.scannedFiles.includes("requirements.txt")) return "pip";
  if (signals.scannedFiles.includes("Cargo.toml")) return "cargo";
  if (signals.scannedFiles.includes("go.mod")) return "go";
  if (signals.packageJson) return "npm";
  return "unknown";
}

function detectFrameworks(signals: ProjectSignals): string[] {
  const dependencies = new Set([
    ...(signals.packageJson?.dependencies ?? []),
    ...(signals.packageJson?.devDependencies ?? [])
  ]);
  const frameworks: string[] = [];
  for (const [dependency, framework] of [
    ["next", "Next.js"],
    ["react", "React"],
    ["vite", "Vite"],
    ["express", "Express"],
    ["fastify", "Fastify"],
    ["astro", "Astro"],
    ["typescript", "TypeScript"],
    ["vitest", "Vitest"]
  ] as const) {
    if (dependencies.has(dependency)) {
      frameworks.push(framework);
    }
  }
  if (signals.scannedFiles.includes("pyproject.toml")) frameworks.push("Python");
  if (signals.scannedFiles.includes("Cargo.toml")) frameworks.push("Rust");
  if (signals.scannedFiles.includes("go.mod")) frameworks.push("Go");
  return [...new Set(frameworks)];
}

function artifactQuality(
  artifactPath: string,
  content: string | undefined,
  signals: ProjectSignals
): DetectedArtifact["quality"] {
  if (!content && artifactPath === ".cursor/rules") {
    return signals.scannedFiles.some((file) => file.startsWith(".cursor/rules/"))
      ? "partial"
      : "unknown";
  }
  if (!content) return "unknown";
  const score = qualitySignals(content, artifactPath).filter(Boolean).length;
  if (score >= 8) return "strong";
  if (score >= 4) return "partial";
  return "thin";
}

function artifactNotes(
  artifactPath: string,
  content: string | undefined,
  signals: ProjectSignals
): string[] {
  if (
    !content &&
    artifactPath === ".cursor/rules" &&
    signals.scannedFiles.some((file) => file.startsWith(".cursor/rules/"))
  ) {
    return ["Cursor rules directory detected."];
  }
  if (!content) return ["Artifact exists but no text content was available for quality checks."];
  const checks = qualityCheckLabels(content, artifactPath);
  const present = checks
    .filter((check) => check.present)
    .map((check) => `Includes ${check.label}.`);
  const missing = checks
    .filter((check) => !check.present)
    .map((check) => `Missing ${check.label}.`);
  return [...present.slice(0, 4), ...missing.slice(0, 4)];
}

function qualitySignals(content: string, artifactPath: string): boolean[] {
  return qualityCheckLabels(content, artifactPath).map((check) => check.present);
}

function qualityCheckLabels(
  content: string,
  artifactPath: string
): Array<{ label: string; present: boolean }> {
  const lower = content.toLowerCase();
  const hasAny = (terms: string[]) => terms.some((term) => lower.includes(term));
  const hasCommand = /\b(pnpm|npm|yarn|bun|pip|poetry|cargo|go)\s+[a-z0-9:_-]+/i.test(content);
  const hasLink = /\[[^\]]+\]\([^)]+\)/.test(content) || /^https?:\/\//m.test(content);
  const checks = [
    {
      label: "project overview",
      present: hasAny(["overview", "purpose", "what it does", "project"])
    },
    { label: "setup commands", present: hasAny(["install", "setup"]) && hasCommand },
    { label: "test commands", present: hasAny(["test", "pytest", "vitest", "jest"]) && hasCommand },
    {
      label: "lint/typecheck commands",
      present: hasAny(["lint", "typecheck", "type check", "mypy"])
    },
    { label: "architecture map", present: hasAny(["architecture", "packages/", "apps/", "src/"]) },
    { label: "coding conventions", present: hasAny(["convention", "style", "format", "naming"]) },
    {
      label: "security/privacy guidance",
      present: hasAny(["secret", "privacy", "credential", "sensitive", "security"])
    },
    { label: "common mistakes", present: hasAny(["avoid", "do not", "don't", "common mistake"]) },
    {
      label: "generated-file warnings",
      present: hasAny(["generated", "dist", "build output", "do not edit"])
    },
    { label: "docs links", present: hasLink || hasAny(["docs/", "readme"]) },
    { label: "examples", present: hasAny(["example", "usage", "sample"]) },
    { label: "task workflows", present: hasAny(["workflow", "task", "steps", "success criteria"]) }
  ];
  if (artifactPath === "llms.txt") {
    return checks.filter((check) =>
      ["project overview", "docs links", "examples", "architecture map"].includes(check.label)
    );
  }
  if (artifactPath === "README.md") {
    return checks.filter((check) =>
      [
        "project overview",
        "setup commands",
        "test commands",
        "docs links",
        "examples",
        "architecture map"
      ].includes(check.label)
    );
  }
  return checks;
}
