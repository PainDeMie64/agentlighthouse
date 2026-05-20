import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { format } from "prettier";

export const repoRoot = process.cwd();
export const releaseArtifactsDir = path.join(repoRoot, ".tmp", "release-artifacts");
export const releaseSmokeDir = path.join(tmpdir(), "agentlighthouse-release-smoke");
export const releaseReportPath = path.join(
  repoRoot,
  "validation",
  "reports",
  "release-readiness.md"
);

export interface CommandResult {
  command: string;
  cwd: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runCommand(
  command: string,
  args: string[],
  options: { cwd?: string; allowFailure?: boolean } = {}
): Promise<CommandResult> {
  const cwd = options.cwd ?? repoRoot;
  const rendered = [command, ...args].join(" ");
  process.stdout.write(`$ ${rendered}\n`);
  const result = await new Promise<CommandResult>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({
        command: rendered,
        cwd,
        exitCode: exitCode ?? 1,
        stdout,
        stderr
      });
    });
  });
  if (result.exitCode !== 0 && !options.allowFailure) {
    throw new Error(`Command failed (${result.exitCode}): ${rendered}`);
  }
  return result;
}

export async function ensureCleanDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

export async function packWorkspacePackage(
  packageDir: string,
  packageName: string
): Promise<string> {
  await mkdir(releaseArtifactsDir, { recursive: true });
  await runCommand("pnpm", ["pack", "--pack-destination", releaseArtifactsDir], {
    cwd: path.join(repoRoot, packageDir)
  });
  const tarball = path.join(
    releaseArtifactsDir,
    `${packageName.replace("@", "").replace("/", "-")}-0.1.0-alpha.0.tgz`
  );
  await access(tarball, constants.R_OK);
  return tarball;
}

export async function listTarball(tarball: string): Promise<string[]> {
  const result = await runCommand("tar", ["-tf", tarball]);
  return result.stdout
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function assertTarballContents(
  packageName: string,
  entries: string[],
  options: { expectBin?: boolean } = {}
): void {
  const required = [
    "package/package.json",
    "package/README.md",
    "package/LICENSE",
    "package/dist/index.js",
    "package/dist/index.d.ts"
  ];
  for (const entry of required) {
    if (!entries.includes(entry)) {
      throw new Error(`${packageName} tarball is missing ${entry}.`);
    }
  }
  if (options.expectBin && !entries.includes("package/dist/index.js")) {
    throw new Error(`${packageName} tarball is missing the CLI bin target.`);
  }
  const forbiddenPrefixes = [
    "package/src/",
    "package/validation/",
    "package/examples/",
    "package/.tmp/",
    "package/.env"
  ];
  const forbiddenSuffixes = [".test.js", ".test.ts", ".tgz"];
  const junk = entries.find(
    (entry) =>
      forbiddenPrefixes.some((prefix) => entry.startsWith(prefix)) ||
      forbiddenSuffixes.some((suffix) => entry.endsWith(suffix))
  );
  if (junk) {
    throw new Error(`${packageName} tarball includes unexpected release junk: ${junk}.`);
  }
}

export async function assertShebang(filePath: string): Promise<void> {
  const file = await readFile(filePath, "utf8");
  if (!file.startsWith("#!/usr/bin/env node")) {
    throw new Error(`${filePath} does not start with a Node.js shebang.`);
  }
}

export async function writeReleaseReport(input: {
  title: string;
  packageVersions: Array<{ name: string; version: string }>;
  tarballs: string[];
  checks: Array<{ name: string; status: "passed" | "failed" | "skipped"; detail: string }>;
  limitations: string[];
}): Promise<void> {
  await mkdir(path.dirname(releaseReportPath), { recursive: true });
  const lines = [
    `# ${input.title}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Package Versions",
    "",
    ...input.packageVersions.map((item) => `- \`${item.name}\`: \`${item.version}\``),
    "",
    "## Tarballs Tested",
    "",
    ...(input.tarballs.length > 0
      ? input.tarballs.map((tarball) => `- \`${path.relative(repoRoot, tarball)}\``)
      : ["- None"]),
    "",
    "## Checks",
    "",
    ...input.checks.map(
      (check) => `- ${check.status.toUpperCase()}: ${check.name} - ${check.detail}`
    ),
    "",
    "## Known Packaging Limitations",
    "",
    ...input.limitations.map((limitation) => `- ${limitation}`),
    ""
  ];
  await writeFile(
    releaseReportPath,
    await format(`${lines.join("\n")}\n`, { parser: "markdown", printWidth: 100 }),
    "utf8"
  );
}

export async function packageVersions(): Promise<Array<{ name: string; version: string }>> {
  const packageFiles = [
    path.join(repoRoot, "package.json"),
    path.join(repoRoot, "packages", "core", "package.json"),
    path.join(repoRoot, "packages", "cli", "package.json"),
    path.join(repoRoot, "apps", "web", "package.json")
  ];
  return Promise.all(
    packageFiles.map(async (file) => {
      const parsed = JSON.parse(await readFile(file, "utf8")) as {
        name: string;
        version: string;
        private?: boolean;
      };
      return {
        name: parsed.private ? `${parsed.name} (private)` : parsed.name,
        version: parsed.version
      };
    })
  );
}
