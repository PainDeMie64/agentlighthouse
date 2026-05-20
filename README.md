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
- Semantic OpenAPI and MCP analysis for agent failure modes, unsafe ambiguity, examples, auth, errors, and tool schemas.
- Opt-in command probes for trusted local verification; static analysis remains the default.
- Score interpretation that separates human-readable signals, agent-specific context, and verifiability.
- CI-ready JSON, Markdown, SARIF, PR-summary, and GitHub step-summary reports.
- Explicit CI gates for score, severity, and confidence.
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

## Troubleshooting

- If install fails, confirm Node.js 22+ and pnpm 10.33.0.
- If command probes fail, rerun the same package script manually and check whether local dependencies are installed.
- If validation reports include unexpected third-party evidence, keep external reports ignored and summarize only the calibration notes.

## CLI Usage

```bash
agentlighthouse scan <path>
agentlighthouse scan <path> --json --output report.json
agentlighthouse scan <path> --format markdown --output report.md
agentlighthouse scan <path> --format sarif --output report.sarif
agentlighthouse scan <path> --format pr-summary --output pr-summary.md
agentlighthouse scan <path> --profile devtool
agentlighthouse scan <path> --probe commands
agentlighthouse scan <path> --fail-under 70 --min-confidence medium
agentlighthouse scan <path> --fail-on-severity high
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

## CI Usage

AgentLighthouse can run as a score gate in GitHub Actions or any CI:

```yaml
- name: AgentLighthouse scan
  run: pnpm --filter @agentlighthouse/cli dev scan . --fail-under 75 --format markdown --output agentlighthouse-report.md
```

The command writes the report before returning a non-zero exit code when the score is below the threshold.

Use the composite action when consuming AgentLighthouse from GitHub:

```yaml
- uses: actions/checkout@v4
- uses: PainDeMie64/agentlighthouse@main
  with:
    path: "."
    fail-under: "75"
    fail-on-severity: high
    min-confidence: medium
    output-sarif: "true"
```

See `docs/CI.md`, `docs/GITHUB_ACTION.md`, and `docs/SARIF.md`.

## Configuration

Add `agentlighthouse.config.json` to set a default profile:

```json
{
  "profile": "devtool",
  "probes": {
    "commands": false,
    "timeoutMs": 30000,
    "allowedScripts": ["test", "typecheck", "lint"]
  }
}
```

Supported profiles are `default`, `devtool`, `api`, `mcp`, `docs`, `library`, and `internal`.

Command probes are off by default. AgentLighthouse never runs install commands or arbitrary commands copied from docs.

## Repository Structure

```text
apps/web                Next.js dashboard
packages/core           scanner, analyzers, scoring, schemas, generators, reporters
packages/cli            command-line interface
examples                 sample projects, including good/bad OpenAPI and MCP fixtures
docs                    product, architecture, scoring, development, validation docs
validation/reports      safe generated scan reports
```

## Roadmap

- Phase 0: foundation, deterministic scanner, docs, CI.
- Phase 1: local scanner and dashboard depth.
- Phase 2A: semantic OpenAPI, MCP, task benchmark, and command probe analysis.
- Phase 2B: CI gates, SARIF, GitHub Action, PR summaries, and step summaries.
- Phase 3: docs crawler plus deeper API/MCP reference resolution.
- Phase 4: agent benchmark runner.
- Phase 5: hosted SaaS dashboard.

## Contributing

Keep the product focused on agent-readiness verification. Generation is useful only when it improves measurable readiness. Add focused tests for scanner, scoring, generator, and CLI changes.
