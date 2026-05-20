import type { ArtifactGenerator, GeneratedArtifact, ProjectSignals } from "../schemas/types.js";

export class StarterArtifactGenerator implements ArtifactGenerator {
  readonly id = "starter-artifacts";

  generate(signals: ProjectSignals): GeneratedArtifact[] {
    return [
      {
        path: "AGENTS.md",
        description: "Agent operating guide",
        content: agentsTemplate(signals)
      },
      {
        path: "CLAUDE.md",
        description: "Claude Code project memory",
        content: claudeTemplate(signals)
      },
      {
        path: "llms.txt",
        description: "LLM-readable project map",
        content: llmsTemplate(signals)
      },
      {
        path: ".agentlighthouseignore",
        description: "AgentLighthouse scan ignore file",
        content: agentLighthouseIgnoreTemplate()
      },
      {
        path: "benchmarks/agent-tasks.yaml",
        description: "Starter deterministic agent task benchmark",
        content: benchmarkTemplate(signals)
      }
    ];
  }
}

function commandOrFallback(signals: ProjectSignals, script: string, fallback: string): string {
  return signals.packageJson?.scripts[script] ? `pnpm ${script}` : fallback;
}

function agentsTemplate(signals: ProjectSignals): string {
  const projectName = signals.projectName;
  return `# Agent Instructions for ${projectName}

## Project Overview
${projectName} is a software project that should be easy for AI coding agents to inspect, modify, test, and document safely. Keep this file current whenever setup, architecture, or workflows change.

## Setup Commands
- Install dependencies: pnpm install
- Start local development: ${commandOrFallback(signals, "dev", "pnpm dev")}
- Build: ${commandOrFallback(signals, "build", "pnpm build")}

## Test, Lint, and Typecheck Commands
- Tests: ${commandOrFallback(signals, "test", "pnpm test")}
- Lint: ${commandOrFallback(signals, "lint", "pnpm lint")}
- Typecheck: ${commandOrFallback(signals, "typecheck", "pnpm typecheck")}

## Coding Conventions
- Prefer small, typed modules with clear ownership boundaries.
- Follow existing naming, formatting, and package structure before introducing new abstractions.
- Keep deterministic logic separate from optional model-provider integrations.
- Add or update tests for scanner, scoring, generator, and CLI behavior when functionality changes.

## Architecture Notes
- Keep core product logic in shared packages, not in UI or CLI command handlers.
- Treat generated artifacts as suggestions unless a command explicitly writes them.
- Make future integrations possible through interfaces rather than hardcoded provider logic.

## Files and Directories to Avoid Modifying Casually
- Do not edit dependency directories, generated build output, coverage, or temporary validation repositories.
- Do not commit secrets, local environment files, or third-party repositories cloned for validation.
- Avoid broad formatting churn unless the task is specifically about formatting.

## Privacy and Security Rules
- Never expose secrets, credentials, private tokens, or user data in docs, examples, reports, or tests.
- Use obviously fake placeholders such as EXAMPLE_API_KEY instead of realistic secrets.
- Be explicit when a workflow would send code, docs, or logs to an external LLM or service.

## Adding New Features
- Start in the smallest package that owns the behavior.
- Add schemas or interfaces before wiring feature-specific implementations.
- Include a realistic sample or validation case when adding scanner rules.

## Reporting Uncertainty
- If behavior depends on unavailable services, credentials, or private context, say so clearly.
- Prefer a conservative finding with evidence over an overconfident recommendation.
`;
}

function claudeTemplate(signals: ProjectSignals): string {
  return `# Claude Project Memory: ${signals.projectName}

${signals.projectName} should remain agent-readable, deterministic by default, and easy to validate locally.

## Preferred Workflow
- Install with pnpm install.
- Run tests before handing back scanner, scoring, or generator changes.
- Run lint and typecheck for TypeScript changes.
- Keep generated files and third-party validation repositories out of commits.

## Testing Expectations
- Core scanner and scoring changes need focused unit tests.
- CLI behavior should stay thin and rely on core contracts.
- Documentation changes should keep commands consistent with package scripts.

## Product Boundaries
- Do not turn this project into a general chatbot, AI IDE, model gateway, or hosted governance suite by default.
- Generation is a feature; verification and evidence-based readiness scoring are the product.

## Naming Conventions
- Use "AgentLighthouse" for the product.
- Use "agent-readiness" for the product category.
- Keep finding IDs stable and namespaced by analyzer area.
`;
}

function llmsTemplate(signals: ProjectSignals): string {
  return `# ${signals.projectName}

Agent-readable project map for AI coding assistants.

## Overview
${signals.projectName} is designed to be inspected and improved by coding agents using deterministic project context.

## Key Links
- [README](README.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Product Spec](docs/PRODUCT_SPEC.md)
- [Scoring Model](docs/SCORING_MODEL.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Validation Guide](docs/VALIDATION.md)
- [Agent Instructions](AGENTS.md)
- [Agent Task Benchmark](benchmarks/agent-tasks.yaml)

## Example Usage
- Run a scan: \`agentlighthouse scan .\`
- Generate starter artifacts: \`agentlighthouse init .\`
`;
}

function agentLighthouseIgnoreTemplate(): string {
  return `node_modules/
.git/
dist/
build/
coverage/
.next/
.turbo/
.vercel/
.tmp/
vendor/
*.log
.env
.env.*
secrets/
*.key
*.pem
pnpm-lock.yaml
package-lock.json
yarn.lock
`;
}

function benchmarkTemplate(signals: ProjectSignals): string {
  return `version: 0.1.0
project: ${signals.projectName}
tasks:
  - id: install-project
    title: Install the project
    prompt: Install dependencies for this project and report the exact command used.
    success_criteria:
      - Dependencies install without undocumented prerequisites.
      - The agent can identify the package manager.
  - id: run-tests
    title: Run the test suite
    prompt: Run the project's tests and summarize any failures with file paths.
    success_criteria:
      - The documented test command is discoverable.
      - Test output can be interpreted without hidden context.
  - id: add-small-scanner-rule
    title: Add a small scanner rule
    prompt: Add a deterministic scanner rule for a missing documentation signal and cover it with a unit test.
    success_criteria:
      - The agent finds the scanner and analyzer modules.
      - The new rule produces a structured finding.
      - Tests pass.
  - id: find-scoring-implementation
    title: Find scoring implementation
    prompt: Identify where the AgentLighthouse score is calculated and explain the severity weights.
    success_criteria:
      - The agent locates the scoring module.
      - The explanation matches the current scoring model.
  - id: generate-agent-instructions
    title: Generate AGENTS.md for a sample project
    prompt: Generate or update AGENTS.md for examples/sample-project without overwriting existing useful content.
    success_criteria:
      - The agent preserves existing user content.
      - The generated file includes setup, tests, conventions, and safety guidance.
`;
}
