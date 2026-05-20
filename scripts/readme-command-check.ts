import { readFile } from "node:fs/promises";
import path from "node:path";
import { readmeCommandCheckReportPath, repoRoot, writeMarkdownReport } from "./release-utils.js";

type CommandStatus = "verified" | "future" | "documented-only";

type CommandCheck = {
  command: string;
  context: string;
  status: CommandStatus;
  notes: string;
};

const readme = await readFile(path.join(repoRoot, "README.md"), "utf8");
const checks: CommandCheck[] = [
  {
    command: "pnpm install",
    context: "Source checkout quickstart",
    status: "verified",
    notes:
      "Verified during local and fresh-clone rehearsal. Non-interactive automation can set CI=true to avoid package-manager prompts."
  },
  {
    command: "pnpm build",
    context: "Source checkout quickstart",
    status: "verified",
    notes: "Verified by release:check and fresh-clone rehearsal."
  },
  {
    command: "pnpm --filter @agentlighthouse/cli dev scan .",
    context: "Source checkout scan",
    status: "verified",
    notes: "Verified by validation and fresh-clone rehearsal."
  },
  {
    command: "pnpm --filter @agentlighthouse/cli dev scan . --report-dir agentlighthouse-reports",
    context: "Source checkout report bundle",
    status: "verified",
    notes: "Verified by workflow validation and fresh-clone rehearsal."
  },
  {
    command:
      "pnpm --filter @agentlighthouse/cli dev baseline create . --output agentlighthouse-baseline.json",
    context: "Source checkout baseline lifecycle",
    status: "verified",
    notes: "Verified by release smoke and fresh-clone rehearsal."
  },
  {
    command: "npm install -g @agentlighthouse/cli",
    context: "Future npm install path",
    status: "future",
    notes: "README explicitly states the package has not been published to npm yet."
  },
  {
    command: "npx @agentlighthouse/cli scan .",
    context: "Future npm install path",
    status: "future",
    notes: "README explicitly marks this as intended post-publication usage."
  },
  {
    command: "uses: PainDeMie64/agentlighthouse@main",
    context: "Experimental source-based GitHub Action",
    status: "documented-only",
    notes:
      "The README and GitHub Action docs recommend direct pnpm CLI commands until npm distribution exists."
  }
];

const requiredReadmeText = [
  "has not been published to npm yet",
  "Future npm install path after publication",
  "direct pnpm CLI commands are the recommended CI path"
];
const missing = requiredReadmeText.filter((text) => !readme.includes(text));
if (missing.length > 0) {
  throw new Error(`README is missing release-status guardrail text: ${missing.join(", ")}`);
}

await writeMarkdownReport(
  readmeCommandCheckReportPath,
  [
    "# README Command Check",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This checklist separates commands that work from source today from future npm-package commands.",
    "",
    "| Command | Context | Status | Notes |",
    "| --- | --- | --- | --- |",
    ...checks.map(
      (check) =>
        `| \`${escapePipes(check.command)}\` | ${escapePipes(check.context)} | ${check.status} | ${escapePipes(check.notes)} |`
    ),
    "",
    "## Result",
    "",
    "Passed. npm install and npx examples are clearly marked as future post-publication usage.",
    ""
  ].join("\n")
);

function escapePipes(value: string): string {
  return value.replaceAll("|", "\\|");
}
