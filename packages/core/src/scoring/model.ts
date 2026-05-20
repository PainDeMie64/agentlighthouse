import type {
  Finding,
  ProjectSignals,
  ScanResult,
  ScoringModule,
  Subscore
} from "../schemas/types.js";

export const scoringModelVersion = "0.1.0";

export const severityWeights = {
  critical: 20,
  high: 10,
  medium: 5,
  low: 2,
  info: 0
} as const satisfies Record<Finding["severity"], number>;

const subscoreDefinitions = [
  {
    id: "agent_instructions",
    label: "Agent Instructions",
    categories: ["agent_instructions"] as const
  },
  {
    id: "documentation",
    label: "Documentation",
    categories: ["documentation", "repo_structure"] as const
  },
  {
    id: "api_and_tooling",
    label: "API & Tooling",
    categories: ["api_schema", "mcp_tools", "setup_and_tests"] as const
  },
  {
    id: "examples_and_tasks",
    label: "Examples & Tasks",
    categories: ["examples", "task_benchmarks"] as const
  },
  {
    id: "security_and_privacy",
    label: "Security & Privacy",
    categories: ["security_and_privacy"] as const
  },
  {
    id: "freshness_and_consistency",
    label: "Freshness & Consistency",
    categories: ["freshness_and_consistency"] as const
  }
];

export class TransparentScoringModel implements ScoringModule {
  readonly id = "transparent-severity-scoring";
  readonly version = scoringModelVersion;

  score(findings: Finding[], signals: ProjectSignals): Omit<ScanResult, "signals" | "scannedAt"> {
    const score = clampScore(100 - totalPenalty(findings));
    const subscores = subscoreDefinitions.map<Subscore>((definition) => {
      const relevantFindings = findings.filter((finding) =>
        definition.categories.some((category) => category === finding.category)
      );
      return {
        id: definition.id,
        label: definition.label,
        score: clampScore(100 - totalPenalty(relevantFindings))
      };
    });

    return {
      projectPath: signals.rootPath,
      projectName: signals.projectName,
      scoringModelVersion,
      score,
      summary: summarize(score, findings),
      subscores,
      findings,
      recommendedActions: recommendedActions(findings)
    };
  }
}

function totalPenalty(findings: Finding[]): number {
  return findings.reduce((total, finding) => total + severityWeights[finding.severity], 0);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function summarize(score: number, findings: Finding[]): string {
  const blocking = findings.filter((finding) => ["critical", "high"].includes(finding.severity));
  if (score >= 85) {
    return `Strong agent-readiness with ${blocking.length} high-priority issue(s) remaining.`;
  }
  if (score >= 65) {
    return `Useful foundation, but ${blocking.length} high-priority readiness issue(s) should be fixed.`;
  }
  return `Agent-readiness needs focused work before agents can reliably use this project.`;
}

function recommendedActions(findings: Finding[]): string[] {
  const actions: string[] = [];
  const ids = new Set(findings.map((finding) => finding.id));
  if (ids.has("agent-instructions.missing-agents-md") || ids.has("llms.missing")) {
    actions.push("Run: agentlighthouse init .");
  }
  if ([...ids].some((id) => id.startsWith("setup."))) {
    actions.push("Add or document setup, test, lint, and typecheck commands.");
  }
  if ([...ids].some((id) => id.startsWith("docs."))) {
    actions.push("Improve README and docs so agents can find quickstart, install, and examples.");
  }
  if ([...ids].some((id) => id.startsWith("benchmarks."))) {
    actions.push("Add task benchmarks for the top developer workflows agents should complete.");
  }
  if ([...ids].some((id) => id.startsWith("security."))) {
    actions.push("Document secret-handling and privacy rules for agent workflows.");
  }
  return actions.slice(0, 5);
}
