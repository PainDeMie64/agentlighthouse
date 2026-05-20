import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  ArtifactSignal,
  PackageJsonSignal,
  ProjectSignals,
  ScanOptions,
  Scanner
} from "../schemas/types.js";

const defaultIgnores = [
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".vercel",
  ".tmp",
  "vendor",
  ".DS_Store"
];

const textExtensions = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".yaml",
  ".yml",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".toml"
]);

const artifactPaths = [
  "AGENTS.md",
  "CLAUDE.md",
  "llms.txt",
  "README.md",
  ".cursor/rules",
  ".github/copilot-instructions.md",
  ".agentlighthouseignore"
];

export class LocalFilesystemScanner implements Scanner {
  readonly id = "local-filesystem";

  async scan(projectPath: string, options: ScanOptions = {}): Promise<ProjectSignals> {
    const rootPath = path.resolve(projectPath);
    const maxFileSizeBytes = options.maxFileSizeBytes ?? 512_000;
    const ignoreRules = await readIgnoreRules(rootPath, options.exclude ?? []);
    const scannedFiles = await walk(rootPath, rootPath, ignoreRules, options.include ?? []);
    const textByPath: Record<string, string> = {};
    const artifacts: Record<string, ArtifactSignal> = {};

    for (const relativePath of scannedFiles) {
      const absolutePath = path.join(rootPath, relativePath);
      const stat = await fs.stat(absolutePath);
      if (stat.size <= maxFileSizeBytes && isTextFile(relativePath)) {
        textByPath[relativePath] = await fs.readFile(absolutePath, "utf8");
      }
    }

    for (const artifactPath of artifactPaths) {
      const absolutePath = path.join(rootPath, artifactPath);
      artifacts[artifactPath] = await artifactSignal(absolutePath, artifactPath, textByPath);
    }

    const docsMarkdownFiles = scannedFiles.filter(
      (file) => file.startsWith("docs/") && [".md", ".mdx"].includes(path.extname(file))
    );
    const openApiFiles = scannedFiles.filter(isOpenApiFile);
    const mcpFiles = scannedFiles.filter((file) => /(^|[/.])mcp([/. -]|$)/i.test(file));
    const benchmarkFiles = scannedFiles.filter((file) =>
      [
        "benchmarks/agent-tasks.yaml",
        "benchmarks/agent-tasks.yml",
        ".agentlighthouse/tasks.yaml",
        ".agentlighthouse/tasks.yml"
      ].includes(file)
    );
    const configFiles = scannedFiles.filter(isConfigFile);
    const packageJson = parsePackageJson(textByPath["package.json"]);
    const projectName = packageJson?.name ?? path.basename(rootPath);

    return {
      rootPath,
      projectName,
      scannedFiles,
      artifacts,
      docsMarkdownFiles,
      openApiFiles,
      mcpFiles: [...new Set([...mcpFiles, ...mcpPackageSignals(packageJson)])],
      configFiles,
      benchmarkFiles,
      packageJson,
      textByPath
    };
  }
}

async function artifactSignal(
  absolutePath: string,
  relativePath: string,
  textByPath: Record<string, string>
): Promise<ArtifactSignal> {
  try {
    const stat = await fs.stat(absolutePath);
    return {
      path: relativePath,
      exists: true,
      sizeBytes: stat.size,
      contentPreview: textByPath[relativePath]?.slice(0, 500)
    };
  } catch {
    return { path: relativePath, exists: false };
  }
}

async function readIgnoreRules(rootPath: string, extraExcludes: string[]): Promise<string[]> {
  const rules = [...defaultIgnores, ...extraExcludes];
  for (const ignoreFile of [".gitignore", ".agentlighthouseignore"]) {
    try {
      const content = await fs.readFile(path.join(rootPath, ignoreFile), "utf8");
      rules.push(
        ...content
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"))
      );
    } catch {
      // Missing ignore files are expected in many target repos.
    }
  }
  return rules;
}

async function walk(
  rootPath: string,
  currentPath: string,
  ignoreRules: string[],
  includes: string[]
): Promise<string[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absolutePath = path.join(currentPath, entry.name);
    const relativePath = normalizePath(path.relative(rootPath, absolutePath));
    if (shouldIgnore(relativePath, entry.name, ignoreRules)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await walk(rootPath, absolutePath, ignoreRules, includes)));
      continue;
    }
    if (entry.isFile() && matchesInclude(relativePath, includes)) {
      files.push(relativePath);
    }
  }
  return files.sort();
}

function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function shouldIgnore(relativePath: string, basename: string, rules: string[]): boolean {
  return rules.some((rawRule) => {
    const rule = rawRule.replace(/^\//, "").replace(/\/$/, "");
    if (!rule || rule.startsWith("!")) {
      return false;
    }
    if (rule.includes("*")) {
      const pattern = new RegExp(`^${escapeRegex(rule).replaceAll("\\*", ".*")}$`);
      return pattern.test(relativePath) || pattern.test(basename);
    }
    return relativePath === rule || relativePath.startsWith(`${rule}/`) || basename === rule;
  });
}

function matchesInclude(relativePath: string, includes: string[]): boolean {
  if (includes.length === 0) {
    return true;
  }
  return includes.some((include) => relativePath.includes(include.replaceAll("*", "")));
}

function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.*]/g, "\\$&");
}

function isTextFile(file: string): boolean {
  return (
    textExtensions.has(path.extname(file)) || ["AGENTS.md", "CLAUDE.md", "llms.txt"].includes(file)
  );
}

function isOpenApiFile(file: string): boolean {
  const lower = file.toLowerCase();
  return (
    lower.endsWith("openapi.yaml") ||
    lower.endsWith("openapi.yml") ||
    lower.endsWith("openapi.json") ||
    lower.endsWith("swagger.yaml") ||
    lower.endsWith("swagger.yml") ||
    lower.endsWith("swagger.json")
  );
}

function isConfigFile(file: string): boolean {
  return [
    "package.json",
    "tsconfig.json",
    "tsconfig.base.json",
    "eslint.config.mjs",
    "next.config.ts",
    "vite.config.ts",
    "vitest.config.ts"
  ].includes(file);
}

function parsePackageJson(content: string | undefined): PackageJsonSignal | undefined {
  if (!content) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(content) as {
      name?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return {
      path: "package.json",
      name: parsed.name,
      scripts: parsed.scripts ?? {},
      dependencies: Object.keys(parsed.dependencies ?? {}),
      devDependencies: Object.keys(parsed.devDependencies ?? {})
    };
  } catch {
    return undefined;
  }
}

function mcpPackageSignals(packageJson: PackageJsonSignal | undefined): string[] {
  if (!packageJson) {
    return [];
  }
  return [...packageJson.dependencies, ...packageJson.devDependencies].filter((dependency) =>
    dependency.toLowerCase().includes("mcp")
  );
}
