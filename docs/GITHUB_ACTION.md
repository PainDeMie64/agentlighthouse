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
    baseline: agentlighthouse-baseline.json
    comparison-output: agentlighthouse-delta.md
    comparison-format: pr-summary
    fail-on-regression: "true"
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
- `baseline`: optional baseline JSON report path inside the caller workspace.
- `comparison-output`: optional comparison report output path.
- `comparison-format`: `text`, `json`, `markdown`, or `pr-summary`.
- `fail-on-regression`, `fail-on-score-drop`, `fail-on-coverage-drop`, `fail-on-confidence-drop`, `fail-on-new-severity`: comparison gates.

## Important Behavior

The action scans `${{ github.workspace }}`, not the action repository. Reports are written before score gates fail.

This phase uses a source checkout action that installs and builds AgentLighthouse from the action path. A packaged action or npm distribution should make this faster later.

When `baseline` is provided, the action writes a current JSON report and runs `agentlighthouse compare`. No GitHub token is required for the comparison itself.
