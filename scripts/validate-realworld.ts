import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  compareScanResults,
  parseChangedFilesText,
  renderComparisonJsonReport,
  renderComparisonMarkdownReport,
  renderComparisonPrSummaryReport,
  renderJsonReport,
  renderMarkdownReport,
  renderPrSummaryReport,
  renderSarifReport,
  scanProject
} from "@agentlighthouse/core";
import { format } from "prettier";

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, "validation", "reports");

type ValidationTarget = {
  name: string;
  path: string;
  save: boolean;
  subdir?: string;
};

const targets = [
  { name: "sample-project", path: path.join(repoRoot, "examples", "sample-project"), save: true },
  {
    name: "sample-good-project",
    path: path.join(repoRoot, "examples", "sample-good-project"),
    save: true
  },
  {
    name: "sample-bad-project",
    path: path.join(repoRoot, "examples", "sample-bad-project"),
    save: true
  },
  {
    name: "openapi-good-project",
    path: path.join(repoRoot, "examples", "openapi-good-project"),
    save: true
  },
  {
    name: "openapi-bad-project",
    path: path.join(repoRoot, "examples", "openapi-bad-project"),
    save: true
  },
  {
    name: "mcp-good-project",
    path: path.join(repoRoot, "examples", "mcp-good-project"),
    save: true
  },
  {
    name: "mcp-bad-project",
    path: path.join(repoRoot, "examples", "mcp-bad-project"),
    save: true
  },
  { name: "agentlighthouse", path: repoRoot, save: true },
  ...(await optionalValidationRepos())
] satisfies ValidationTarget[];

await mkdir(reportDir, { recursive: true });
const savedResults = new Map<string, Awaited<ReturnType<typeof scanProject>>>();

for (const target of targets) {
  const result = await scanProject(target.path);
  process.stdout.write(
    `${target.name}: ${result.score}/100 (${result.findings.length} findings)\n`
  );
  if (!target.subdir) {
    savedResults.set(target.name, result);
  }
  if (target.save) {
    const sanitizedResult = sanitizeResult(result, repoRoot);
    const targetReportDir = path.join(reportDir, target.subdir ?? "");
    await mkdir(targetReportDir, { recursive: true });
    await writeFile(
      path.join(targetReportDir, `${target.name}.json`),
      await format(renderJsonReport(sanitizedResult), {
        parser: "json",
        printWidth: 100
      }),
      "utf8"
    );
    await writeFile(
      path.join(targetReportDir, `${target.name}.md`),
      await format(renderMarkdownReport(sanitizedResult), {
        parser: "markdown",
        printWidth: 100
      }),
      "utf8"
    );
    await writeFile(
      path.join(targetReportDir, `${target.name}.sarif`),
      await format(renderSarifReport(sanitizedResult), {
        parser: "json",
        printWidth: 100
      }),
      "utf8"
    );
    await writeFile(
      path.join(targetReportDir, `${target.name}-pr-summary.md`),
      await format(
        renderPrSummaryReport(sanitizedResult, {
          reportPaths: [
            `validation/reports/${target.subdir ? `${target.subdir}/` : ""}${target.name}.json`,
            `validation/reports/${target.subdir ? `${target.subdir}/` : ""}${target.name}.md`,
            `validation/reports/${target.subdir ? `${target.subdir}/` : ""}${target.name}.sarif`
          ]
        }),
        {
          parser: "markdown",
          printWidth: 100
        }
      ),
      "utf8"
    );
  }
}

await writeComparisonReport({
  name: "comparison-improved",
  baseline: {
    ...requiredResult(savedResults, "sample-bad-project"),
    coverage: {
      ...requiredResult(savedResults, "sample-bad-project").coverage,
      coveragePercent: 40
    },
    scoreConfidenceScore: 45
  },
  current: requiredResult(savedResults, "sample-good-project")
});
await writeComparisonReport({
  name: "comparison-regressed",
  baseline: requiredResult(savedResults, "sample-good-project"),
  current: requiredResult(savedResults, "sample-bad-project")
});
await writeComparisonReport({
  name: "pr-aware-comparison",
  baseline: requiredResult(savedResults, "sample-good-project"),
  current: requiredResult(savedResults, "sample-bad-project"),
  changedFiles: parseChangedFilesText(
    await readFile(path.join(repoRoot, "examples", "comparison", "changed-files.txt"), "utf8"),
    "explicit"
  )
});
await writePhase2eWorkflowReports(savedResults);
await writeReleaseReadinessPlaceholder();

async function optionalValidationRepos(): Promise<ValidationTarget[]> {
  const validationRoot = path.join(repoRoot, ".tmp", "validation-repos");
  try {
    const entries = await readdir(validationRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: `external-${entry.name}`,
        path: path.join(validationRoot, entry.name),
        save: true,
        subdir: "external"
      }));
  } catch {
    return [];
  }
}

function sanitizeResult<T>(value: T, rootPath: string): T {
  return JSON.parse(JSON.stringify(value).replaceAll(rootPath, "<repo>")) as T;
}

function requiredResult(
  results: Map<string, Awaited<ReturnType<typeof scanProject>>>,
  name: string
): Awaited<ReturnType<typeof scanProject>> {
  const result = results.get(name);
  if (!result) {
    throw new Error(`Validation target ${name} was not scanned.`);
  }
  return result;
}

async function writeComparisonReport(input: {
  name: string;
  baseline: Awaited<ReturnType<typeof scanProject>>;
  current: Awaited<ReturnType<typeof scanProject>>;
  changedFiles?: Parameters<typeof compareScanResults>[2]["changedFiles"];
}): Promise<void> {
  const comparison = sanitizeResult(
    compareScanResults(input.baseline, input.current, { changedFiles: input.changedFiles }),
    repoRoot
  );
  process.stdout.write(
    `${input.name}: ${comparison.summary.verdict} (${comparison.deltas.scoreDelta >= 0 ? "+" : ""}${comparison.deltas.scoreDelta} score)\n`
  );
  await writeFile(
    path.join(reportDir, `${input.name}.json`),
    await format(renderComparisonJsonReport(comparison), {
      parser: "json",
      printWidth: 100
    }),
    "utf8"
  );
  await writeFile(
    path.join(reportDir, `${input.name}.md`),
    await format(renderComparisonMarkdownReport(comparison), {
      parser: "markdown",
      printWidth: 100
    }),
    "utf8"
  );
  await writeFile(
    path.join(reportDir, `${input.name}-pr-summary.md`),
    await format(
      renderComparisonPrSummaryReport(comparison, {
        reportPaths: [
          `validation/reports/${input.name}.json`,
          `validation/reports/${input.name}.md`
        ]
      }),
      {
        parser: "markdown",
        printWidth: 100
      }
    ),
    "utf8"
  );
}

async function writePhase2eWorkflowReports(
  results: Map<string, Awaited<ReturnType<typeof scanProject>>>
): Promise<void> {
  const phase2eDir = path.join(reportDir, "phase2e");
  await mkdir(phase2eDir, { recursive: true });
  const scan = sanitizeResult(requiredResult(results, "agentlighthouse"), repoRoot);
  const comparison = sanitizeResult(
    compareScanResults(
      requiredResult(results, "sample-good-project"),
      requiredResult(results, "sample-bad-project"),
      {
        changedFiles: parseChangedFilesText(
          await readFile(
            path.join(repoRoot, "examples", "comparison", "changed-files.txt"),
            "utf8"
          ),
          "explicit"
        )
      }
    ),
    repoRoot
  );

  await writeFile(
    path.join(phase2eDir, "scan.json"),
    await format(renderJsonReport(scan), { parser: "json", printWidth: 100 }),
    "utf8"
  );
  await writeFile(
    path.join(phase2eDir, "scan.md"),
    await format(renderMarkdownReport(scan), { parser: "markdown", printWidth: 100 }),
    "utf8"
  );
  await writeFile(
    path.join(phase2eDir, "scan.sarif"),
    await format(renderSarifReport(scan), { parser: "json", printWidth: 100 }),
    "utf8"
  );
  await writeFile(
    path.join(phase2eDir, "pr-summary.md"),
    await format(
      renderPrSummaryReport(scan, {
        reportPaths: [
          "validation/reports/phase2e/scan.json",
          "validation/reports/phase2e/scan.md",
          "validation/reports/phase2e/scan.sarif"
        ]
      }),
      { parser: "markdown", printWidth: 100 }
    ),
    "utf8"
  );
  await writeFile(
    path.join(phase2eDir, "comparison.json"),
    await format(renderComparisonJsonReport(comparison), { parser: "json", printWidth: 100 }),
    "utf8"
  );
  await writeFile(
    path.join(phase2eDir, "comparison.md"),
    await format(renderComparisonMarkdownReport(comparison), {
      parser: "markdown",
      printWidth: 100
    }),
    "utf8"
  );
  await writeFile(
    path.join(phase2eDir, "comparison-pr-summary.md"),
    await format(
      renderComparisonPrSummaryReport(comparison, {
        reportPaths: [
          "validation/reports/phase2e/comparison.json",
          "validation/reports/phase2e/comparison.md"
        ]
      }),
      { parser: "markdown", printWidth: 100 }
    ),
    "utf8"
  );
}

async function writeReleaseReadinessPlaceholder(): Promise<void> {
  const rootPackage = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    version: string;
  };
  const corePackage = JSON.parse(
    await readFile(path.join(repoRoot, "packages", "core", "package.json"), "utf8")
  ) as { version: string };
  const cliPackage = JSON.parse(
    await readFile(path.join(repoRoot, "packages", "cli", "package.json"), "utf8")
  ) as { version: string };
  await writeFile(
    path.join(reportDir, "release-readiness.md"),
    await format(
      [
        "# Release Readiness",
        "",
        "Generated by `pnpm validate:realworld` as a lightweight release-readiness placeholder.",
        "`pnpm release:smoke` and `pnpm release:check` replace this with packed-install results.",
        "",
        "## Package Versions",
        "",
        `- \`agentlighthouse\`: \`${rootPackage.version}\``,
        `- \`@agentlighthouse/core\`: \`${corePackage.version}\``,
        `- \`@agentlighthouse/cli\`: \`${cliPackage.version}\``,
        "",
        "## Status",
        "",
        "- Validation reports generated for local sample projects and AgentLighthouse itself.",
        "- Packed tarball install smoke is covered by `pnpm release:smoke`.",
        "- npm publish dry-run is covered by `pnpm release:dry-run`.",
        ""
      ].join("\n"),
      { parser: "markdown", printWidth: 100 }
    ),
    "utf8"
  );
}
