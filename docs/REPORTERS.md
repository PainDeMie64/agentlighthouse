# Reporters

Reporters render `ScanResult`. They should not perform analysis or scoring.

Current reporters:

- Text: readable terminal output for local use.
- JSON: stable machine-readable scan result for dashboards, APIs, and CI ingestion.
- Markdown: full issue-compatible report.
- SARIF: code-scanning output with rule definitions and file annotations.
- PR summary: concise Markdown for PR comments, step summaries, Slack, or Linear.
- GitHub step summary: PR summary rendered to `GITHUB_STEP_SUMMARY` when available.

## CLI Examples

```bash
agentlighthouse scan . --format json --output agentlighthouse.json
agentlighthouse scan . --format markdown --output agentlighthouse.md
agentlighthouse scan . --format sarif --output agentlighthouse.sarif
agentlighthouse scan . --format pr-summary --output agentlighthouse-pr-summary.md
```

The scan result is the source of truth. Adding future reporters, such as GitHub Checks or SARIF quick fixes, should not change scanner behavior.
