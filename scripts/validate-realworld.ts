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
