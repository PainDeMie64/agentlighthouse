import { packageVersions, runCommand, writeReleaseReport } from "./release-utils.js";

const checks: Array<{ name: string; status: "passed" | "failed" | "skipped"; detail: string }> = [];

async function dryRun(packageDir: string, name: string): Promise<void> {
  await runCommand("pnpm", ["publish", "--dry-run", "--access", "public", "--no-git-checks"], {
    cwd: packageDir
  });
  checks.push({
    name: `npm publish dry-run for ${name}`,
    status: "passed",
    detail: "npm dry-run completed without publishing."
  });
}

try {
  await runCommand("pnpm", ["build"]);
  checks.push({ name: "Build", status: "passed", detail: "Built packages before npm dry-run." });
  await dryRun("packages/core", "@agentlighthouse/core");
  await dryRun("packages/cli", "@agentlighthouse/cli");
  await writeReleaseReport({
    title: "Release Readiness",
    packageVersions: await packageVersions(),
    tarballs: [],
    checks,
    limitations: [
      "This was npm publish --dry-run only. No package was published.",
      "@agentlighthouse/web is private and intentionally skipped.",
      "No git tag was created."
    ]
  });
} catch (error) {
  checks.push({
    name: "npm publish dry-run",
    status: "failed",
    detail: error instanceof Error ? error.message : String(error)
  });
  await writeReleaseReport({
    title: "Release Readiness",
    packageVersions: await packageVersions(),
    tarballs: [],
    checks,
    limitations: [
      "npm dry-run failed. Treat package publishing as blocked until the failure is fixed."
    ]
  });
  throw error;
}
