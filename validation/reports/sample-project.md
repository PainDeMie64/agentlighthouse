# AgentLighthouse Report: sample-widget-api

AgentLighthouse measures **agent-readiness**, not general software quality. A mature human-friendly project can score lower when it lacks agent-specific context, verifiable workflows, or machine-readable API/tool guidance.

Score: **0/100**

Agent-readiness needs focused work before agents can reliably use this project.

Confidence: **Medium** (65/100)

Coverage: **94%**

## Project Detection

- Type: `openapi_project`
- Profile: `api`
- Confidence: 85%
- Package manager: `npm`
- Frameworks: Express
- Evidence: OpenAPI files detected: openapi.yaml.

## Score Interpretation

- Agent-Readiness Score: 0/100
- Human-readable project signals: 83/100 - README present, 1 Markdown doc file(s), package metadata present, OpenAPI spec present
- Agent-specific context layer: 0/100 - none detected
- Verifiability: 0/100 - command probes not run

## CI Interpretation

- This score should be used as an agent-readiness gate, not as a judgment of overall engineering quality.
- Low scores usually mean agents need more context files, clearer examples, verifiable commands, or safer API/MCP descriptions.
- Command execution probes are opt-in; static analysis remains the default.

## Subscores

- Agent Instructions: 70/100
- Documentation: 91/100
- API & Tooling: 42/100
- Examples & Tasks: 95/100
- Security & Privacy: 90/100
- Freshness & Consistency: 98/100

## API Analysis

- Spec files: openapi.yaml
- Operations: 1
- Operations with examples: 0
- Operations missing descriptions: 0
- Auth schemes: none
- Destructive operations: none
- Weak operations: openapi.yaml: GET /widgets

## MCP Analysis

- Detected: no
- Files: none
- Tools: 0
- Tools with schemas: 0
- Tools with examples: 0
- Ambiguous tools: none
- Destructive tools: none
- Weak tools: none

## Command Probes

- Enabled: no
- Attempted: 0
- Passed: 0
- Failed: 0
- Timed out: 0
- Skipped: 3

## Coverage

- Evaluated checks: 31
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
5. Improve OpenAPI operation descriptions, examples, auth, and error responses.

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

- Scan ID: `scan_29c6885e`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T20:03:35.096Z
- Completed: 2026-05-20T20:03:35.107Z
- Duration: 11ms
- Files scanned: 4
- Text files read: 4
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

### High

#### Missing AGENTS.md

- Rule ID: `agent-instructions.missing-agents-md`
- Severity: high
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: AGENTS.md was not found at the repository root.

#### No test script in package.json

- Rule ID: `setup.missing-test-script`
- Severity: high
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "test" script or document the equivalent command clearly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts does not include "test".

#### OpenAPI authentication is unclear

- Rule ID: `OPENAPI_AUTH_UNCLEAR`
- Severity: high
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Document the auth scheme, required headers, scopes, and placeholder-safe example credentials.
- Agent failure mode: A coding agent may generate client code without the required Authorization header or may invent unsafe credential handling.
- Fix example: Add an HTTP bearer or API key security scheme and a request example using EXAMPLE_API_KEY.
- Evidence: openapi.yaml: components.securitySchemes is missing and auth hints were not found.

### Medium

#### Missing CLAUDE.md

- Rule ID: `agent-instructions.missing-claude-md`
- Severity: medium
- Category: agent_instructions
- Affected file: CLAUDE.md
- Recommendation: Add CLAUDE.md with concise workflow, boundaries, and testing expectations.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: CLAUDE.md was not found at the repository root.

#### README.md exists, but does not include clear test command

- Rule ID: `artifact-quality.READMEmd.missing-clear-test-command`
- Severity: medium
- Category: agent_instructions
- Affected file: README.md
- Recommendation: Add clear test command to README.md.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: test, pnpm test, npm test, pytest, cargo test, go test.

#### README.md exists, but does not include architecture or repo map

- Rule ID: `artifact-quality.READMEmd.missing-architecture-or-repo-map`
- Severity: medium
- Category: agent_instructions
- Affected file: README.md
- Recommendation: Add architecture or repo map to README.md.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: architecture, repo structure, packages/, apps/, src/.

#### Missing llms.txt

- Rule ID: `llms.missing`
- Severity: medium
- Category: agent_instructions
- Affected file: llms.txt
- Recommendation: Create llms.txt with links to README, docs, architecture, examples, and API references.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: llms.txt was not found at the repository root.

#### README.md has no examples

- Rule ID: `docs.readme-no-examples`
- Severity: medium
- Category: documentation
- Affected file: README.md
- Recommendation: Add concrete examples showing expected usage and output.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: example, usage, demo.

#### No lint script in package.json

- Rule ID: `setup.missing-lint-script`
- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "lint" script or document the equivalent command clearly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts does not include "lint".

#### No typecheck script in package.json

- Rule ID: `setup.missing-typecheck-script`
- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "typecheck" script or document the equivalent command clearly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts does not include "typecheck".

#### OpenAPI exists but no examples are nearby

- Rule ID: `api.openapi-no-nearby-examples`
- Severity: medium
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Add examples near the API spec or link examples from the API documentation.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: OpenAPI files: openapi.yaml

#### Missing .agentlighthouseignore

- Rule ID: `security.missing-agentlighthouseignore`
- Severity: medium
- Category: security_and_privacy
- Affected file: .agentlighthouseignore
- Recommendation: Add .agentlighthouseignore with node_modules, build outputs, env files, secrets, and vendor paths.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: .agentlighthouseignore was not found at the repository root.

#### Instructions do not tell agents how to handle secrets

- Rule ID: `security.agent-secret-guidance-missing`
- Severity: medium
- Category: security_and_privacy
- Affected file: AGENTS.md
- Recommendation: Add a security section explaining secret handling and external LLM constraints.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No secret/privacy guidance was detected in AGENTS.md.

#### OpenAPI spec description is too thin for agents

- Rule ID: `OPENAPI_WEAK_SPEC_DESCRIPTION`
- Severity: medium
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Add a concise overview of the API domain, common workflows, auth model, and safe usage constraints.
- Agent failure mode: A coding agent may jump straight to endpoints without understanding product nouns, authentication, or workflow ordering.
- Fix example: Describe the main resources, required authentication, common create/list/update flows, and where to find examples.
- Evidence: openapi.yaml: info.description is missing or shorter than 40 characters.

#### OpenAPI operations have weak or missing operationIds

- Rule ID: `OPENAPI_MISSING_OPERATION_ID`
- Severity: medium
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Give every operation a stable, specific operationId such as createWorkspaceInvite or listCustomerInvoices.
- Agent failure mode: A coding agent may generate confusing client methods or call the wrong endpoint when operation IDs are missing or generic.
- Fix example: Use verb+noun names that distinguish similar operations, for example revokeApiKey instead of delete.
- Evidence: openapi.yaml: GET /widgets

#### Operations lack common error responses

- Rule ID: `OPENAPI_MISSING_ERROR_RESPONSES`
- Severity: medium
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Document likely 400/401/403/404/409/429/500 responses and how callers should recover.
- Agent failure mode: A coding agent may generate happy-path-only integrations with no auth, retry, or validation recovery.
- Fix example: Add 401, 404, 409, and 429 responses with short descriptions and example error payloads.
- Evidence: openapi.yaml: GET /widgets

#### Missing agent task benchmark file

- Rule ID: `TASK_BENCHMARK_MISSING`
- Severity: medium
- Category: task_benchmarks
- Affected file: agentlighthouse.tasks.yaml
- Recommendation: Add agentlighthouse.tasks.yaml with realistic, verifiable agent workflows.
- Agent failure mode: A team cannot tell whether agents can complete common workflows because no deterministic task set exists.
- Fix example: Add tasks for installing the project, running tests, adding a small feature, and using the public API.
- Evidence: No agent task benchmark file was found.

### Low

#### README has installation guidance but no verification step

- Rule ID: `artifact-quality.readme-missing-verification-step`
- Severity: low
- Category: documentation
- Affected file: README.md
- Recommendation: Add a short verification step such as running tests, typecheck, build, or a health command.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README does not show an obvious test, build, healthcheck, or smoke-test step after installation.

#### README lacks troubleshooting guidance

- Rule ID: `artifact-quality.readme-missing-troubleshooting`
- Severity: low
- Category: documentation
- Affected file: README.md
- Recommendation: Add a short troubleshooting section with common setup and test failure fixes.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No troubleshooting, debug, FAQ, or common-issue section was detected.

#### Docs contain TODO/deprecated-looking terms without migration guidance

- Rule ID: `freshness.deprecated-or-todo-terms`
- Severity: low
- Category: freshness_and_consistency
- Affected file: n/a
- Recommendation: Resolve TODOs or add explicit migration/replacement guidance.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md:14: TODO: add more complete docs soon.; docs/overview.md:5: The legacy v1 endpoint is deprecated.

#### OpenAPI server URL is missing

- Rule ID: `OPENAPI_SERVER_URL_MISSING`
- Severity: low
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Add production and sandbox server URLs, or explain how agents should configure the base URL.
- Agent failure mode: A coding agent may invent a base URL or hardcode the wrong host.
- Fix example: Add servers: [{ url: 'https://api.example.com/v1' }].
- Evidence: openapi.yaml: servers is missing.

#### Operations lack response examples

- Rule ID: `OPENAPI_MISSING_RESPONSE_EXAMPLE`
- Severity: low
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Add response examples for successful and important error cases.
- Agent failure mode: A coding agent may write incorrect parsing code because expected response shapes are not exemplified.
- Fix example: Add 200/201 response examples with IDs, timestamps, pagination cursors, and nested objects.
- Evidence: openapi.yaml: GET /widgets

#### List operations do not explain pagination

- Rule ID: `OPENAPI_PAGINATION_UNCLEAR`
- Severity: low
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Document pagination parameters, cursors, limits, and response fields.
- Agent failure mode: A coding agent may fetch only the first page or invent unsupported pagination parameters.
- Fix example: Describe limit and cursor parameters and include a response example with next_cursor.
- Evidence: openapi.yaml: GET /widgets

#### OpenAPI rate-limit behavior is unclear

- Rule ID: `OPENAPI_RATE_LIMIT_UNCLEAR`
- Severity: low
- Category: api_schema
- Affected file: n/a
- Recommendation: Document rate limits and retry behavior for generated clients.
- Agent failure mode: A coding agent may create brittle retry loops or ignore throttling responses.
- Fix example: Add a 429 response with Retry-After guidance and an example error payload.
- Evidence: No operation mentions 429, Retry-After, or rate limits.

### Info

#### OpenAPI file detected

- Rule ID: `api.openapi-detected`
- Severity: info
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Keep API descriptions, examples, and auth details current.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: openapi.yaml

#### MCP readiness could not be evaluated yet

- Rule ID: `mcp.not-evaluated`
- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No file or package name matching MCP was scanned.

#### Command verification probes were skipped

- Rule ID: `COMMAND_VERIFICATION_SKIPPED`
- Severity: info
- Category: setup_and_tests
- Affected file: n/a
- Recommendation: Use command probes in trusted local or CI environments when you want executable verification.
- Agent failure mode: Without command probes, AgentLighthouse can tell agents what commands appear to exist, but not whether they currently pass.
- Fix example: agentlighthouse scan . --probe commands
- Evidence: Run with --probe commands or --run-probes to execute safe script probes.
