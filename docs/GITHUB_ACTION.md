# GitHub Action

AgentLighthouse includes a first composite GitHub Action for CI use. It scans the caller workspace and writes local report artifacts. It does not require a GitHub token unless you choose to upload SARIF.

```yaml
- uses: actions/checkout@v4
- uses: PainDeMie64/agentlighthouse@main
  with:
    path: "."
    fail-under: "75"
    min-confidence: medium
    output-json: "true"
    output-markdown: "true"
    output-sarif: "true"
    github-step-summary: "true"
```

## Inputs

- `path`: path inside the caller workspace to scan.
- `profile`: optional scan profile.
- `fail-under`: fail when the score is below this threshold.
- `fail-on-severity`: fail when any finding is at or above the selected severity.
- `min-confidence`: fail when confidence is below the selected level.
- `probes`: set to `commands` to opt into safe command probes.
- `output-json`, `output-markdown`, `output-sarif`: report artifact toggles.
- `github-step-summary`: append a concise summary to the GitHub step summary.

## Important Behavior

The action scans `${{ github.workspace }}`, not the action repository. Reports are written before score gates fail.

This phase uses a source checkout action that installs and builds AgentLighthouse from the action path. A packaged action or npm distribution should make this faster later.
