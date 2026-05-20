# CI Usage

AgentLighthouse is local-first and can run in GitHub Actions or any CI as a deterministic score gate. It measures agent-readiness, not general software quality.

The npm package is not published yet. Use workspace commands from a source checkout today. After public alpha publication, the same examples can switch to `npx @agentlighthouse/cli`.

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
      - uses: pnpm/action-setup@v4
        with:
          version: 10.33.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm --filter @agentlighthouse/cli dev scan . --fail-under 75 --format markdown --output agentlighthouse-report.md
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: agentlighthouse-report
          path: agentlighthouse-report.md
```

The scanner writes reports before applying CI gates, so CI can keep artifacts even when the gate fails.

## Gates

```bash
pnpm --filter @agentlighthouse/cli dev scan . --fail-under 80
agentlighthouse scan . --fail-under 80
agentlighthouse scan . --fail-under 80 --min-confidence medium
agentlighthouse scan . --fail-on-severity high
agentlighthouse scan . --fail-under 80 --fail-on-severity critical
agentlighthouse scan . --report-dir agentlighthouse-reports
agentlighthouse scan . --baseline agentlighthouse-baseline.json --report-dir agentlighthouse-reports --fail-on-regression
agentlighthouse compare --baseline baseline.json --current current.json --fail-on-regression
agentlighthouse compare --baseline baseline.json --current current.json --fail-on-score-drop 5 --fail-on-new-severity high
agentlighthouse compare --baseline baseline.json --current current.json --changed-files changed-files.txt --fail-on-new-changed-high
agentlighthouse compare --baseline baseline.json --current current.json --git-base origin/main --git-head HEAD --fail-on-pr-regression
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
agentlighthouse scan . --format json --output current.json
agentlighthouse compare --baseline agentlighthouse-baseline.json --current current.json --format pr-summary --output agentlighthouse-delta.md
agentlighthouse scan . --baseline agentlighthouse-baseline.json --comparison-output agentlighthouse-delta.md --comparison-format pr-summary
```

Delta reports show score, confidence, coverage, new findings, resolved findings, and regression gate status.

## Report Bundle

```bash
agentlighthouse scan . --report-dir agentlighthouse-reports
```

Writes `scan.json`, `scan.md`, `scan.sarif`, and `pr-summary.md`. With `--baseline`, the bundle also includes `comparison.json`, `comparison.md`, and `comparison-pr-summary.md`.

## PR-Aware Delta Reports

```bash
agentlighthouse scan . --format json --output current.json
git diff --name-status origin/main...HEAD > changed-files.txt
agentlighthouse compare \
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
agentlighthouse scan . --format pr-summary --github-step-summary
```

If `GITHUB_STEP_SUMMARY` is set, AgentLighthouse appends a concise summary. If it is not set, the CLI prints a warning and continues.

## Release Readiness In CI

Before publishing an alpha package, run:

```bash
pnpm release:check
pnpm release:dry-run
```

These commands do not publish packages or create tags.
