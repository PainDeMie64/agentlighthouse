# Reporters

Reporters render `ScanResult`. They should not perform analysis or scoring.

Current reporters:

- Text: readable terminal output for local use.
- JSON: stable machine-readable scan result for dashboards, APIs, and CI ingestion.
- Markdown: full issue-compatible report.
- SARIF: code-scanning output with rule definitions and file annotations.
- PR summary: concise Markdown for PR comments, step summaries, Slack, or Linear.
- GitHub step summary: PR summary rendered to `GITHUB_STEP_SUMMARY` when available.
- Comparison reporters: text, JSON, Markdown, and PR-summary delta reports for baseline/current scans.
- PR-aware comparison sections: changed files, new findings on changed files, global findings, unknown-location findings, and unrelated existing findings.

## CLI Examples

```bash
agentlighthouse scan . --format json --output agentlighthouse.json
agentlighthouse scan . --format markdown --output agentlighthouse.md
agentlighthouse scan . --format sarif --output agentlighthouse.sarif
agentlighthouse scan . --format pr-summary --output agentlighthouse-pr-summary.md
agentlighthouse compare --baseline baseline.json --current current.json --format markdown --output delta.md
agentlighthouse compare --baseline baseline.json --current current.json --changed-files changed-files.txt --format pr-summary --output pr-delta.md
```

The scan result is the source of truth. Adding future reporters, such as GitHub Checks or SARIF quick fixes, should not change scanner behavior.

SARIF uses line regions when findings have line-level locations. Markdown and PR-summary comparison reports keep global findings visible because project-level agent-readiness can regress even when a specific changed file is not responsible.
