# First User Trial

This guide is for people trying AgentLighthouse for the first time. The goal is to learn whether
the scanner gives useful, fair, actionable agent-readiness feedback on your real project.

AgentLighthouse is local-first. It does not upload your code, call LLM APIs, execute AI agents, or
require a cloud account.

## 1. Install Or Run With npx

Use the explicit alpha tag:

```bash
npx @agentlighthouse/cli@alpha scan .
```

Or install globally:

```bash
npm install -g @agentlighthouse/cli@alpha
agentlighthouse scan .
```

`0.1.0-alpha.1` is the first usable npm alpha. The `0.1.0-alpha.0` CLI package was deprecated
because of a packaging issue.

## 2. Run A Scan And Keep Reports

```bash
npx @agentlighthouse/cli@alpha scan . --report-dir agentlighthouse-reports
```

The report directory includes:

- `scan.json`
- `scan.md`
- `scan.sarif`
- `pr-summary.md`

The score measures agent-readiness, not general software quality. A mature human-friendly project
can score lower if it lacks agent instructions, task workflows, machine-readable context, or
verifiable commands.

## 3. Create A Baseline

Create a baseline once the current score is an accepted starting point:

```bash
npx @agentlighthouse/cli@alpha baseline create . --output agentlighthouse-baseline.json
npx @agentlighthouse/cli@alpha baseline validate agentlighthouse-baseline.json
```

Then compare future changes:

```bash
npx @agentlighthouse/cli@alpha scan . \
  --baseline agentlighthouse-baseline.json \
  --report-dir agentlighthouse-reports \
  --comparison-format pr-summary \
  --comparison-output agentlighthouse-delta.md
```

## 4. Use CI Later

Start with a non-blocking CI job that uploads reports. Once the findings feel calibrated, add gates
such as:

```bash
npx @agentlighthouse/cli@alpha scan . --fail-under 75 --report-dir agentlighthouse-reports
```

For PR-aware comparison:

```bash
git diff --name-status origin/main...HEAD > changed-files.txt
npx @agentlighthouse/cli@alpha scan . \
  --baseline agentlighthouse-baseline.json \
  --changed-files changed-files.txt \
  --fail-on-pr-regression
```

## 5. Feedback That Helps Most

Please open an issue with:

- whether the score felt fair or unfair
- which top findings were useful
- which findings were noisy or confusing
- false positives
- false negatives
- install or `npx` issues
- docs or CI confusion
- your project shape: API, SDK, MCP server, docs site, CLI, internal app, library

Do not include secrets, private code, private paths, or proprietary API payloads. Redacted report
snippets are enough.

## 6. What Not To Expect Yet

AgentLighthouse alpha does not include:

- hosted SaaS
- auth or billing
- token-backed PR comments
- GitHub Checks API integration
- AI-agent execution
- paid LLM API calls
- perfect OpenAPI `$ref` resolution
- perfect MCP static extraction
- guaranteed line-level precision for every finding

The alpha is useful for local scans, reports, baselines, PR deltas, OpenAPI/MCP first-pass checks,
and calibration feedback from real projects.
