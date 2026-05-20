## AgentLighthouse PR Delta: Regressed

**Status:** Passed

Score: **85 -> 0** (-85)
Confidence: **medium -> low** (-8)
Coverage: **67% -> 93%** (+26%)

### New High-Severity Findings

1. **high** `agent-instructions.missing-agents-md`: Missing AGENTS.md (AGENTS.md)
2. **high** `setup.missing-test-script`: No test script in package.json (package.json)
3. **high** `setup.package-json-no-scripts`: package.json has no scripts (package.json)

### Top New Findings

1. **high** `agent-instructions.missing-agents-md`: Missing AGENTS.md (AGENTS.md)
2. **high** `setup.missing-test-script`: No test script in package.json (package.json)
3. **high** `setup.package-json-no-scripts`: package.json has no scripts (package.json)
4. **medium** `agent-instructions.missing-claude-md`: Missing CLAUDE.md (CLAUDE.md)
5. **medium** `artifact-quality.READMEmd.missing-architecture-or-repo-map`: README.md exists, but does not include architecture or repo map (README.md)

### Top Resolved Findings

1. **info** `api.openapi-detected`: OpenAPI file detected (openapi.yaml)

### Recommended Actions

1. Fix new high-severity agent-readiness findings before merging.
2. Compare the changed files with the baseline report and recover lost context.
3. Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
4. Add a package.json "test" script or document the equivalent command clearly.
5. Add scripts for test, lint, typecheck, build, and local development.

### Reports

- validation/reports/comparison-regressed.json
- validation/reports/comparison-regressed.md
