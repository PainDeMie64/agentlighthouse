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

Caps make 100/100 rare. A project should only reach 100 when relevant artifacts are strong, commands are clear, docs are useful, benchmark tasks are verifiable, security guidance exists, no meaningful warnings remain, coverage is high, and confidence is high.

## Subscores

Subscores use the same severity weights for grouped categories:

- Agent Instructions
- Documentation
- API & Tooling
- Examples & Tasks
- Security & Privacy
- Freshness & Consistency

## Evolution

Future models should account for project type, rule confidence, validation task outcomes, docs coverage, API complexity, and historical regressions. Scoring changes must increment the model version and include migration notes.
