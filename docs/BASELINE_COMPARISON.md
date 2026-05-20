# Baseline Comparison Design

Phase 2C implements baseline comparison for saved AgentLighthouse JSON scan results.

## Goals

- Save a known-good baseline scan result.
- Compare a current scan against that baseline.
- Detect score regressions.
- Detect new high-severity findings.
- Detect resolved findings.
- Generate PR delta summaries.
- Support PR-aware changed-file classification without making changed-files-only scans the default.
- Compare pull requests against the main branch.
- Feed GitHub Checks without requiring a hosted service.

## CLI

```bash
agentlighthouse scan . --output current.json
agentlighthouse compare --baseline main.json --current current.json
agentlighthouse compare --baseline main.json --current current.json --format markdown --output delta.md
agentlighthouse compare --baseline main.json --current current.json --format pr-summary --output pr-delta.md
agentlighthouse compare --baseline main.json --current current.json --fail-on-regression
agentlighthouse compare --baseline main.json --current current.json --fail-on-score-drop 5 --fail-on-new-severity high
agentlighthouse compare --baseline main.json --current current.json --changed-files changed-files.txt --format pr-summary
agentlighthouse compare --baseline main.json --current current.json --git-base origin/main --git-head HEAD --fail-on-pr-regression
```

The compare command does not rescan. It reads two saved JSON reports, which keeps CI deterministic and makes it easy to compare local, artifact, or branch-generated reports.

Changed-file inputs are optional. Full scans remain the source of truth; changed files classify which findings are most relevant to the pull request.

## Baseline Storage Strategies

### Committed Baseline File

Run a scan on `main`, commit `agentlighthouse-baseline.json`, and compare pull requests against it.

```bash
agentlighthouse scan . --format json --output agentlighthouse-baseline.json
```

This is simple and token-free. The tradeoff is that the baseline must be updated intentionally when the team accepts new readiness debt or resolves old debt.

### CI Artifact Baseline

Have the main branch CI publish a baseline JSON artifact, then have pull request CI download it and run `agentlighthouse compare`.

This is better for automation but requires CI-provider-specific artifact wiring.

### Manual Baseline Generation

Generate both files locally or in scripts:

```bash
git checkout main
agentlighthouse scan . --format json --output /tmp/baseline.json
git checkout -
agentlighthouse scan . --format json --output /tmp/current.json
agentlighthouse compare --baseline /tmp/baseline.json --current /tmp/current.json
```

This is useful for local review and release checks.

## Comparison Semantics

Findings should be matched by:

- `ruleId`
- affected file
- stable evidence fingerprint
- category and severity

Score deltas are shown alongside confidence and coverage deltas so a project is not punished merely because AgentLighthouse evaluated more of it.

## Gates

- `--fail-on-regression`
- `--fail-on-score-drop <points>`
- `--fail-on-coverage-drop <points>`
- `--fail-on-confidence-drop <points>`
- `--fail-on-new-severity <severity>`
- `--fail-on-new-critical`
- `--fail-on-new-high`
- `--fail-on-new-changed-severity <severity>`
- `--fail-on-new-changed-critical`
- `--fail-on-new-changed-high`
- `--fail-on-pr-regression`

Reports are written before gates fail.

## PR-Aware Changed Files

Use either an explicit changed-files list or local git refs:

```bash
git diff --name-status origin/main...HEAD > changed-files.txt
agentlighthouse compare --baseline baseline.json --current current.json --changed-files changed-files.txt
agentlighthouse compare --baseline baseline.json --current current.json --git-base origin/main --git-head HEAD
```

If both explicit changed files and git refs are supplied, the CLI exits with a clear error. The comparison report separates new findings on changed files from global findings and unrelated existing findings.

## Open Questions

- Should resolved high-severity findings allow a PR to pass even if the absolute score is still low?
- How should baseline files be sanitized before committing to public repos?
- Should scan+baseline convenience mode be added after compare-only usage has settled?
