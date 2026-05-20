# CI Usage

AgentLighthouse is local-first and can run in GitHub Actions as a deterministic score gate.

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
      - run: pnpm --filter @agentlighthouse/cli dev scan . --fail-under 75 --format markdown --output agentlighthouse-report.md
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: agentlighthouse-report
          path: agentlighthouse-report.md
```

The scanner writes JSON or Markdown output before applying `--fail-under`, so CI can keep the report even when the gate fails.

## Output Formats

- Text: readable terminal output.
- JSON: stable machine-readable output for future API ingestion and dashboards.
- Markdown: issue-compatible report for GitHub comments, pull requests, or artifacts.
- SARIF: planned, not implemented in Phase 1.
