# AgentLighthouse Report: sample-widget-api

Score: **19/100**

Agent-readiness needs focused work before agents can reliably use this project.

Confidence: **Medium** (64/100)  
Coverage: **92%**

## Project Detection

- Type: `openapi_project`
- Confidence: 85%
- Package manager: `npm`
- Frameworks: Express
- Evidence: OpenAPI files detected: openapi.yaml.

## Subscores

- Agent Instructions: 70/100
- Documentation: 91/100
- API & Tooling: 75/100
- Examples & Tasks: 95/100
- Security & Privacy: 90/100
- Freshness & Consistency: 98/100

## Coverage

- Evaluated checks: 23
- Skipped checks: 0
- Not applicable checks: 2
- Not evaluated checks: 2
- Evaluated categories: agent_instructions, documentation, api_schema, setup_and_tests, security_and_privacy, task_benchmarks, freshness_and_consistency
- Missing categories: examples

## Scoring Caps

- cap.no-agent-instructions: max 80. No agent instruction artifact exists.
- cap.setup-or-tests-not-verifiable: max 85. Setup or test commands are not verifiable from project scripts.
- cap.no-task-benchmarks: max 90. No realistic agent task benchmark file was found.
- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **high**: Missing AGENTS.md (AGENTS.md)
- **medium**: Missing CLAUDE.md (CLAUDE.md)
- **medium**: README.md exists, but does not include clear test command (README.md)
- **medium**: README.md exists, but does not include architecture or repo map (README.md)
- **low**: README has installation guidance but no verification step (README.md)

## Recommended Actions

1. Run: agentlighthouse init .
2. Add or document setup, test, lint, and typecheck commands.
3. Improve README and docs so agents can find quickstart, install, and examples.
4. Add task benchmarks for the top developer workflows agents should complete.
5. Document secret-handling and privacy rules for agent workflows.

## Detected Artifacts

| Path                            | Exists | Kind    | Quality | Role                              |
| ------------------------------- | ------ | ------- | ------- | --------------------------------- |
| AGENTS.md                       | no     | missing | missing | Primary coding-agent instructions |
| CLAUDE.md                       | no     | missing | missing | Claude Code project memory        |
| llms.txt                        | no     | missing | missing | LLM-readable project map          |
| README.md                       | yes    | file    | thin    | Human and agent entry point       |
| .cursor/rules                   | no     | missing | missing | Cursor rules                      |
| .github/copilot-instructions.md | no     | missing | missing | GitHub Copilot instructions       |
| .agentlighthouseignore          | no     | missing | missing | AgentLighthouse ignore rules      |

## Scan Metadata

- Scan ID: `scan_d4c62bf4`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T19:08:58.661Z
- Completed: 2026-05-20T19:08:58.668Z
- Duration: 7ms
- Files scanned: 4
- Text files read: 4
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

### High

#### Missing AGENTS.md

- Severity: high
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
- Evidence: AGENTS.md was not found at the repository root.

#### No test script in package.json

- Severity: high
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "test" script or document the equivalent command clearly.
- Evidence: package.json scripts does not include "test".

### Medium

#### Missing CLAUDE.md

- Severity: medium
- Category: agent_instructions
- Affected file: CLAUDE.md
- Recommendation: Add CLAUDE.md with concise workflow, boundaries, and testing expectations.
- Evidence: CLAUDE.md was not found at the repository root.

#### README.md exists, but does not include clear test command

- Severity: medium
- Category: agent_instructions
- Affected file: README.md
- Recommendation: Add clear test command to README.md.
- Evidence: README.md does not contain any of: test, pnpm test, npm test, pytest, cargo test, go test.

#### README.md exists, but does not include architecture or repo map

- Severity: medium
- Category: agent_instructions
- Affected file: README.md
- Recommendation: Add architecture or repo map to README.md.
- Evidence: README.md does not contain any of: architecture, repo structure, packages/, apps/, src/.

#### Missing llms.txt

- Severity: medium
- Category: agent_instructions
- Affected file: llms.txt
- Recommendation: Create llms.txt with links to README, docs, architecture, examples, and API references.
- Evidence: llms.txt was not found at the repository root.

#### README.md has no examples

- Severity: medium
- Category: documentation
- Affected file: README.md
- Recommendation: Add concrete examples showing expected usage and output.
- Evidence: README.md does not contain any of: example, usage, demo.

#### No lint script in package.json

- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "lint" script or document the equivalent command clearly.
- Evidence: package.json scripts does not include "lint".

#### No typecheck script in package.json

- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "typecheck" script or document the equivalent command clearly.
- Evidence: package.json scripts does not include "typecheck".

#### OpenAPI exists but no examples are nearby

- Severity: medium
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Add examples near the API spec or link examples from the API documentation.
- Evidence: OpenAPI files: openapi.yaml

#### Missing agent task benchmark file

- Severity: medium
- Category: task_benchmarks
- Affected file: benchmarks/agent-tasks.yaml
- Recommendation: Add a benchmark file with tasks such as install, run tests, add a small feature, and find core modules.
- Evidence: No benchmarks/agent-tasks.yaml or .agentlighthouse/tasks.yaml file was found.

#### Missing .agentlighthouseignore

- Severity: medium
- Category: security_and_privacy
- Affected file: .agentlighthouseignore
- Recommendation: Add .agentlighthouseignore with node_modules, build outputs, env files, secrets, and vendor paths.
- Evidence: .agentlighthouseignore was not found at the repository root.

#### Instructions do not tell agents how to handle secrets

- Severity: medium
- Category: security_and_privacy
- Affected file: AGENTS.md
- Recommendation: Add a security section explaining secret handling and external LLM constraints.
- Evidence: No secret/privacy guidance was detected in AGENTS.md.

### Low

#### README has installation guidance but no verification step

- Severity: low
- Category: documentation
- Affected file: README.md
- Recommendation: Add a short verification step such as running tests, typecheck, build, or a health command.
- Evidence: README does not show an obvious test, build, healthcheck, or smoke-test step after installation.

#### README lacks troubleshooting guidance

- Severity: low
- Category: documentation
- Affected file: README.md
- Recommendation: Add a short troubleshooting section with common setup and test failure fixes.
- Evidence: No troubleshooting, debug, FAQ, or common-issue section was detected.

#### Docs contain TODO/deprecated-looking terms without migration guidance

- Severity: low
- Category: freshness_and_consistency
- Affected file: n/a
- Recommendation: Resolve TODOs or add explicit migration/replacement guidance.
- Evidence: README.md:14: TODO: add more complete docs soon.; docs/overview.md:5: The legacy v1 endpoint is deprecated.

### Info

#### OpenAPI file detected

- Severity: info
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Keep API descriptions, examples, and auth details current.
- Evidence: openapi.yaml

#### MCP readiness could not be evaluated yet

- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Evidence: No file or package name matching MCP was scanned.
