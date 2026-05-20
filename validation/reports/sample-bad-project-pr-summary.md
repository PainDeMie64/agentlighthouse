## AgentLighthouse PR Summary

**Status:** Passed

AgentLighthouse measures **agent-readiness**, not general software quality. It checks whether AI coding agents have enough context, examples, API/tool semantics, and verifiable workflows to use this project safely.

- Score: **0/100**
- Confidence: **Low** (58/100)
- Coverage: **93%**
- Profile: `library`
- Project type: `node_javascript`

### Top Findings

- **high** `agent-instructions.missing-agents-md`: Missing AGENTS.md (AGENTS.md)
- **medium** `agent-instructions.missing-claude-md`: Missing CLAUDE.md (CLAUDE.md)
- **medium** `artifact-quality.READMEmd.missing-clear-test-command`: README.md exists, but does not include clear test command (README.md)
- **medium** `artifact-quality.READMEmd.missing-architecture-or-repo-map`: README.md exists, but does not include architecture or repo map (README.md)
- **low** `artifact-quality.readme-missing-verification-step`: README has installation guidance but no verification step (README.md)

### Recommended Next Actions

1. Run: agentlighthouse init .
2. Add or document setup, test, lint, and typecheck commands.
3. Improve README and docs so agents can find quickstart, install, and examples.
4. Add task benchmarks for the top developer workflows agents should complete.
5. Use opt-in command probes in trusted environments to verify setup and tests.

### Reports

- validation/reports/sample-bad-project.json
- validation/reports/sample-bad-project.md
- validation/reports/sample-bad-project.sarif

### What Changed

Diff comparison is planned for a future baseline mode. For now, compare this summary with the saved baseline report or previous CI artifact.
