import {
  packageVersions,
  releaseArtifactsDir,
  runCommand,
  writeReleaseReport
} from "./release-utils.js";

const checks: Array<{ name: string; status: "passed" | "failed" | "skipped"; detail: string }> = [];

async function runCheck(name: string, command: string, args: string[]): Promise<void> {
  try {
    await runCommand(command, args);
    checks.push({ name, status: "passed", detail: `${command} ${args.join(" ")}` });
  } catch (error) {
    checks.push({
      name,
      status: "failed",
      detail: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

try {
  const versions = await packageVersions();
  const coreVersion =
    versions.find((item) => item.name === "@agentlighthouse/core")?.version ?? "unknown";
  const cliVersion =
    versions.find((item) => item.name === "@agentlighthouse/cli")?.version ?? "unknown";
  await runCheck("Typecheck", "pnpm", ["typecheck"]);
  await runCheck("Lint", "pnpm", ["lint"]);
  await runCheck("Tests", "pnpm", ["test"]);
  await runCheck("Build", "pnpm", ["build"]);
  await runCheck("Format check", "pnpm", ["format:check"]);
  await runCheck("Real-world validation", "pnpm", ["validate:realworld"]);
  await runCheck("Packed install smoke", "pnpm", ["release:smoke"]);
  await runCheck("Git whitespace check", "git", ["diff", "--check"]);
  await writeReleaseReport({
    title: "Release Readiness",
    packageVersions: versions,
    tarballs: [
      `${releaseArtifactsDir}/agentlighthouse-core-${coreVersion}.tgz`,
      `${releaseArtifactsDir}/agentlighthouse-cli-${cliVersion}.tgz`
    ],
    checks,
    limitations: [
      "npm publish dry-run is a separate command: pnpm release:dry-run.",
      "The GitHub Action is source-based for public alpha and will become faster after npm distribution.",
      "No git tag or npm package is created by release:check."
    ]
  });
} catch (error) {
  await writeReleaseReport({
    title: "Release Readiness",
    packageVersions: await packageVersions(),
    tarballs: [],
    checks,
    limitations: [
      "release:check failed; do not tag, publish, or announce a release until it passes."
    ]
  });
  throw error;
}
