# AgentLighthouse

AgentLighthouse is Lighthouse for AI agents. It scans a repository and answers:

> Can AI coding agents correctly understand, use, and verify this project?

It is local-first and deterministic by default. It does not require OpenAI, Anthropic, or any other model-provider key.

## Why Agent-Readiness Matters

Coding agents work best when a project has clear setup commands, test commands, docs, API specs, MCP tool descriptions, examples, task workflows, and safety guidance. Many mature projects are excellent for humans but still hard for agents because the context is scattered or not machine-readable.

AgentLighthouse turns that context into a score, structured findings, reports, baselines, and PR deltas.

## What It Does Not Do

AgentLighthouse is not:

- a chatbot
- a replacement for Codex, Claude Code, Cursor, Copilot, OpenClaw, or other agents
- an AI IDE
- an agent execution platform
- a hosted governance suite
- a model-provider gateway

It prepares projects so existing and future agents can use them more reliably.

## Quickstart

AgentLighthouse is prepared for public alpha packaging, but it has not been published to npm yet. Use the local workspace commands today.

Current local development:

```bash
pnpm install
pnpm build
pnpm --filter @agentlighthouse/cli dev scan .
pnpm --filter @agentlighthouse/cli dev scan . --report-dir agentlighthouse-reports
```

The report bundle writes:

- `scan.json`
- `scan.md`
- `scan.sarif`
- `pr-summary.md`

Future npm install path after publication:

```bash
npm install -g @agentlighthouse/cli
agentlighthouse scan .
npx @agentlighthouse/cli scan .
```

Those npm commands are documented as the intended public-alpha experience, not as currently published packages.

## Baselines

Create a baseline from the current accepted state:

```bash
pnpm --filter @agentlighthouse/cli dev baseline create . --output agentlighthouse-baseline.json
pnpm --filter @agentlighthouse/cli dev baseline validate agentlighthouse-baseline.json
pnpm --filter @agentlighthouse/cli dev baseline summary agentlighthouse-baseline.json
```

A baseline is a normal scan-result JSON file. Committing or updating it is an intentional project decision.

## Compare Against A Baseline

```bash
pnpm --filter @agentlighthouse/cli dev scan . \
  --baseline agentlighthouse-baseline.json \
  --report-dir agentlighthouse-reports \
  --comparison-output agentlighthouse-delta.md \
  --comparison-format pr-summary
```

For PR-aware analysis:

```bash
git diff --name-status origin/main...HEAD > changed-files.txt
pnpm --filter @agentlighthouse/cli dev scan . \
  --baseline agentlighthouse-baseline.json \
  --changed-files changed-files.txt \
  --fail-on-pr-regression
```

## CI Usage

Simple scan gate:

```bash
agentlighthouse scan . --fail-under 75 --report-dir agentlighthouse-reports
```

Baseline gate:

```bash
agentlighthouse scan . \
  --baseline agentlighthouse-baseline.json \
  --report-dir agentlighthouse-reports \
  --fail-under 80 \
  --min-confidence medium \
  --fail-on-regression
```

PR-aware gate:

```bash
agentlighthouse scan . \
  --baseline agentlighthouse-baseline.json \
  --git-base origin/main \
  --git-head HEAD \
  --fail-on-pr-regression
```

Reports are written before gates fail.

## GitHub Action

The GitHub Action is experimental for public alpha. It works from source and is useful for dogfooding, but direct pnpm CLI commands are the recommended CI path until `@agentlighthouse/cli` is published.

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: PainDeMie64/agentlighthouse@main
  with:
    path: "."
    baseline: agentlighthouse-baseline.json
    report-dir: agentlighthouse-reports
    git-base: origin/${{ github.base_ref }}
    git-head: HEAD
    fail-on-pr-regression: "true"
```

The current action is source-based: it installs and builds AgentLighthouse from the checked-out action path, then scans the caller workspace through `GITHUB_WORKSPACE`. A future npm distribution will make this faster and simpler.

## Example Output

```text
AgentLighthouse Score: 85/100
Confidence: medium
Coverage: 67%

New high-severity findings:
1. Missing AGENTS.md
2. No test script in package.json

Recommended actions:
1. Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
2. Add a package.json test script or document the equivalent command clearly.
```

## Interpreting Scores

AgentLighthouse measures agent-readiness, not general software quality.

- `90-100`: strong agent context, still check confidence and coverage.
- `70-89`: useful foundation with concrete gaps.
- `40-69`: agents will likely need human help.
- `0-39`: missing core agent-readable context or verifiability.

The score is shown with:

- confidence
- coverage
- human-readable project signals
- agent-specific context layer
- verifiability signals

## Profiles

Supported profiles:

- `default`
- `devtool`
- `api`
- `mcp`
- `docs`
- `library`
- `internal`

Use a profile explicitly:

```bash
agentlighthouse scan . --profile api
```

Or set `agentlighthouse.config.json`.

## Command Probes

Static analysis is the default. Command probes are opt-in:

```bash
agentlighthouse scan . --probe commands
```

AgentLighthouse never runs install commands or arbitrary commands copied from docs. Probes are intended for trusted local or CI environments.

## OpenAPI And MCP Analysis

AgentLighthouse includes deterministic semantic checks for:

- OpenAPI operation IDs, descriptions, examples, auth, errors, pagination, rate limits, and destructive operations
- MCP tool names, descriptions, input schemas, examples, privacy, auth, and side effects

The goal is to explain what an AI coding agent is likely to misunderstand and how to fix it.

## Local Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm validate:realworld
pnpm dev
```

The dashboard runs from `apps/web`.

## Troubleshooting

- If a baseline fails validation, confirm it was created by `agentlighthouse scan --format json` or `agentlighthouse baseline create`, not by `agentlighthouse compare`.
- If git-based PR analysis fails, fetch enough history and retry with `git diff --name-status <base>...<head>`.
- If command probes fail, rerun the underlying package script locally; probes are opt-in and do not install dependencies.
- If a score feels low for a mature project, check confidence, coverage, and the agent-specific context layer before treating it as a software-quality judgment.

## Repository Structure

```text
apps/web                Next.js dashboard
packages/core           scanner, analyzers, scoring, schemas, generators, reporters
packages/cli            command-line interface
examples                sample projects and GitHub Action examples
docs                    product, architecture, scoring, CI, release, and validation docs
validation/reports      safe generated scan reports
```

## Current Limitations

- Packages are not published to npm yet.
- No hosted SaaS yet.
- No auth or billing.
- No token-backed PR comments.
- No GitHub Checks API integration.
- No AI agent execution.
- OpenAPI `$ref` and MCP static extraction are useful but not complete.
- The GitHub Action is source-based until packaging is finalized.

## Release Readiness

Local release checks are available without publishing anything:

```bash
pnpm release:check
pnpm release:dry-run
```

`pnpm release:smoke` packs the core and CLI packages, installs the tarballs in a temporary clean project, and runs the installed `agentlighthouse` binary. No release script publishes packages or creates git tags.

## Roadmap

- Phase 2E: baseline lifecycle, report bundles, dogfood CI, public-alpha DX.
- Phase 3: docs crawler and deeper API/MCP reference resolution.
- Phase 4: deterministic benchmark runner.
- Phase 5: hosted dashboard and project history.

## More Docs

- [CI](docs/CI.md)
- [GitHub Action](docs/GITHUB_ACTION.md)
- [Baseline Comparison](docs/BASELINE_COMPARISON.md)
- [PR-Aware Analysis](docs/PR_AWARE_ANALYSIS.md)
- [Scoring Model](docs/SCORING_MODEL.md)
- [Rules](docs/RULES.md)
- [Release Process](docs/RELEASE.md)
- [Versioning](docs/VERSIONING.md)
- [Schema Stability](docs/SCHEMA_STABILITY.md)
