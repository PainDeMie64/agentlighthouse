import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  ensureCleanDir,
  packageVersions,
  publicAlphaRehearsalReportPath,
  releaseRehearsalDir,
  repoRoot,
  runCommand,
  writeMarkdownReport
} from "./release-utils.js";

type RehearsalCheck = {
  name: string;
  status: "passed" | "failed" | "skipped";
  detail: string;
};

const checks: RehearsalCheck[] = [];
const cloneDir = path.join(releaseRehearsalDir, "agentlighthouse");
const consumerDir = path.join(tmpdir(), "agentlighthouse-fresh-clone-consumer");
const cloneArtifactsDir = path.join(cloneDir, ".tmp", "release-artifacts");

let cloneSource = "remote";
let testedCommit = "";
let packedCliStatus = "not run";

try {
  await ensureCleanDir(releaseRehearsalDir);
  const head = (await runCommand("git", ["rev-parse", "HEAD"])).stdout.trim();
  const originMainResult = await runCommand("git", ["rev-parse", "origin/main"], {
    allowFailure: true
  });
  const originMain =
    originMainResult.exitCode === 0 ? originMainResult.stdout.trim() : "unavailable";
  const useRemote = originMain === head;

  if (useRemote) {
    try {
      await runCommand("git", [
        "clone",
        "--depth",
        "1",
        "https://github.com/PainDeMie64/agentlighthouse.git",
        cloneDir
      ]);
      cloneSource = "remote";
    } catch (error) {
      cloneSource = "local fallback";
      checks.push({
        name: "Remote clone",
        status: "failed",
        detail: error instanceof Error ? error.message : String(error)
      });
      await runCommand("git", ["clone", repoRoot, cloneDir]);
    }
  } else {
    cloneSource = "local fallback";
    checks.push({
      name: "Remote freshness",
      status: "skipped",
      detail: `HEAD ${head} differs from origin/main ${originMain}; cloning local repository path instead.`
    });
    await runCommand("git", ["clone", repoRoot, cloneDir]);
  }

  testedCommit = (await runCommand("git", ["rev-parse", "HEAD"], { cwd: cloneDir })).stdout.trim();
  checks.push({
    name: "Fresh clone",
    status: "passed",
    detail: `${cloneSource} clone checked out ${testedCommit}.`
  });

  await runFreshCloneReadmePath();
  await runPackedCliInstall();
  recordPriorRehearsalChecks();

  await writeRehearsalReport();
} catch (error) {
  checks.push({
    name: "Public alpha rehearsal",
    status: "failed",
    detail: error instanceof Error ? error.message : String(error)
  });
  await writeRehearsalReport(error);
  throw error;
}

function recordPriorRehearsalChecks(): void {
  if (process.env.AGENTLIGHTHOUSE_RELEASE_REHEARSAL_PRIOR_CHECKS !== "1") {
    return;
  }
  for (const name of [
    "release:check",
    "release:dry-run",
    "release:package-audit",
    "release:readme-check",
    "release:external-trial"
  ]) {
    checks.push({
      name,
      status: "passed",
      detail: `Completed earlier in pnpm release:rehearsal before fresh-clone validation.`
    });
  }
}

async function runFreshCloneReadmePath(): Promise<void> {
  await runCommand("pnpm", ["install"], { cwd: cloneDir, env: { CI: "true" } });
  await runCommand("pnpm", ["build"], { cwd: cloneDir });
  await runCommand("pnpm", ["test"], { cwd: cloneDir });
  await runCommand(
    "pnpm",
    ["--filter", "@agentlighthouse/cli", "dev", "scan", "examples/sample-good-project"],
    {
      cwd: cloneDir
    }
  );
  await runCommand(
    "pnpm",
    [
      "--filter",
      "@agentlighthouse/cli",
      "dev",
      "baseline",
      "create",
      "examples/sample-good-project",
      "--output",
      "baseline.json"
    ],
    { cwd: cloneDir }
  );
  await runCommand(
    "pnpm",
    ["--filter", "@agentlighthouse/cli", "dev", "baseline", "validate", "baseline.json"],
    { cwd: cloneDir }
  );
  await runCommand(
    "pnpm",
    [
      "--filter",
      "@agentlighthouse/cli",
      "dev",
      "scan",
      "examples/sample-good-project",
      "--baseline",
      "baseline.json",
      "--report-dir",
      "agentlighthouse-reports"
    ],
    { cwd: cloneDir }
  );
  await assertFilesExist(cloneDir, [
    "baseline.json",
    "agentlighthouse-reports/scan.json",
    "agentlighthouse-reports/scan.md",
    "agentlighthouse-reports/scan.sarif",
    "agentlighthouse-reports/pr-summary.md",
    "agentlighthouse-reports/comparison.json",
    "agentlighthouse-reports/comparison.md",
    "agentlighthouse-reports/comparison-pr-summary.md"
  ]);
  checks.push({
    name: "README source workflow",
    status: "passed",
    detail:
      "Install, build, test, scan, baseline create/validate, and scan --baseline report bundle all worked from a clean clone."
  });
}

async function runPackedCliInstall(): Promise<void> {
  await mkdir(cloneArtifactsDir, { recursive: true });
  await runCommand("pnpm", ["pack", "--pack-destination", cloneArtifactsDir], {
    cwd: path.join(cloneDir, "packages", "core")
  });
  await runCommand("pnpm", ["pack", "--pack-destination", cloneArtifactsDir], {
    cwd: path.join(cloneDir, "packages", "cli")
  });
  const coreTarball = path.join(cloneArtifactsDir, "agentlighthouse-core-0.1.0-alpha.0.tgz");
  const cliTarball = path.join(cloneArtifactsDir, "agentlighthouse-cli-0.1.0-alpha.0.tgz");
  await access(coreTarball, constants.R_OK);
  await access(cliTarball, constants.R_OK);

  await ensureCleanDir(consumerDir);
  await writeFile(
    path.join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "agentlighthouse-fresh-clone-consumer",
        version: "0.0.0",
        private: true,
        type: "module",
        dependencies: {
          "@agentlighthouse/core": `file:${coreTarball}`,
          "@agentlighthouse/cli": `file:${cliTarball}`
        },
        pnpm: {
          overrides: {
            "@agentlighthouse/core": `file:${coreTarball}`
          }
        }
      },
      null,
      2
    ),
    "utf8"
  );
  await runCommand("pnpm", ["install", "--prefer-offline"], {
    cwd: consumerDir,
    env: { CI: "true" }
  });

  const fixture = path.join(cloneDir, "examples", "sample-good-project");
  const scanOutputPath = path.join(consumerDir, "scan.json");
  const baselineOutputPath = path.join(consumerDir, "baseline.json");
  const reportDir = path.join(consumerDir, "reports");
  await runCommand("pnpm", ["exec", "agentlighthouse", "--help"], { cwd: consumerDir });
  await runCommand("pnpm", ["exec", "agentlighthouse", "version"], { cwd: consumerDir });
  await runCommand("pnpm", ["exec", "agentlighthouse", "scan", fixture], { cwd: consumerDir });
  await runCommand(
    "pnpm",
    ["exec", "agentlighthouse", "scan", fixture, "--format", "json", "--output", scanOutputPath],
    { cwd: consumerDir }
  );
  await runCommand(
    "pnpm",
    ["exec", "agentlighthouse", "baseline", "create", fixture, "--output", baselineOutputPath],
    { cwd: consumerDir }
  );
  await runCommand(
    "pnpm",
    ["exec", "agentlighthouse", "baseline", "validate", baselineOutputPath],
    {
      cwd: consumerDir
    }
  );
  await runCommand(
    "pnpm",
    [
      "exec",
      "agentlighthouse",
      "scan",
      fixture,
      "--baseline",
      baselineOutputPath,
      "--report-dir",
      reportDir
    ],
    { cwd: consumerDir }
  );
  await assertFilesExist(consumerDir, [
    "scan.json",
    "baseline.json",
    "reports/scan.json",
    "reports/scan.md",
    "reports/scan.sarif",
    "reports/pr-summary.md",
    "reports/comparison.json",
    "reports/comparison.md",
    "reports/comparison-pr-summary.md"
  ]);

  const installedCliPackage = JSON.parse(
    await readFile(
      path.join(consumerDir, "node_modules", "@agentlighthouse", "cli", "package.json"),
      "utf8"
    )
  ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  if (installedCliPackage.dependencies?.tsx || installedCliPackage.dependencies?.["ts-node"]) {
    throw new Error("Installed CLI depends on a TypeScript runtime package.");
  }
  packedCliStatus = "passed";
  checks.push({
    name: "Packed CLI real install",
    status: "passed",
    detail:
      "Packed CLI installed into a separate clean consumer project and ran without monorepo source paths or TypeScript runtime dependencies."
  });
}

async function assertFilesExist(root: string, relativePaths: string[]): Promise<void> {
  for (const relativePath of relativePaths) {
    await access(path.join(root, relativePath), constants.R_OK);
  }
}

async function writeRehearsalReport(error?: unknown): Promise<void> {
  const nodeVersion = process.version;
  const pnpmVersion = (
    await runCommand("pnpm", ["--version"], { allowFailure: true })
  ).stdout.trim();
  const packageVersionRows = await packageVersions();
  const recommendation = error
    ? "not ready to tag"
    : "ready with caveats: require manual approval, do not tag or publish automatically, and keep GitHub Action source-based limitations visible.";
  await writeMarkdownReport(
    publicAlphaRehearsalReportPath,
    [
      "# Public Alpha Rehearsal",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "## Summary",
      "",
      `- Git commit tested: \`${testedCommit || "unknown"}\``,
      `- Clone source: ${cloneSource}`,
      `- Node version: \`${nodeVersion}\``,
      `- pnpm version: \`${pnpmVersion || "unknown"}\``,
      `- Packed CLI install result: ${packedCliStatus}`,
      `- Final recommendation: **${recommendation}**`,
      "",
      "## Package Versions",
      "",
      ...packageVersionRows.map((item) => `- \`${item.name}\`: \`${item.version}\``),
      "",
      "## Checks",
      "",
      "| Check | Status | Detail |",
      "| --- | --- | --- |",
      ...checks.map(
        (check) => `| ${check.name} | ${check.status} | ${check.detail.replaceAll("|", "\\|")} |`
      ),
      "",
      "## Related Reports",
      "",
      "- `validation/reports/release-readiness.md`",
      "- `validation/reports/package-content-audit.md`",
      "- `validation/reports/readme-command-check.md`",
      "- `validation/reports/external-trial-summary.md`",
      "",
      "## Known Blockers",
      "",
      ...(error ? [`- ${renderError(error)}`] : ["- None found during rehearsal."]),
      "",
      "## Caveats",
      "",
      "- npm packages have not been published.",
      "- No git tag was created.",
      "- No GitHub Release was created.",
      "- The GitHub Action is source-based and experimental until npm distribution exists.",
      "- Automated installs use `CI=true pnpm install` to avoid non-interactive package-manager prompts.",
      ""
    ].join("\n")
  );
}

function renderError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return JSON.stringify(error);
}
