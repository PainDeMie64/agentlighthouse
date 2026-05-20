import type { Finding, FindingLocation, ProjectSignals } from "../schemas/types.js";

const headingByRule = [
  { pattern: /quickstart/i, heading: /quick\s*start|quickstart|getting started/i },
  { pattern: /install/i, heading: /install|installation|setup/i },
  { pattern: /example|usage/i, heading: /example|usage|demo/i },
  { pattern: /test/i, heading: /test|testing|verify|verification/i },
  { pattern: /security|secret|privacy/i, heading: /security|secret|privacy/i },
  { pattern: /architecture|repo map/i, heading: /architecture|structure|repo map/i }
];

export function enrichFindingLocations(signals: ProjectSignals, findings: Finding[]): Finding[] {
  return findings.map((finding) => {
    if (finding.location) return finding;
    const location = inferLocation(signals, finding);
    return location
      ? {
          ...finding,
          location,
          locationKey: finding.locationKey ?? location.locationKey,
          subject: finding.subject ?? location.subject
        }
      : finding;
  });
}

export function inferLocation(
  signals: ProjectSignals,
  finding: Pick<
    Finding,
    "affectedFile" | "ruleId" | "title" | "evidence" | "locationKey" | "subject"
  >
): FindingLocation | undefined {
  const file = normalizeFile(finding.affectedFile ?? fileFromEvidence(finding.evidence));
  if (!file || file === "n/a") return undefined;
  const content = signals.textByPath[file];
  const sourceKind = sourceKindFor(finding.ruleId, file);
  const line =
    sourceKind === "openapi"
      ? openApiLine(content, finding)
      : sourceKind === "mcp" || sourceKind === "task"
        ? subjectLine(content, finding.subject)
        : markdownLine(content, finding);
  return {
    file,
    ...(line ? { startLine: line } : {}),
    locationKey: finding.locationKey,
    subject: finding.subject,
    symbol: finding.subject,
    sourceKind
  };
}

function markdownLine(
  content: string | undefined,
  finding: Pick<Finding, "ruleId" | "title">
): number | undefined {
  if (!content) return undefined;
  const lines = content.split(/\r?\n/);
  const haystack = `${finding.ruleId} ${finding.title}`;
  const heading = headingByRule.find((entry) => entry.pattern.test(haystack))?.heading;
  if (heading) {
    const index = lines.findIndex((line) => /^#{1,6}\s+/.test(line) && heading.test(line));
    if (index >= 0) return index + 1;
  }
  return 1;
}

function openApiLine(
  content: string | undefined,
  finding: Pick<Finding, "evidence" | "subject">
): number | undefined {
  if (!content) return undefined;
  const subject = finding.subject ?? subjectFromEvidence(finding.evidence);
  const match = subject?.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/i);
  if (!match) return 1;
  const method = match[1]?.toLowerCase();
  const apiPath = match[2];
  const lines = content.split(/\r?\n/);
  const pathIndex = lines.findIndex((line) => line.includes(`${apiPath}:`));
  if (pathIndex < 0) return 1;
  const methodIndex = lines.findIndex(
    (line, index) =>
      index >= pathIndex &&
      index < pathIndex + 30 &&
      Boolean(method) &&
      line.match(new RegExp(`^\\s*${method}:`))
  );
  return methodIndex >= 0 ? methodIndex + 1 : pathIndex + 1;
}

function subjectLine(content: string | undefined, subject: string | undefined): number | undefined {
  if (!content) return undefined;
  if (!subject) return 1;
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(subject));
  return index >= 0 ? index + 1 : 1;
}

function sourceKindFor(ruleId: string, file: string): FindingLocation["sourceKind"] {
  if (ruleId.startsWith("OPENAPI_") || /openapi|swagger/i.test(file)) return "openapi";
  if (ruleId.startsWith("MCP_")) return "mcp";
  if (ruleId.startsWith("TASK_") || /agentlighthouse\.tasks/i.test(file)) return "task";
  if (/\.md$|llms\.txt|AGENTS\.md|CLAUDE\.md/i.test(file)) return "markdown";
  if (/package\.json|config/i.test(file)) return "config";
  return "unknown";
}

function fileFromEvidence(evidence: string[]): string | undefined {
  const candidate = evidence[0]?.split(":")[0]?.trim();
  if (!candidate || /\s/.test(candidate)) return undefined;
  if (
    /^(AGENTS\.md|CLAUDE\.md|README\.md|llms\.txt|package\.json|agentlighthouse\.tasks\.ya?ml)$/i.test(
      candidate
    ) ||
    /\.(md|txt|json|ya?ml|ts|tsx|js|jsx|py|toml|rs|go|html)$/i.test(candidate)
  ) {
    return candidate;
  }
  return undefined;
}

function subjectFromEvidence(evidence: string[]): string | undefined {
  const match = evidence.join("; ").match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s;(]+)/i);
  return match ? `${match[1]?.toUpperCase()} ${match[2]}` : undefined;
}

function normalizeFile(file: string | undefined): string | undefined {
  return file
    ?.trim()
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "");
}
