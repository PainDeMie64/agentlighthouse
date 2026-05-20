# Baseline Comparison Design

Phase 2B does not implement historical comparison yet, but the reporting model is ready for it.

## Goals

- Save a known-good baseline scan result.
- Compare a current scan against that baseline.
- Detect score regressions.
- Detect new high-severity findings.
- Detect resolved findings.
- Generate PR delta summaries.
- Support changed-files-only mode when useful.
- Compare pull requests against the main branch.
- Feed GitHub Checks without requiring a hosted service.

## Proposed CLI Shape

```bash
agentlighthouse scan . --output current.json
agentlighthouse compare --baseline main.json --current current.json
agentlighthouse scan . --baseline agentlighthouse-baseline.json --fail-on-regression
```

## Comparison Semantics

Findings should be matched by:

- `ruleId`
- affected file
- stable evidence fingerprint
- category and severity

Score deltas should be shown alongside confidence and coverage deltas so a project is not punished merely because AgentLighthouse evaluated more of it.

## Open Questions

- How strict should changed-files-only mode be for repo-wide artifacts such as `AGENTS.md`?
- Should resolved high-severity findings allow a PR to pass even if the absolute score is still low?
- How should baseline files be sanitized before committing to public repos?
