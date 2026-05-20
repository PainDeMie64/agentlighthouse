# AgentLighthouse Report: agentlighthouse

AgentLighthouse measures **agent-readiness**, not general software quality. A mature human-friendly project can score lower when it lacks agent-specific context, verifiable workflows, or machine-readable API/tool guidance.

Score: **95/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (76/100)

Coverage: **78%**

## Project Detection

- Type: `node_typescript`
- Profile: `devtool`
- Confidence: 90%
- Package manager: `pnpm`
- Frameworks: TypeScript, Vitest
- Evidence: package.json plus TypeScript config or source files detected.

## Score Interpretation

- Agent-Readiness Score: 95/100
- Human-readable project signals: 60/100 - README present, 20 Markdown doc file(s), package metadata present
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
- Freshness & Consistency: 98/100

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

- Evaluated checks: 7
- Skipped checks: 0
- Not applicable checks: 3
- Not evaluated checks: 2
- Evaluated categories: agent_instructions, documentation, setup_and_tests, security_and_privacy, task_benchmarks, freshness_and_consistency
- Missing categories: examples

## Scoring Caps

- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **low**: Docs contain TODO/deprecated-looking terms without migration guidance

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

- Scan ID: `scan_d0c5614d`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T20:44:21.281Z
- Completed: 2026-05-20T20:44:21.295Z
- Duration: 14ms
- Files scanned: 110
- Text files read: 107
- Ignored paths observed: 12
- Warnings: 0
- Errors: 0

## Findings

### Low

#### Docs contain TODO/deprecated-looking terms without migration guidance

- Rule ID: `freshness.deprecated-or-todo-terms`
- Severity: low
- Category: freshness_and_consistency
- Affected file: n/a
- Recommendation: Resolve TODOs or add explicit migration/replacement guidance.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: docs/PR_AWARE_ANALYSIS.md:69: - `related`: the finding is linked through a location key, old path, or source file.

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
