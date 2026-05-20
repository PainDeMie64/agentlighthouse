## AgentLighthouse PR Summary

**Status:** Passed

AgentLighthouse measures **agent-readiness**, not general software quality. It checks whether AI coding agents have enough context, examples, API/tool semantics, and verifiable workflows to use this project safely.

- Score: **95/100**
- Confidence: **Medium** (82/100)
- Coverage: **78%**
- Profile: `mcp`
- Project type: `mcp_project`

### Top Findings

- **low** `agent-instructions.claude-vague`: CLAUDE.md appears stale or too vague (CLAUDE.md)

### Recommended Next Actions

1. Use opt-in command probes in trusted environments to verify setup and tests.

### Reports

- validation/reports/mcp-good-project.json
- validation/reports/mcp-good-project.md
- validation/reports/mcp-good-project.sarif

### What Changed

Diff comparison is planned for a future baseline mode. For now, compare this summary with the saved baseline report or previous CI artifact.
