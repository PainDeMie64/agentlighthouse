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
