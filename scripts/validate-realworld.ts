import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderMarkdownReport, scanProject } from "@agentlighthouse/core";

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, "validation", "reports");

const targets = [
  { name: "sample-project", path: path.join(repoRoot, "examples", "sample-project"), save: true },
  { name: "agentlighthouse", path: repoRoot, save: true },
  ...(await optionalValidationRepos())
];

await mkdir(reportDir, { recursive: true });

for (const target of targets) {
  const result = await scanProject(target.path);
  process.stdout.write(
    `${target.name}: ${result.score}/100 (${result.findings.length} findings)\n`
  );
  if (target.save) {
    await writeFile(
      path.join(reportDir, `${target.name}.json`),
      JSON.stringify(sanitizeResult(result, repoRoot), null, 2),
      "utf8"
    );
    await writeFile(
      path.join(reportDir, `${target.name}.md`),
      renderMarkdownReport(sanitizeResult(result, repoRoot)),
      "utf8"
    );
  }
}

async function optionalValidationRepos(): Promise<
  Array<{ name: string; path: string; save: boolean }>
> {
  const validationRoot = path.join(repoRoot, ".tmp", "validation-repos");
  try {
    const entries = await readdir(validationRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: `external-${entry.name}`,
        path: path.join(validationRoot, entry.name),
        save: false
      }));
  } catch {
    return [];
  }
}

function sanitizeResult<T>(value: T, rootPath: string): T {
  return JSON.parse(JSON.stringify(value).replaceAll(rootPath, "<repo>")) as T;
}
