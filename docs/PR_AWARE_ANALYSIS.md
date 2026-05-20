# PR-Aware Analysis

Phase 2D adds changed-file awareness to baseline comparison. AgentLighthouse still runs full scans; changed files are used to classify and prioritize findings for reviewers.

## Why Full Scan Remains The Source Of Truth

Agent-readiness is often project-level. A pull request that changes one file can affect docs links, setup commands, OpenAPI behavior, MCP tool semantics, scoring caps, confidence, or benchmark coverage. For that reason, AgentLighthouse does not default to changed-files-only scans.

Reports separate:

- new findings on changed files
- resolved findings on changed files
- new global findings
- unchanged findings outside the changed-file set
- findings with unknown location

## Explicit Changed Files

Create a file using `git diff --name-status` style output:

```bash
git diff --name-status origin/main...HEAD > changed-files.txt
agentlighthouse compare \
  --baseline baseline.json \
  --current current.json \
  --changed-files changed-files.txt \
  --format pr-summary
```

Supported statuses include added, modified, deleted, renamed, copied, and unknown. Paths are normalized to repo-relative POSIX paths.

## Git Diff Mode

AgentLighthouse can read changed files directly from local git refs:

```bash
agentlighthouse compare \
  --baseline baseline.json \
  --current current.json \
  --git-base origin/main \
  --git-head HEAD \
  --format markdown \
  --output agentlighthouse-pr-delta.md
```

The CLI does not fetch remotes. In GitHub Actions, use `actions/checkout` with `fetch-depth: 0` when comparing refs.

## PR Gates

```bash
agentlighthouse compare --baseline baseline.json --current current.json \
  --changed-files changed-files.txt \
  --fail-on-new-changed-severity high

agentlighthouse compare --baseline baseline.json --current current.json \
  --git-base origin/main --git-head HEAD \
  --fail-on-pr-regression
```

- `--fail-on-new-changed-severity <severity>` fails when a new finding at or above the threshold appears on a changed or related file.
- `--fail-on-new-changed-high` and `--fail-on-new-changed-critical` are shorthands.
- `--fail-on-pr-regression` fails on a score drop or a new high/critical finding on a changed file.

Global regression gates such as `--fail-on-regression` and `--fail-on-score-drop` still work.

## Interpreting Buckets

- `touched`: the finding location file is directly in the changed-file list.
- `related`: the finding is linked through a location key, previous path, or source file.
- `global`: the finding affects project-level readiness or lacks a single file owner.
- `unrelated`: an unchanged finding outside the changed-file set.
- `unknown`: AgentLighthouse could not confidently locate the finding.

Unknown-location findings should not be ignored. They usually indicate scanner localization should improve or the underlying artifact does not provide a clear anchor.

## Important Caveat

Low agent-readiness does not mean the software is low quality for humans. It means AI coding agents may lack the context, examples, task definitions, or verification hooks needed to use the project reliably.
