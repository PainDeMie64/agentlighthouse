import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertShebang,
  assertTarballContents,
  ensureCleanDir,
  listTarball,
  packageVersions,
  packWorkspacePackage,
  releaseArtifactsDir,
  releaseSmokeDir,
  repoRoot,
  runCommand,
  writeReleaseReport
} from "./release-utils.js";

const keepTemp = process.env.AGENTLIGHTHOUSE_RELEASE_DEBUG === "1";
const checks: Array<{ name: string; status: "passed" | "failed" | "skipped"; detail: string }> = [];
const tarballs: string[] = [];

try {
  await runCommand("pnpm", ["build"]);
  await assertShebang(path.join(repoRoot, "packages", "cli", "dist", "index.js"));
  checks.push({
    name: "Built CLI shebang",
    status: "passed",
    detail: "dist/index.js is executable by Node."
  });

  await ensureCleanDir(releaseArtifactsDir);
  await ensureCleanDir(releaseSmokeDir);
  const coreTarball = await packWorkspacePackage("packages/core", "@agentlighthouse/core");
  const cliTarball = await packWorkspacePackage("packages/cli", "@agentlighthouse/cli");
  tarballs.push(coreTarball, cliTarball);

  assertTarballContents("@agentlighthouse/core", await listTarball(coreTarball));
  assertTarballContents("@agentlighthouse/cli", await listTarball(cliTarball), { expectBin: true });
  checks.push({
    name: "Package tarball contents",
    status: "passed",
    detail:
      "core and CLI tarballs include dist, README, LICENSE, and exclude src/tests/temp reports."
  });

  await writeFile(
    path.join(releaseSmokeDir, "package.json"),
    JSON.stringify(
      {
        name: "agentlighthouse-release-smoke",
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
  await runCommand("pnpm", ["fetch", "--prod"]);
  await runCommand("pnpm", ["install", "--prefer-offline"], { cwd: releaseSmokeDir });
  checks.push({
    name: "Packed install",
    status: "passed",
    detail:
      "Installed packed core and CLI tarballs into a clean temporary project using pnpm prefer-offline."
  });

  await runCommand("pnpm", ["exec", "agentlighthouse", "--help"], { cwd: releaseSmokeDir });
  await runCommand("pnpm", ["exec", "agentlighthouse", "version"], { cwd: releaseSmokeDir });
  const fixture = path.join(repoRoot, "examples", "sample-good-project");
  const scanOutputPath = path.join(releaseSmokeDir, "scan.json");
  const baselineOutputPath = path.join(releaseSmokeDir, "baseline.json");
  await runCommand("pnpm", ["exec", "agentlighthouse", "scan", fixture], { cwd: releaseSmokeDir });
  await runCommand(
    "pnpm",
    ["exec", "agentlighthouse", "scan", fixture, "--format", "json", "--output", scanOutputPath],
    { cwd: releaseSmokeDir }
  );
  await runCommand(
    "pnpm",
    ["exec", "agentlighthouse", "baseline", "create", fixture, "--output", baselineOutputPath],
    { cwd: releaseSmokeDir }
  );
  await runCommand(
    "pnpm",
    ["exec", "agentlighthouse", "baseline", "validate", baselineOutputPath],
    {
      cwd: releaseSmokeDir
    }
  );
  await access(scanOutputPath);
  await access(baselineOutputPath);
  const scanJson = JSON.parse(await readFile(scanOutputPath, "utf8")) as {
    scanId?: string;
  };
  if (!scanJson.scanId?.startsWith("scan_")) {
    throw new Error("Packed CLI scan did not write a valid scan-result JSON.");
  }
  checks.push({
    name: "Packed CLI commands",
    status: "passed",
    detail: "help, version, scan, JSON output, baseline create, and baseline validate all worked."
  });

  await writeReleaseReport({
    title: "Release Readiness",
    packageVersions: await packageVersions(),
    tarballs,
    checks,
    limitations: [
      "npm publishing has not been performed in this phase.",
      "The GitHub Action remains source-based and experimental until the npm CLI package is published.",
      "No git tag was created by the release smoke test."
    ]
  });
} catch (error) {
  checks.push({
    name: "Release smoke",
    status: "failed",
    detail: error instanceof Error ? error.message : String(error)
  });
  await writeReleaseReport({
    title: "Release Readiness",
    packageVersions: await packageVersions(),
    tarballs,
    checks,
    limitations: [
      "Release smoke failed; inspect command output before attempting any manual publish step."
    ]
  });
  throw error;
} finally {
  if (!keepTemp) {
    await rm(releaseSmokeDir, { recursive: true, force: true });
  } else {
    await mkdir(releaseSmokeDir, { recursive: true });
    process.stdout.write(`Kept release smoke directory: ${releaseSmokeDir}\n`);
  }
}
