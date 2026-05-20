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
        path: "agentlighthouse.tasks.yaml",
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
- [Agent Task Benchmark](agentlighthouse.tasks.yaml)

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
    persona: new contributor using an AI coding agent
    objective: Install dependencies, identify the package manager, and verify the project reaches a working local state.
    projectAreas:
      - setup
      - documentation
    requiredDocs:
      - README.md
      - AGENTS.md
    allowedFiles:
      - package.json
      - README.md
      - AGENTS.md
    disallowedFiles:
      - node_modules/**
      - .env
    expectedActions:
      - Read README and AGENTS.md before running commands.
      - Identify the package manager from package metadata.
    expectedOutputs:
      - A short note with the install command and any missing prerequisite.
    successCriteria:
      - Dependencies install without undocumented prerequisites.
      - The agent can identify the package manager.
    verificationCommands:
      - pnpm test
    riskLevel: low
    commonFailureModes:
      - Runs an install command that is not documented.
      - Ignores package manager metadata.
  - id: run-tests
    title: Run the test suite
    persona: maintainer checking a small change
    objective: Run the documented verification commands and summarize failures with actionable file paths.
    projectAreas:
      - tests
      - ci
    requiredDocs:
      - README.md
      - AGENTS.md
    allowedFiles:
      - package.json
      - packages/**
      - apps/**
    disallowedFiles:
      - node_modules/**
      - dist/**
    expectedActions:
      - Run the test command.
      - Run typecheck or lint if documented.
    expectedOutputs:
      - Test result summary with failing command and file paths if any.
    successCriteria:
      - The documented test command is discoverable.
      - Test output can be interpreted without hidden context.
    verificationCommands:
      - pnpm test
      - pnpm typecheck
    riskLevel: low
    commonFailureModes:
      - Reports success without running the documented command.
      - Omits failing file paths.
  - id: add-small-scanner-rule
    title: Add a small scanner rule
    persona: product engineer extending deterministic analysis
    objective: Add a deterministic scanner rule for a missing documentation signal and cover it with a unit test.
    projectAreas:
      - packages/core
      - tests
    requiredDocs:
      - docs/ARCHITECTURE.md
      - docs/RULES.md
      - AGENTS.md
    allowedFiles:
      - packages/core/**
      - docs/RULES.md
    disallowedFiles:
      - validation/reports/external/**
    expectedActions:
      - Add a stable finding rule ID.
      - Add or update a focused unit test.
    expectedOutputs:
      - Code change plus passing test command.
    successCriteria:
      - The agent finds the scanner and analyzer modules.
      - The new rule produces a structured finding.
      - Tests pass.
    verificationCommands:
      - pnpm test
      - pnpm typecheck
    riskLevel: medium
    commonFailureModes:
      - Adds a vague finding without an agent failure mode.
      - Changes scoring globally without a test.
`;
}
