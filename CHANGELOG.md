# Changelog

All notable changes to AgentLighthouse will be documented here.

AgentLighthouse follows semantic versioning after the public alpha line, with explicit schema stability notes in `docs/SCHEMA_STABILITY.md`.

## Unreleased

- Fresh-clone release rehearsal script.
- README command verification report.
- Package content audit report.
- Public alpha release checklist.
- External trial summary report.

## 0.1.0-alpha.1 - 2026-05-21

Recovery release for npm installability after the first alpha exposed a package metadata issue.

### Fixed

- Replaced the leaked `workspace:` dependency in the published CLI package metadata with an exact npm dependency on `@agentlighthouse/core@0.1.0-alpha.1`.
- Added release checks that inspect packed package metadata and fail if publishable packages contain `workspace:` dependency protocols.
- Updated packed-install smoke tests to use a clean npm consumer project, so npm install behavior is verified before publishing.

### Notes

- This is the first usable npm alpha for CLI consumers.
- `@agentlighthouse/core@0.1.0-alpha.1` and `@agentlighthouse/cli@0.1.0-alpha.1` are published on npm under the `alpha` dist-tag.
- Use explicit `@alpha` install commands while the project remains in public alpha.

## 0.1.0-alpha.0 - 2026-05-21

First public alpha release. Published to npm, but the CLI package is not installable by npm consumers because `@agentlighthouse/core` leaked as a `workspace:` dependency in the published package metadata. Use `0.1.0-alpha.1` or later.

### Known Issue

- `@agentlighthouse/cli@0.1.0-alpha.0` fails npm install with `EUNSUPPORTEDPROTOCOL Unsupported URL Type "workspace:"`.

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
- GitHub Action docs recommend direct CLI workflows while the action remains source-based.

### Known Limitations

- Hosted SaaS.
- Auth or billing.
- Token-backed PR comments.
- GitHub Checks API integration.
- AI agent execution.
- Paid LLM API dependencies.
- npm package metadata for the CLI is broken in this version.
- The GitHub Action is experimental and source-based until npm distribution exists.
- OpenAPI `$ref` handling and MCP static extraction are useful but incomplete.
