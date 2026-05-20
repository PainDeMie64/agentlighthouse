# GitHub Action

AgentLighthouse includes an experimental source-based composite GitHub Action for CI use. It scans the caller workspace and writes local report artifacts. It does not require a GitHub token unless you choose to upload SARIF.

First-alpha decision: use direct CLI commands until npm package publishing is complete; the action is
experimental. The composite action is useful for dogfooding and early adopters who are comfortable
building the action from source.

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
    report-dir: agentlighthouse-reports
    github-step-summary: "true"
    baseline: agentlighthouse-baseline.json
    comparison-output: agentlighthouse-delta.md
    comparison-format: pr-summary
    git-base: origin/main
    git-head: HEAD
    fail-on-regression: "true"
    fail-on-pr-regression: "true"
```

## Inputs

- `path`: path inside the caller workspace to scan.
- `profile`: optional scan profile.
- `fail-under`: fail when the score is below this threshold.
- `fail-on-severity`: fail when any finding is at or above the selected severity.
- `min-confidence`: fail when confidence is below the selected level.
- `probes`: set to `commands` to opt into safe command probes.
- `output-json`, `output-markdown`, `output-sarif`: report artifact toggles.
- `output-pr-summary`: write `agentlighthouse-pr-summary.md`.
- `report-dir`: write a consistent report bundle directory.
- `github-step-summary`: append a concise summary to the GitHub step summary.
- `baseline`: optional baseline JSON report path inside the caller workspace.
- `comparison-output`: optional comparison report output path.
- `comparison-format`: `text`, `json`, `markdown`, or `pr-summary`.
- `fail-on-regression`, `fail-on-score-drop`, `fail-on-coverage-drop`, `fail-on-confidence-drop`, `fail-on-new-severity`: comparison gates.
- `changed-files`: optional changed-files list path for PR-aware comparison.
- `git-base`, `git-head`: optional local git refs used to compute changed files.
- `pr-mode`: documentation flag for PR-aware usage; changed-file inputs activate PR impact output.
- `fail-on-new-changed-severity`, `fail-on-new-changed-high`, `fail-on-new-changed-critical`, `fail-on-pr-regression`: PR-focused gates.

## Important Behavior

The action scans `${{ github.workspace }}`, not the action repository. Reports are written before score gates fail.

This phase uses a source checkout action that installs and builds AgentLighthouse from the action path. A packaged action or npm distribution should make this faster later.

Public-alpha limitations:

- It requires `pnpm`.
- It builds AgentLighthouse from source on every run.
- It is expected to work as `uses: PainDeMie64/agentlighthouse@main`, but release-tagged action usage should wait for an explicit alpha tag.
- It does not upload artifacts or SARIF by itself; use standard GitHub Actions steps for that.
- It does not call the GitHub API or write token-backed PR comments.

When `baseline` is provided, the action uses `agentlighthouse scan --baseline` so the current scan and comparison run as one workflow. No GitHub token is required for the comparison itself.

For PR-aware git comparison, configure checkout with full history:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: PainDeMie64/agentlighthouse@main
  with:
    baseline: agentlighthouse-baseline.json
    git-base: origin/${{ github.base_ref }}
    git-head: HEAD
    fail-on-pr-regression: "true"
```

If a workflow already generates `changed-files.txt`, pass it with `changed-files`. Do not pass both `changed-files` and `git-base`/`git-head`; the CLI rejects ambiguous changed-file sources.
