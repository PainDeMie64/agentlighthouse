# AgentLighthouse Report: openapi-good-project

Score: **95/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (71/100)

Coverage: **70%**

## Project Detection

- Type: `openapi_project`
- Confidence: 85%
- Package manager: `npm`
- Frameworks: none detected
- Evidence: OpenAPI files detected: openapi.yaml.

## Score Interpretation

- Agent-Readiness Score: 95/100
- Human-readable project signals: 89/100 - README present, 1 Markdown doc file(s), package metadata present, OpenAPI spec present
- Agent-specific context layer: 68/100 - AGENTS.md present, CLAUDE.md present, llms.txt present, agent task benchmark present
- Verifiability: 80/100 - test script declared, lint script declared, typecheck script declared, 3 API operation(s) have examples, command probes not run

## Subscores

- Agent Instructions: 95/100
- Documentation: 100/100
- API & Tooling: 100/100
- Examples & Tasks: 100/100
- Security & Privacy: 100/100
- Freshness & Consistency: 100/100

## API Analysis

- Spec files: openapi.yaml
- Operations: 3
- Operations with examples: 3
- Operations missing descriptions: 0
- Auth schemes: bearerAuth
- Destructive operations: openapi.yaml: DELETE /customers/{customer_id} (deleteCustomer)
- Weak operations: none

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

- Evaluated checks: 7
- Skipped checks: 0
- Not applicable checks: 2
- Not evaluated checks: 3
- Evaluated categories: agent_instructions, documentation, api_schema, setup_and_tests, security_and_privacy, task_benchmarks
- Missing categories: examples, freshness_and_consistency

## Scoring Caps

- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **medium**: AGENTS.md is too short (AGENTS.md)

## Recommended Actions

1. Use opt-in command probes in trusted environments to verify setup and tests.

## Detected Artifacts

| Path                            | Exists | Kind    | Quality | Role                              |
| ------------------------------- | ------ | ------- | ------- | --------------------------------- |
| AGENTS.md                       | yes    | file    | strong  | Primary coding-agent instructions |
| CLAUDE.md                       | yes    | file    | partial | Claude Code project memory        |
| llms.txt                        | yes    | file    | thin    | LLM-readable project map          |
| README.md                       | yes    | file    | partial | Human and agent entry point       |
| .cursor/rules                   | no     | missing | missing | Cursor rules                      |
| .github/copilot-instructions.md | no     | missing | missing | GitHub Copilot instructions       |
| .agentlighthouseignore          | yes    | file    | unknown | AgentLighthouse ignore rules      |

## Scan Metadata

- Scan ID: `scan_83f4351e`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T19:47:28.296Z
- Completed: 2026-05-20T19:47:28.301Z
- Duration: 5ms
- Files scanned: 9
- Text files read: 8
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

### Medium

#### AGENTS.md is too short

- Severity: medium
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Expand AGENTS.md with commands, architecture boundaries, coding conventions, and safety guidance.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: AGENTS.md length is 711 characters.

### Info

#### OpenAPI file detected

- Severity: info
- Category: api_schema
- Affected file: openapi.yaml
- Recommendation: Keep API descriptions, examples, and auth details current.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: openapi.yaml

#### MCP readiness could not be evaluated yet

- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No file or package name matching MCP was scanned.

#### Command verification probes were skipped

- Severity: info
- Category: setup_and_tests
- Affected file: n/a
- Recommendation: Use command probes in trusted local or CI environments when you want executable verification.
- Agent failure mode: Without command probes, AgentLighthouse can tell agents what commands appear to exist, but not whether they currently pass.
- Fix example: agentlighthouse scan . --probe commands
- Evidence: Run with --probe commands or --run-probes to execute safe script probes.
