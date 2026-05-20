# Scoring Model

Scoring model version: `0.1.0`

## Formula

The AgentLighthouse score starts at 100. Findings subtract points by severity:

- `critical`: -20
- `high`: -10
- `medium`: -5
- `low`: -2
- `info`: 0

The final score is clamped between 0 and 100.

## Confidence And Coverage

Phase 1.5 adds:

- `scoreConfidence`: `high`, `medium`, or `low`
- `scoreConfidenceScore`: 0 to 100
- `coverage.coveragePercent`: how many applicable categories/checks were actually evaluated

A high score with medium or low confidence should be read as "good based on available evidence," not as proof that all agent workflows are ready.

## Scoring Caps

Severity penalties produce a raw score. Scoring caps then limit the maximum final score when important readiness areas are absent or shallow.

Initial caps:

- No agent instruction artifacts: max 80
- Setup or tests not verifiable: max 85
- Documentation missing or not analyzable: max 70
- Unknown project type: max 75
- Missing task benchmarks: max 90
- Coverage below 70%: max 85
- Coverage below 50%: max 70
- Shallow key artifacts: max 95
- API profile without OpenAPI: max 82
- MCP profile without MCP tools: max 82

Caps make 100/100 rare. A project should only reach 100 when relevant artifacts are strong, commands are clear, docs are useful, benchmark tasks are verifiable, security guidance exists, no meaningful warnings remain, coverage is high, and confidence is high.

## Subscores

Subscores use the same severity weights for grouped categories:

- Agent Instructions
- Documentation
- API & Tooling
- Examples & Tasks
- Security & Privacy
- Freshness & Consistency

## Score Interpretation

Reports now separate:

- Agent-Readiness Score: the main calibrated score.
- Human-readable project signals: README, docs, examples, package metadata, and API specs.
- Agent-specific context layer: AGENTS.md, CLAUDE.md, llms.txt, Cursor/Copilot instructions, and task benchmarks.
- Verifiability: scripts, examples, task verification commands, API examples, and optional command probes.

A mature public repository can have strong human-readable signals while still scoring lower on agent-readiness because it lacks the agent-specific context layer.

## Profiles

Profiles tune applicability and future scoring emphasis:

- `api`: stricter on OpenAPI descriptions, examples, auth, and error recovery.
- `mcp`: stricter on MCP tool clarity, schemas, privacy, and destructive actions.
- `docs`: avoids package-script expectations that do not fit docs-only projects.
- `library`: emphasizes README, package metadata, examples, and tests.
- `internal`: emphasizes setup, conventions, privacy, and task workflows.
- `devtool`: emphasizes docs, examples, APIs, setup, and agent artifacts.

## Evolution

Future models should account for project type, rule confidence, validation task outcomes, docs coverage, API complexity, and historical regressions. Scoring changes must increment the model version and include migration notes.

## CI Interpretation

CI gates should combine score, severity, and confidence:

```bash
agentlighthouse scan . --fail-under 80 --min-confidence medium
agentlighthouse scan . --fail-on-severity high
```

A low score in CI means the project is not yet agent-ready under the selected profile. It does not mean the software is low quality for humans.
