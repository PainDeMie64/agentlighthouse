# Changelog

All notable changes to AgentLighthouse will be documented here.

AgentLighthouse follows semantic versioning after the public alpha line, with explicit schema stability notes in `docs/SCHEMA_STABILITY.md`.

## Unreleased

- Fresh-clone release rehearsal script.
- README command verification report.
- Package content audit report.
- Public alpha release checklist.
- External trial summary report.

## 0.1.0-alpha.0

First public alpha release candidate. This version is not published to npm yet.

### Added

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
- Packed-install smoke tests, npm dry-run scripts, release checks, and fresh-clone rehearsal.

### Changed

- Public docs now separate currently runnable source-checkout commands from future npm commands.
- GitHub Action docs recommend direct pnpm CLI workflows until npm publishing is complete.

### Known Limitations

- Hosted SaaS.
- Auth or billing.
- Token-backed PR comments.
- GitHub Checks API integration.
- AI agent execution.
- Paid LLM API dependencies.
- npm packages are release-ready locally but not published.
- The GitHub Action is experimental and source-based until npm distribution exists.
- OpenAPI `$ref` handling and MCP static extraction are useful but incomplete.
