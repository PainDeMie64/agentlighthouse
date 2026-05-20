# AgentLighthouse Report: sample-widget-api

Score: **33/100**

Agent-readiness needs focused work before agents can reliably use this project.

## Subscores

- Agent Instructions: 80/100
- Documentation: 95/100
- API & Tooling: 75/100
- Examples & Tasks: 95/100
- Security & Privacy: 90/100
- Freshness & Consistency: 98/100

## Recommended Actions

1. Run: agentlighthouse init .
2. Add or document setup, test, lint, and typecheck commands.
3. Improve README and docs so agents can find quickstart, install, and examples.
4. Add task benchmarks for the top developer workflows agents should complete.
5. Document secret-handling and privacy rules for agent workflows.

## Findings

### Missing AGENTS.md

- Severity: high
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
- Evidence: AGENTS.md was not found at the repository root.

### Missing CLAUDE.md

- Severity: medium
- Category: agent_instructions
- Affected file: CLAUDE.md
- Recommendation: Add CLAUDE.md with concise workflow, boundaries, and testing expectations.
- Evidence: CLAUDE.md was not found at the repository root.

### Missing llms.txt

- Severity: medium
- Category: agent_instructions
- Affected file: llms.txt
- Recommendation: Create llms.txt with links to README, docs, architecture, examples, and API references.
- Evidence: llms.txt was not found at the repository root.

### README.md has no examples

- Severity: medium
- Category: documentation
- Affected file: README.md
- Recommendation: Add concrete examples showing expected usage and output.
- Evidence: README.md does not contain any of: example, usage, demo.

### No test script in package.json

- Severity: high
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "test" script or document the equivalent command clearly.
- Evidence: package.json scripts does not include "test".

### No lint script in package.json

- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "lint" script or document the equivalent command clearly.
- Evidence: package.json scripts does not include "lint".

### No typecheck script in package.json

- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "typecheck" script or document the equivalent command clearly.
- Evidence: package.json scripts does not include "typecheck".

### OpenAPI file detected

- Severity: info
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Keep API descriptions, examples, and auth details current.
- Evidence: openapi.yaml

### OpenAPI exists but no examples are nearby

- Severity: medium
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Add examples near the API spec or link examples from the API documentation.
- Evidence: OpenAPI files: openapi.yaml

### MCP readiness could not be evaluated yet

- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Evidence: No file or package name matching MCP was scanned.

### Missing agent task benchmark file

- Severity: medium
- Category: task_benchmarks
- Affected file: benchmarks/agent-tasks.yaml
- Recommendation: Add a benchmark file with tasks such as install, run tests, add a small feature, and find core modules.
- Evidence: No benchmarks/agent-tasks.yaml or .agentlighthouse/tasks.yaml file was found.

### Missing .agentlighthouseignore

- Severity: medium
- Category: security_and_privacy
- Affected file: .agentlighthouseignore
- Recommendation: Add .agentlighthouseignore with node_modules, build outputs, env files, secrets, and vendor paths.
- Evidence: .agentlighthouseignore was not found at the repository root.

### Instructions do not tell agents how to handle secrets

- Severity: medium
- Category: security_and_privacy
- Affected file: AGENTS.md
- Recommendation: Add a security section explaining secret handling and external LLM constraints.
- Evidence: No secret/privacy guidance was detected in AGENTS.md.

### Docs contain TODO/deprecated-looking terms without migration guidance

- Severity: low
- Category: freshness_and_consistency
- Affected file: n/a
- Recommendation: Resolve TODOs or add explicit migration/replacement guidance.
- Evidence: README.md:14: TODO: add more complete docs soon.; docs/overview.md:5: The legacy v1 endpoint is deprecated.
