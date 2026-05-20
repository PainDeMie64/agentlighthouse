# Roadmap

## Phase 0: Foundation

- Monorepo foundation.
- Deterministic local scanner.
- Transparent scoring.
- CLI and starter generators.
- Sample dashboard.
- Tests, docs, CI, and validation workflow.

## Phase 1: Local Scanner + Dashboard

- Better rule coverage.
- Richer dashboard states.
- Markdown and JSON report export.
- Configurable scan profiles.

## Phase 2A: Semantic Devtool/API/MCP Depth

- OpenAPI operation quality analysis.
- Static MCP tool clarity analysis.
- Opt-in command probes.
- Richer task benchmark schema.
- Findings with agent failure modes and concrete fix examples.
- Score interpretation for human signals, agent context, and verifiability.

## Phase 2B: GitHub Action + PR Suggestions

- Score gates in CI.
- SARIF reporter.
- PR-friendly summaries and GitHub step summaries.
- Composite GitHub Action.
- Future: token-backed PR comments, GitHub Checks, and patch suggestions.

## Phase 2C: Baseline Comparison + PR Delta Reporting

- Stable finding fingerprints.
- Compare command for saved JSON reports.
- Markdown, JSON, text, and PR-summary delta reporters.
- Regression gates for score, confidence, coverage, and new severities.
- GitHub Action baseline input.
- Dashboard comparison demo.

## Phase 2D: Changed-Files-Aware PR Analysis

- Changed-file input from explicit lists or local git refs.
- PR impact classification for touched, related, global, unrelated, and unknown-location findings.
- PR-focused gates for new findings on changed files.
- Better line-level finding locations for Markdown, OpenAPI, MCP, and task benchmark findings.
- SARIF regions when line information is available.
- Dashboard PR impact demo.

## Phase 3: Docs Crawler + Deeper API/MCP Resolution

- Crawl documentation sites safely.
- Resolve OpenAPI `$ref` graphs and SDK examples.
- Inspect MCP tool schemas and descriptions through optional server introspection.

## Phase 4: Agent Benchmark Runner

- Define realistic task suites.
- Run deterministic simulations first.
- Add optional agent execution adapters later.

## Phase 5: Hosted SaaS

- Project history.
- Team dashboards.
- Organization policies.
- Integration marketplace.
