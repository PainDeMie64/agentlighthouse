# AgentLighthouse

AgentLighthouse is Lighthouse for AI agents. It scans repositories, docs, API specs, MCP-related files, and agent instruction artifacts to answer one question:

> Can AI coding agents correctly understand and use this project?

The first version is deterministic and local-first. It does not require OpenAI, Anthropic, or any other model-provider key.

## Why It Exists

Coding agents are only as good as the context they can read. Many projects have useful human knowledge scattered across READMEs, docs, CI files, package scripts, API schemas, and tribal workflow notes. AgentLighthouse turns that environment into an auditable score, structured findings, and concrete fixes.

It complements Codex, Claude Code, Cursor, GitHub Copilot, Gemini, and future agent platforms by making projects more agent-readable.

## MVP Features

- Local project scanner.
- Agent-readiness score from 0 to 100.
- Structured findings with severity, category, evidence, recommendation, and suggested fix type.
- Detection for `AGENTS.md`, `CLAUDE.md`, `llms.txt`, Cursor/Copilot hints, docs, OpenAPI specs, package scripts, MCP signals, benchmark files, and common config.
- Starter artifact generation for agent instructions, Claude memory, `llms.txt`, `.agentlighthouseignore`, and task benchmarks.
- CLI commands for `scan`, `init`, and `version`.
- Next.js dashboard with sample score, findings, subscores, and recommendations.
- Core unit tests and GitHub Actions CI.

## Quickstart

```bash
pnpm install
pnpm --filter @agentlighthouse/cli dev scan examples/sample-project
pnpm --filter @agentlighthouse/cli dev scan examples/sample-project --json
pnpm --filter @agentlighthouse/cli dev init examples/sample-project --dry-run
```

## Local Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm dev
```

The dashboard runs from `apps/web` through the root `pnpm dev` script.

## CLI Usage

```bash
agentlighthouse scan <path>
agentlighthouse scan <path> --json --output report.json
agentlighthouse scan <path> --fail-under 70
agentlighthouse init <path> --dry-run
agentlighthouse init <path> --force
agentlighthouse version
```

During development, use:

```bash
pnpm --filter @agentlighthouse/cli dev scan .
pnpm --filter @agentlighthouse/cli dev init . --dry-run
```

## Dashboard Usage

```bash
pnpm dev
```

Then open the local Next.js URL printed by the dev server. The initial dashboard uses sample scan data from `@agentlighthouse/core`.

## Repository Structure

```text
apps/web                Next.js dashboard
packages/core           scanner, analyzers, scoring, schemas, generators, reporters
packages/cli            command-line interface
examples/sample-project intentionally imperfect project for scanner validation
docs                    product, architecture, scoring, development, validation docs
validation/reports      safe generated scan reports
```

## Roadmap

- Phase 0: foundation, deterministic scanner, docs, CI.
- Phase 1: local scanner and dashboard depth.
- Phase 2: GitHub Action and PR suggestions.
- Phase 3: docs crawler plus deeper OpenAPI and MCP analysis.
- Phase 4: agent benchmark runner.
- Phase 5: hosted SaaS dashboard.

## Contributing

Keep the product focused on agent-readiness verification. Generation is useful only when it improves measurable readiness. Add focused tests for scanner, scoring, generator, and CLI changes.
