import { parse as parseYaml } from "yaml";
import { finding } from "../findings/helpers.js";
import type { Finding, ProjectSignals } from "../schemas/types.js";

type JsonObject = Record<string, unknown>;

interface ParsedTask {
  file: string;
  id: string;
  title?: string;
  persona?: string;
  objective?: string;
  requiredDocs: string[];
  expectedOutputs: string[];
  successCriteria: string[];
  verificationCommands: string[];
  riskLevel?: string;
  commonFailureModes: string[];
}

export function analyzeTaskBenchmarks(signals: ProjectSignals): Finding[] {
  if (signals.benchmarkFiles.length === 0) {
    return [
      finding({
        id: "TASK_BENCHMARK_MISSING",
        title: "Missing agent task benchmark file",
        severity: "medium",
        category: "task_benchmarks",
        description: "The project has no agentlighthouse.tasks.yaml or benchmark task file.",
        evidence: ["No agent task benchmark file was found."],
        recommendation:
          "Add agentlighthouse.tasks.yaml with realistic, verifiable agent workflows.",
        agentFailureMode:
          "A team cannot tell whether agents can complete common workflows because no deterministic task set exists.",
        fixExample:
          "Add tasks for installing the project, running tests, adding a small feature, and using the public API.",
        affectedFile: "agentlighthouse.tasks.yaml",
        suggestedFixType: "create_file"
      })
    ];
  }

  const tasks = signals.benchmarkFiles.flatMap((file) =>
    parseTasks(file, signals.textByPath[file])
  );
  const findings: Finding[] = [];
  pushTaskFinding(findings, {
    id: "TASK_OBJECTIVE_TOO_VAGUE",
    title: "Benchmark tasks have vague objectives",
    severity: "medium",
    tasks: tasks.filter((task) => !task.objective || task.objective.length < 30),
    recommendation: "Write task objectives as concrete user goals with project-specific context.",
    agentFailureMode:
      "A coding agent may optimize for the wrong outcome because the task goal is underspecified.",
    fixExample: "Objective: Add cursor pagination to GET /customers and update the SDK example."
  });
  pushTaskFinding(findings, {
    id: "TASK_SUCCESS_CRITERIA_MISSING",
    title: "Benchmark tasks lack success criteria",
    severity: "medium",
    tasks: tasks.filter((task) => task.successCriteria.length === 0),
    recommendation:
      "Add successCriteria items that can be checked by humans or deterministic commands.",
    agentFailureMode:
      "A task may look complete even when tests, docs, or expected files are missing.",
    fixExample:
      "Success criteria: unit tests pass, docs mention the new flag, and output includes next_cursor."
  });
  pushTaskFinding(findings, {
    id: "TASK_VERIFICATION_MISSING",
    title: "Benchmark tasks lack verification commands",
    severity: "medium",
    tasks: tasks.filter((task) => task.verificationCommands.length === 0),
    recommendation: "Add verificationCommands for tests, typecheck, lint, build, or smoke checks.",
    agentFailureMode:
      "Agent success cannot be validated without a repeatable command or inspection step.",
    fixExample: "verificationCommands: ['pnpm test', 'pnpm typecheck']"
  });
  pushTaskFinding(findings, {
    id: "TASK_RISK_UNMARKED",
    title: "Risky benchmark tasks do not mark risk level",
    severity: "low",
    tasks: tasks.filter((task) => taskLooksRisky(task) && !task.riskLevel),
    recommendation:
      "Set riskLevel for tasks that touch auth, secrets, writes, deletes, billing, or external APIs.",
    agentFailureMode:
      "A coding agent may perform risky operations without extra review expectations.",
    fixExample: "riskLevel: high for tasks that mutate production-like data or handle credentials."
  });
  pushTaskFinding(findings, {
    id: "TASK_REQUIRED_DOCS_MISSING",
    title: "Benchmark tasks do not name required docs",
    severity: "low",
    tasks: tasks.filter((task) => task.requiredDocs.length === 0),
    recommendation:
      "List requiredDocs so agents know which instructions and docs should be sufficient.",
    agentFailureMode:
      "A task may pass only because an agent guessed from source code instead of using intended docs.",
    fixExample: "requiredDocs: ['README.md', 'docs/API.md', 'AGENTS.md']"
  });
  pushTaskFinding(findings, {
    id: "TASK_FAILURE_MODES_MISSING",
    title: "Benchmark tasks lack common failure modes",
    severity: "low",
    tasks: tasks.filter((task) => task.commonFailureModes.length === 0),
    recommendation: "Document common mistakes agents make on each task.",
    agentFailureMode:
      "Reviewers cannot distinguish robust task completion from lucky partial completion.",
    fixExample: "commonFailureModes: ['forgets auth header', 'updates generated files directly']"
  });
  return findings;
}

function parseTasks(file: string, content: string | undefined): ParsedTask[] {
  if (!content) return [];
  try {
    const parsed = parseYaml(content) as JsonObject;
    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    return rawTasks
      .filter((task): task is JsonObject => Boolean(task) && typeof task === "object")
      .map((task, index) => ({
        file,
        id: stringValue(task.id) ?? `task-${index + 1}`,
        title: stringValue(task.title),
        persona: stringValue(task.persona),
        objective: stringValue(task.objective) ?? stringValue(task.prompt),
        requiredDocs: stringArray(task.requiredDocs),
        expectedOutputs: stringArray(task.expectedOutputs),
        successCriteria: stringArray(task.successCriteria).concat(
          stringArray(task.success_criteria)
        ),
        verificationCommands: stringArray(task.verificationCommands),
        riskLevel: stringValue(task.riskLevel),
        commonFailureModes: stringArray(task.commonFailureModes)
      }));
  } catch {
    return [];
  }
}

function pushTaskFinding(
  findings: Finding[],
  input: {
    id: string;
    title: string;
    severity: Finding["severity"];
    tasks: ParsedTask[];
    recommendation: string;
    agentFailureMode: string;
    fixExample: string;
  }
): void {
  if (input.tasks.length === 0) return;
  findings.push(
    finding({
      id: input.id,
      title: input.title,
      severity: input.severity,
      category: "task_benchmarks",
      description: `${input.tasks.length} benchmark task(s) need stronger verification metadata.`,
      evidence: input.tasks.slice(0, 8).map((task) => `${task.file}: ${task.id}`),
      recommendation: input.recommendation,
      agentFailureMode: input.agentFailureMode,
      fixExample: input.fixExample,
      affectedFile: input.tasks[0]?.file,
      suggestedFixType: "update_file"
    })
  );
}

function taskLooksRisky(task: ParsedTask): boolean {
  const haystack = [
    task.title,
    task.objective,
    task.expectedOutputs.join(" "),
    task.successCriteria.join(" ")
  ]
    .join(" ")
    .toLowerCase();
  return /(delete|write|secret|token|auth|billing|payment|external|production|customer)/i.test(
    haystack
  );
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
