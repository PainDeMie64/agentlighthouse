# AgentLighthouse Report: sample-good-project

AgentLighthouse measures **agent-readiness**, not general software quality. A mature human-friendly project can score lower when it lacks agent-specific context, verifiable workflows, or machine-readable API/tool guidance.

Score: **85/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (66/100)

Coverage: **67%**

## Project Detection

- Type: `openapi_project`
- Profile: `api`
- Confidence: 85%
- Package manager: `pnpm`
- Frameworks: Express, TypeScript, Vitest
- Evidence: OpenAPI files detected: openapi.yaml.

## Score Interpretation

- Agent-Readiness Score: 85/100
- Human-readable project signals: 83/100 - README present, 1 Markdown doc file(s), package metadata present, OpenAPI spec present
- Agent-specific context layer: 100/100 - AGENTS.md present, CLAUDE.md present, llms.txt present, Cursor rules present, Copilot instructions present, agent task benchmark present
- Verifiability: 80/100 - test script declared, lint script declared, typecheck script declared, 1 API operation(s) have examples, command probes not run

## CI Interpretation

- This score should be used as an agent-readiness gate, not as a judgment of overall engineering quality.
- Low scores usually mean agents need more context files, clearer examples, verifiable commands, or safer API/MCP descriptions.
- Command execution probes are opt-in; static analysis remains the default.

## Subscores

- Agent Instructions: 100/100
- Documentation: 100/100
- API & Tooling: 100/100
- Examples & Tasks: 100/100
- Security & Privacy: 100/100
- Freshness & Consistency: 100/100

## API Analysis

- Spec files: openapi.yaml
- Operations: 1
- Operations with examples: 1
- Operations missing descriptions: 0
- Auth schemes: bearerAuth
- Destructive operations: none
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

- Evaluated checks: 6
- Skipped checks: 0
- Not applicable checks: 2
- Not evaluated checks: 3
- Evaluated categories: agent_instructions, documentation, api_schema, setup_and_tests, security_and_privacy, task_benchmarks
- Missing categories: examples, freshness_and_consistency

## Scoring Caps

- cap.low-coverage: max 85. Less than 70% of applicable checks were evaluated.
- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

No non-informational findings.

## Recommended Actions

1. Use opt-in command probes in trusted environments to verify setup and tests.

## Detected Artifacts

| Path                            | Exists | Kind      | Quality | Role                              |
| ------------------------------- | ------ | --------- | ------- | --------------------------------- |
| AGENTS.md                       | yes    | file      | strong  | Primary coding-agent instructions |
| CLAUDE.md                       | yes    | file      | partial | Claude Code project memory        |
| llms.txt                        | yes    | file      | partial | LLM-readable project map          |
| README.md                       | yes    | file      | partial | Human and agent entry point       |
| .cursor/rules                   | yes    | directory | partial | Cursor rules                      |
| .github/copilot-instructions.md | yes    | file      | partial | GitHub Copilot instructions       |
| .agentlighthouseignore          | yes    | file      | unknown | AgentLighthouse ignore rules      |

## Scan Metadata

- Scan ID: `scan_06e2acf4`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T20:22:52.724Z
- Completed: 2026-05-20T20:22:52.730Z
- Duration: 6ms
- Files scanned: 14
- Text files read: 13
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

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
