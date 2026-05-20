## AgentLighthouse PR Summary

**Status:** Passed

AgentLighthouse measures **agent-readiness**, not general software quality. It checks whether AI coding agents have enough context, examples, API/tool semantics, and verifiable workflows to use this project safely.

- Score: **95/100**
- Confidence: **Medium** (76/100)
- Coverage: **78%**
- Profile: `devtool`
- Project type: `node_typescript`

### Top Findings

- **low** `freshness.deprecated-or-todo-terms`: Docs contain TODO/deprecated-looking terms without migration guidance

### Recommended Next Actions

1. Use opt-in command probes in trusted environments to verify setup and tests.

### Reports

- validation/reports/agentlighthouse.json
- validation/reports/agentlighthouse.md
- validation/reports/agentlighthouse.sarif

### What Changed

Diff comparison is planned for a future baseline mode. For now, compare this summary with the saved baseline report or previous CI artifact.
