# CI Usage

AgentLighthouse is local-first and can run in GitHub Actions or any CI as a deterministic score gate. It measures agent-readiness, not general software quality.

The public alpha CLI is published on npm. Prefer explicit `@alpha` commands in CI until a stable
release exists.

## Markdown Report and Score Gate

```yaml
name: AgentLighthouse

on:
  pull_request:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx @agentlighthouse/cli@alpha scan . --fail-under 75 --format markdown --output agentlighthouse-report.md
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: agentlighthouse-report
          path: agentlighthouse-report.md
```

The scanner writes reports before applying CI gates, so CI can keep artifacts even when the gate fails.

## Gates

```bash
npx @agentlighthouse/cli@alpha scan . --fail-under 80
npx @agentlighthouse/cli@alpha scan . --fail-under 80 --min-confidence medium
npx @agentlighthouse/cli@alpha scan . --fail-on-severity high
npx @agentlighthouse/cli@alpha scan . --fail-under 80 --fail-on-severity critical
npx @agentlighthouse/cli@alpha scan . --report-dir agentlighthouse-reports
npx @agentlighthouse/cli@alpha scan . --baseline agentlighthouse-baseline.json --report-dir agentlighthouse-reports --fail-on-regression
npx @agentlighthouse/cli@alpha compare --baseline baseline.json --current current.json --fail-on-regression
npx @agentlighthouse/cli@alpha compare --baseline baseline.json --current current.json --fail-on-score-drop 5 --fail-on-new-severity high
npx @agentlighthouse/cli@alpha compare --baseline baseline.json --current current.json --changed-files changed-files.txt --fail-on-new-changed-high
npx @agentlighthouse/cli@alpha compare --baseline baseline.json --current current.json --git-base origin/main --git-head HEAD --fail-on-pr-regression
```

- `--fail-under` fails when the score is below a threshold.
- `--fail-on-severity` fails when any finding is at or above a severity.
- `--min-confidence` fails when the score confidence is too low.
- Compare gates fail on regressions between two saved JSON scan reports.
- `scan --baseline` runs the current scan and comparison in one command.
- PR-aware compare gates fail on new findings introduced on changed files.
- `--probe commands` is opt-in and should only be used in trusted CI jobs.

## Output Formats

- Text: readable terminal output.
- JSON: stable machine-readable output for future API ingestion and dashboards.
- Markdown: issue-compatible report for GitHub comments, pull requests, or artifacts.
- SARIF: GitHub code scanning and other SARIF consumers.
- PR summary: short Markdown for PR comments, step summaries, Slack, or Linear.

## PR Delta Reports

```bash
npx @agentlighthouse/cli@alpha scan . --format json --output current.json
npx @agentlighthouse/cli@alpha compare --baseline agentlighthouse-baseline.json --current current.json --format pr-summary --output agentlighthouse-delta.md
npx @agentlighthouse/cli@alpha scan . --baseline agentlighthouse-baseline.json --comparison-output agentlighthouse-delta.md --comparison-format pr-summary
```

Delta reports show score, confidence, coverage, new findings, resolved findings, and regression gate status.

## Report Bundle

```bash
npx @agentlighthouse/cli@alpha scan . --report-dir agentlighthouse-reports
```

Writes `scan.json`, `scan.md`, `scan.sarif`, and `pr-summary.md`. With `--baseline`, the bundle also includes `comparison.json`, `comparison.md`, and `comparison-pr-summary.md`.

## PR-Aware Delta Reports

```bash
npx @agentlighthouse/cli@alpha scan . --format json --output current.json
git diff --name-status origin/main...HEAD > changed-files.txt
npx @agentlighthouse/cli@alpha compare \
  --baseline agentlighthouse-baseline.json \
  --current current.json \
  --changed-files changed-files.txt \
  --format pr-summary \
  --output agentlighthouse-pr-delta.md
```

Changed-file awareness is for prioritization. AgentLighthouse still compares full scan results and shows global findings separately so PRs cannot hide project-level agent-readiness regressions.

For git-ref detection in GitHub Actions, use `actions/checkout` with `fetch-depth: 0` and pass `--git-base origin/main --git-head HEAD`.

## GitHub Step Summary

```bash
npx @agentlighthouse/cli@alpha scan . --format pr-summary --github-step-summary
```

If `GITHUB_STEP_SUMMARY` is set, AgentLighthouse appends a concise summary. If it is not set, the CLI prints a warning and continues.

## Release Readiness In CI

Before publishing an alpha package, run:

```bash
pnpm release:check
pnpm release:dry-run
```

These commands do not publish packages or create tags.
