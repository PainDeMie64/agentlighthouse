import { spawn } from "node:child_process";
import { finding } from "../findings/helpers.js";
import type {
  CommandProbeResult,
  CommandProbeSummary,
  DetectedProject,
  Finding,
  ProjectSignals,
  ScanOptions
} from "../schemas/types.js";

const defaultAllowedScripts = ["test", "typecheck", "lint"];
const sensitivePattern =
  /(api[_-]?key|token|secret|authorization)\s*[:=]\s*["']?[A-Za-z0-9_.-]{8,}/gi;

export interface CommandProbeRun {
  summary: CommandProbeSummary;
  findings: Finding[];
}

export async function runCommandProbes(
  signals: ProjectSignals,
  detectedProject: DetectedProject,
  options: ScanOptions = {}
): Promise<CommandProbeRun> {
  const probeOptions = options.probes;
  if (!probeOptions?.commands) {
    return {
      summary: {
        enabled: false,
        attempted: 0,
        skipped: plannedScripts(signals, probeOptions?.allowedScripts).length,
        passed: 0,
        failed: 0,
        timedOut: 0,
        results: []
      },
      findings: [
        finding({
          id: "COMMAND_VERIFICATION_SKIPPED",
          title: "Command verification probes were skipped",
          severity: "info",
          category: "setup_and_tests",
          description:
            "Static analysis is default; project commands are not executed unless explicitly enabled.",
          evidence: ["Run with --probe commands or --run-probes to execute safe script probes."],
          recommendation:
            "Use command probes in trusted local or CI environments when you want executable verification.",
          agentFailureMode:
            "Without command probes, AgentLighthouse can tell agents what commands appear to exist, but not whether they currently pass.",
          fixExample: "agentlighthouse scan . --probe commands",
          suggestedFixType: "none"
        })
      ]
    };
  }

  const scripts = plannedScripts(signals, probeOptions.allowedScripts);
  const results: CommandProbeResult[] = [];
  for (const script of scripts) {
    if (!signals.packageJson?.scripts[script]) {
      results.push({
        script,
        command: commandForScript(detectedProject.packageManager, script),
        status: "skipped",
        exitCode: null,
        durationMs: 0,
        reason: "Script is not declared in package.json."
      });
      continue;
    }
    results.push(
      await runScript(
        signals.rootPath,
        commandForScript(detectedProject.packageManager, script),
        script,
        probeOptions.timeoutMs ?? 30_000
      )
    );
  }

  const findings = findingsForResults(results);
  return {
    summary: {
      enabled: true,
      attempted: results.filter((result) => result.status !== "skipped").length,
      skipped: results.filter((result) => result.status === "skipped").length,
      passed: results.filter((result) => result.status === "passed").length,
      failed: results.filter((result) => result.status === "failed").length,
      timedOut: results.filter((result) => result.status === "timed_out").length,
      results
    },
    findings
  };
}

function plannedScripts(signals: ProjectSignals, allowedScripts: string[] | undefined): string[] {
  const allowed =
    allowedScripts && allowedScripts.length > 0 ? allowedScripts : defaultAllowedScripts;
  void signals;
  return [...new Set(allowed)].filter((script) =>
    ["test", "typecheck", "lint", "build"].includes(script)
  );
}

function commandForScript(
  packageManager: DetectedProject["packageManager"],
  script: string
): string {
  if (packageManager === "pnpm") return `pnpm run ${script}`;
  if (packageManager === "yarn") return `yarn ${script}`;
  if (packageManager === "bun") return `bun run ${script}`;
  return `npm run ${script}`;
}

async function runScript(
  cwd: string,
  command: string,
  script: string,
  timeoutMs: number
): Promise<CommandProbeResult> {
  const startedAt = Date.now();
  const [binary, ...args] = command.split(" ");
  if (!binary) {
    return {
      script,
      command,
      status: "failed",
      exitCode: null,
      durationMs: 0,
      reason: "Command could not be parsed."
    };
  }
  return await new Promise((resolve) => {
    const child = spawn(binary, args, { cwd, shell: false });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      resolve({
        script,
        command,
        status: "failed",
        exitCode: null,
        durationMs: Date.now() - startedAt,
        stderrExcerpt: sanitizeOutput(error.message)
      });
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        script,
        command,
        status: timedOut ? "timed_out" : code === 0 ? "passed" : "failed",
        exitCode: code,
        durationMs: Date.now() - startedAt,
        stdoutExcerpt: sanitizeOutput(stdout),
        stderrExcerpt: sanitizeOutput(stderr)
      });
    });
  });
}

function findingsForResults(results: CommandProbeResult[]): Finding[] {
  const findings: Finding[] = [];
  const missing = results.filter((result) => result.status === "skipped");
  const failed = results.filter((result) => result.status === "failed");
  const timedOut = results.filter((result) => result.status === "timed_out");
  const redacted = results.filter((result) =>
    [result.stdoutExcerpt, result.stderrExcerpt].some((excerpt) => excerpt?.includes("[redacted]"))
  );

  if (missing.length > 0) {
    findings.push(
      finding({
        id: "COMMAND_DECLARED_BUT_MISSING",
        title: "Expected verification commands are missing",
        severity: "medium",
        category: "setup_and_tests",
        description: "One or more expected safe scripts were not declared in package.json.",
        evidence: missing.map((result) => result.script),
        recommendation: "Add missing scripts or remove them from probe configuration.",
        agentFailureMode:
          "A coding agent may be told to verify changes with a command that does not exist.",
        fixExample: "Add scripts.test, scripts.typecheck, and scripts.lint where applicable.",
        affectedFile: "package.json",
        suggestedFixType: "add_script"
      })
    );
  }
  if (failed.length > 0) {
    findings.push(
      finding({
        id: "COMMAND_PROBE_FAILED",
        title: "Command probe failed",
        severity: "high",
        category: "setup_and_tests",
        description: "A safe opt-in command probe exited unsuccessfully.",
        evidence: failed.map((result) => `${result.command} exited ${result.exitCode}`),
        recommendation: "Fix the failing command or document known prerequisites.",
        agentFailureMode:
          "A coding agent may follow documented verification steps and hit unexplained failures.",
        fixExample: "Make the script pass locally or document setup required before running it.",
        suggestedFixType: "review_manually"
      })
    );
  }
  if (timedOut.length > 0) {
    findings.push(
      finding({
        id: "COMMAND_PROBE_TIMEOUT",
        title: "Command probe timed out",
        severity: "medium",
        category: "setup_and_tests",
        description: "A safe opt-in command probe exceeded the configured timeout.",
        evidence: timedOut.map(
          (result) => `${result.command} timed out after ${result.durationMs}ms`
        ),
        recommendation: "Adjust probe timeout or split long-running checks into faster scripts.",
        agentFailureMode:
          "A coding agent may not know whether verification hung or simply needs more time.",
        fixExample: "Expose a fast smoke test script for agent and CI verification.",
        suggestedFixType: "review_manually"
      })
    );
  }
  if (redacted.length > 0) {
    findings.push(
      finding({
        id: "COMMAND_OUTPUT_REDACTED",
        title: "Command probe output was redacted",
        severity: "info",
        category: "security_and_privacy",
        description: "Probe output contained secret-like text and was redacted in the scan result.",
        evidence: redacted.map((result) => result.command),
        recommendation: "Ensure scripts do not print secrets or credentials.",
        agentFailureMode:
          "A coding agent reviewing logs could accidentally expose sensitive values.",
        fixExample: "Mask tokens in script output and use placeholders in examples.",
        suggestedFixType: "review_manually"
      })
    );
  }
  return findings;
}

function sanitizeOutput(value: string): string {
  return value.replace(sensitivePattern, "$1=[redacted]").slice(0, 1200);
}
