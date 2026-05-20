# Changelog

All notable changes to AgentLighthouse will be documented here.

AgentLighthouse follows semantic versioning after the public alpha line, with explicit schema stability notes in `docs/SCHEMA_STABILITY.md`.

## Unreleased

- Release-readiness scripts for packed install smoke tests, npm dry-runs, and pre-release checks.
- Public-alpha packaging metadata for `@agentlighthouse/core` and `@agentlighthouse/cli`.
- Public-alpha documentation for baseline lifecycle, CI usage, schema stability, and release hygiene.

## 0.1.0-alpha.0

Planned first public alpha.

### Included

- Local-first repository scanner.
- Agent-readiness scoring with confidence, coverage, scoring caps, and profiles.
- Structured JSON, Markdown, PR summary, and SARIF reports.
- Baseline creation, validation, summary, comparison, and PR delta reporting.
- Changed-file-aware PR impact classification.
- Deterministic OpenAPI semantic analysis.
- Deterministic MCP static analysis.
- Opt-in command probes for trusted local or CI environments.
- Rich agent task benchmark schema.
- Report bundle workflow for CI artifacts.
- Experimental source-based GitHub Action.
- Local dashboard demo for scan, comparison, PR-aware impact, and workflow artifacts.

### Not Included

- Hosted SaaS.
- Auth or billing.
- Token-backed PR comments.
- GitHub Checks API integration.
- AI agent execution.
- Paid LLM API dependencies.
