# External Trial Summary

Generated: 2026-05-20T21:49:56.554Z

This report summarizes public or local repositories scanned from `.tmp/validation-repos/` without committing third-party source code or full external reports.

| Repository           |  Score | Confidence | Coverage | Top Findings                                                                                                                                                                                                                                             | Fairness Note                                                                                                                                   |
| -------------------- | -----: | ---------- | -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `expressjs-docs`     | 31/100 | medium     |      90% | high agent-instructions.missing-agents-md: Missing AGENTS.md<br>medium agent-instructions.missing-claude-md: Missing CLAUDE.md<br>medium artifact-quality.READMEmd.missing-clear-test-command: README.md exists, but does not include clear test command | Low scores usually reflect missing agent-specific context, task benchmarks, or machine-readable workflows rather than general software quality. |
| `mcp-typescript-sdk` |  0/100 | medium     |      92% | high agent-instructions.missing-agents-md: Missing AGENTS.md<br>low artifact-quality.readme-missing-verification-step: README has installation guidance but no verification step<br>medium llms.missing: Missing llms.txt                                | Low scores usually reflect missing agent-specific context, task benchmarks, or machine-readable workflows rather than general software quality. |
| `sindresorhus-is`    |  7/100 | medium     |      89% | medium agent-instructions.agents-too-short: AGENTS.md is too short<br>medium agent-instructions.missing-setup: AGENTS.md does not mention setup commands<br>medium agent-instructions.missing-tests: AGENTS.md does not mention test commands            | Low scores usually reflect missing agent-specific context, task benchmarks, or machine-readable workflows rather than general software quality. |

## Notes

- External source code is not committed.
- Full external reports should be reviewed for sensitive paths before committing.
- Low agent-readiness scores are expected for mature projects that have not added agent-specific context files yet.
