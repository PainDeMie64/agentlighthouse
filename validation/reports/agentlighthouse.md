# AgentLighthouse Report: agentlighthouse

AgentLighthouse measures **agent-readiness**, not general software quality. A mature human-friendly project can score lower when it lacks agent-specific context, verifiable workflows, or machine-readable API/tool guidance.

Score: **85/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (65/100)

Coverage: **63%**

## Project Detection

- Type: `node_typescript`
- Profile: `devtool`
- Confidence: 90%
- Package manager: `pnpm`
- Frameworks: TypeScript, Vitest
- Evidence: package.json plus TypeScript config or source files detected.

## Score Interpretation

- Agent-Readiness Score: 85/100
- Human-readable project signals: 60/100 - README present, 24 Markdown doc file(s), package metadata present
- Agent-specific context layer: 68/100 - AGENTS.md present, CLAUDE.md present, llms.txt present, agent task benchmark present
- Verifiability: 60/100 - test script declared, lint script declared, typecheck script declared, command probes not run

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

- Spec files: none
- Operations: 0
- Operations with examples: 0
- Operations missing descriptions: 0
- Auth schemes: none
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

- Evaluated checks: 5
- Skipped checks: 0
- Not applicable checks: 3
- Not evaluated checks: 3
- Evaluated categories: agent_instructions, documentation, setup_and_tests, security_and_privacy, task_benchmarks
- Missing categories: examples, freshness_and_consistency

## Scoring Caps

- cap.low-coverage: max 85. Less than 70% of applicable checks were evaluated.
- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

No non-informational findings.

## Recommended Actions

1. Use opt-in command probes in trusted environments to verify setup and tests.

## Detected Artifacts

| Path                            | Exists | Kind    | Quality | Role                              |
| ------------------------------- | ------ | ------- | ------- | --------------------------------- |
| AGENTS.md                       | yes    | file    | strong  | Primary coding-agent instructions |
| CLAUDE.md                       | yes    | file    | strong  | Claude Code project memory        |
| llms.txt                        | yes    | file    | partial | LLM-readable project map          |
| README.md                       | yes    | file    | partial | Human and agent entry point       |
| .cursor/rules                   | no     | missing | missing | Cursor rules                      |
| .github/copilot-instructions.md | no     | missing | missing | GitHub Copilot instructions       |
| .agentlighthouseignore          | yes    | file    | unknown | AgentLighthouse ignore rules      |

## Scan Metadata

- Scan ID: `scan_9690debe`
- AgentLighthouse version: `0.1.0-alpha.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T21:49:19.951Z
- Completed: 2026-05-20T21:49:19.968Z
- Duration: 17ms
- Files scanned: 136
- Text files read: 130
- Ignored paths observed: 13
- Warnings: 0
- Errors: 0

## Findings

### Info

#### OpenAPI file not detected

- Rule ID: `api.openapi-not-detected`
- Severity: info
- Category: api_schema
- Affected file: n/a
- Recommendation: For API products, publish an OpenAPI spec with operation descriptions and examples.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No openapi._ or swagger._ file was scanned.

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
