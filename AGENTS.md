# Agent Instructions for AgentLighthouse

## Project Overview

AgentLighthouse is Lighthouse for AI agents. It scans repos, documentation, API specs, MCP-related files, and agent instruction artifacts to evaluate whether AI coding agents can understand and complete realistic developer workflows.

The product complements agent platforms. It is not a chatbot, AI IDE, hosted governance suite, or model-provider wrapper. Generation is a feature; verification and evidence-based readiness scoring are the product.

## Setup Commands

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm build
```

```bash
pnpm validate:realworld
```

## Test, Lint, and Typecheck Commands

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm lint
```

```bash
pnpm format:check
```

Run tests and typecheck after changing scanner, scoring, generator, CLI, or shared schema logic.

Release-readiness changes should also run:

```bash
pnpm release:check
pnpm release:dry-run
```

## Coding Conventions

- Use strict TypeScript with explicit contracts at package boundaries.
- Keep core product logic in `packages/core`; CLI and web should call core rather than duplicate scanner rules.
- Prefer deterministic checks for the MVP. Optional LLM-backed evaluators can be added later behind interfaces.
- Keep finding IDs stable and namespaced by area, such as `docs.readme-no-quickstart`.
- Add focused tests for new analyzers, scoring behavior, and generator output.
- Keep modules small and evidence-oriented. A finding should explain what was observed and what to fix.

## Architecture Notes

- `packages/core/src/scanners` extracts source signals.
- `packages/core/src/analyzers` turns signals into findings.
- `packages/core/src/scoring` converts findings into scores and subscores.
- `packages/core/src/generators` creates starter artifacts.
- `packages/core/src/reporters` renders CLI, Markdown, JSON, and future GitHub reports.
- `packages/cli` is a thin command layer.
- `apps/web` presents sample and future scan results.

## Files and Directories to Avoid Modifying Casually

- Do not edit `node_modules`, `dist`, `.next`, `coverage`, `.tmp`, or third-party validation repositories.
- Do not commit cloned third-party repos.
- Do not commit package tarballs or `.tmp/release-*` smoke-test directories.
- Do not commit local environment files, secrets, generated private reports, or credentials.
- Avoid unrelated formatting churn.

## Privacy and Security Rules

- Never include real secrets, API keys, credentials, tokens, or private user data in fixtures, docs, examples, or reports.
- Use obvious placeholders such as `EXAMPLE_API_KEY`.
- Do not scan private directories recursively without explicit path input.
- Respect `.gitignore` and `.agentlighthouseignore`.
- Document when a future feature would send code or docs to an external LLM.

## Adding New Features

1. Define or extend the schema/interface in core.
2. Implement scanner/analyzer/scoring logic in core.
3. Add tests with realistic fixtures.
4. Expose the behavior through CLI or dashboard only after core behavior is covered.
5. Update docs and validation guidance.

## Ownership And Review

- Core schema and scoring changes require extra care because CLI, dashboard, reports, and validation all consume those contracts.
- OpenAPI, MCP, command-probe, and benchmark analyzers own their rule IDs and should not silently change existing IDs.
- Review generated validation reports before committing; external reports stay ignored unless deliberately summarized.

## Reporting Uncertainty

If a rule cannot safely determine readiness, emit an informational finding with evidence and a conservative recommendation. Do not invent confidence that the scanner cannot justify.
