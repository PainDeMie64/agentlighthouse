import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  assertTarballContents,
  ensureCleanDir,
  listTarball,
  packageContentAuditReportPath,
  packWorkspacePackage,
  releaseArtifactsDir,
  runCommand,
  writeMarkdownReport
} from "./release-utils.js";

type AuditRow = {
  packageName: string;
  tarball: string;
  status: "passed" | "failed";
  included: string[];
  excluded: string[];
  notes: string[];
};

const rows: AuditRow[] = [];

try {
  await runCommand("pnpm", ["build"]);
  await ensureCleanDir(releaseArtifactsDir);
  await mkdir(releaseArtifactsDir, { recursive: true });

  await auditPackage("packages/core", "@agentlighthouse/core");
  await auditPackage("packages/cli", "@agentlighthouse/cli", { expectBin: true });

  await writeMarkdownReport(packageContentAuditReportPath, renderReport(rows));
} catch (error) {
  if (rows.length > 0) {
    await writeMarkdownReport(packageContentAuditReportPath, renderReport(rows, error));
  }
  throw error;
}

async function auditPackage(
  packageDir: string,
  packageName: string,
  options: { expectBin?: boolean } = {}
): Promise<void> {
  const tarball = await packWorkspacePackage(packageDir, packageName);
  const entries = await listTarball(tarball);
  assertTarballContents(packageName, entries, options);
  const requiredEntries = [
    "package/package.json",
    "package/README.md",
    "package/LICENSE",
    "package/dist/index.js",
    "package/dist/index.d.ts"
  ];
  const forbiddenPatterns = [
    "package/src/",
    "package/validation/",
    "package/examples/",
    "package/.tmp/",
    "package/.env",
    ".test.ts",
    ".test.js",
    ".tgz"
  ];
  rows.push({
    packageName,
    tarball,
    status: "passed",
    included: requiredEntries.filter((entry) => entries.includes(entry)),
    excluded: forbiddenPatterns,
    notes: [
      "The package files field keeps source, tests, examples, validation reports, temp files, and tarballs out of the publish artifact.",
      options.expectBin
        ? "The CLI binary target is package/dist/index.js and is included."
        : "No executable binary is expected for this package."
    ]
  });
}

function renderReport(rowsToRender: AuditRow[], error?: unknown): string {
  const lines = [
    "# Package Content Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This audit checks the local packed tarballs for the packages intended for public alpha publication.",
    "",
    "| Package | Status | Tarball |",
    "| --- | --- | --- |",
    ...rowsToRender.map(
      (row) =>
        `| \`${row.packageName}\` | ${row.status} | \`${path.relative(process.cwd(), row.tarball)}\` |`
    ),
    "",
    "## Included Files Verified",
    "",
    ...rowsToRender.flatMap((row) => [
      `### \`${row.packageName}\``,
      "",
      ...row.included.map((entry) => `- \`${entry}\``),
      ""
    ]),
    "## Excluded Junk Checked",
    "",
    ...rowsToRender.flatMap((row) => [
      `### \`${row.packageName}\``,
      "",
      ...row.excluded.map((pattern) => `- \`${pattern}\``),
      ""
    ]),
    "## Notes",
    "",
    ...rowsToRender.flatMap((row) => [
      `### \`${row.packageName}\``,
      "",
      ...row.notes.map((note) => `- ${note}`),
      ""
    ]),
    ...(error
      ? ["## Failure", "", renderError(error), ""]
      : ["## Result", "", "Passed. No release tarballs or temp artifacts should be committed.", ""])
  ];
  return lines.join("\n");
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
