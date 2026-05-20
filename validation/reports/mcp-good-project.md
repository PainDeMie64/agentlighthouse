# AgentLighthouse Report: mcp-good-project

AgentLighthouse measures **agent-readiness**, not general software quality. A mature human-friendly project can score lower when it lacks agent-specific context, verifiable workflows, or machine-readable API/tool guidance.

Score: **95/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (82/100)

Coverage: **78%**

## Project Detection

- Type: `mcp_project`
- Profile: `mcp`
- Confidence: 90%
- Package manager: `npm`
- Frameworks: none detected
- Evidence: MCP file or package signal detected.

## Score Interpretation

- Agent-Readiness Score: 95/100
- Human-readable project signals: 80/100 - README present, 1 Markdown doc file(s), package metadata present, MCP files or dependencies present
- Agent-specific context layer: 68/100 - AGENTS.md present, CLAUDE.md present, llms.txt present, agent task benchmark present
- Verifiability: 60/100 - test script declared, lint script declared, typecheck script declared, command probes not run

## CI Interpretation

- This score should be used as an agent-readiness gate, not as a judgment of overall engineering quality.
- Low scores usually mean agents need more context files, clearer examples, verifiable commands, or safer API/MCP descriptions.
- Command execution probes are opt-in; static analysis remains the default.

## Subscores

- Agent Instructions: 98/100
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

- Detected: yes
- Files: package.json, src/mcp-server.example.txt
- Tools: 2
- Tools with schemas: 2
- Tools with examples: 2
- Ambiguous tools: none
- Destructive tools: src/mcp-server.example.txt: revoke_sandbox_token
- Weak tools: src/mcp-server.example.txt: search_public_docs; src/mcp-server.example.txt: revoke_sandbox_token

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
- Not evaluated checks: 2
- Evaluated categories: agent_instructions, documentation, mcp_tools, setup_and_tests, security_and_privacy, task_benchmarks
- Missing categories: examples, freshness_and_consistency

## Scoring Caps

- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **low**: CLAUDE.md appears stale or too vague (CLAUDE.md)

## Recommended Actions

1. Use opt-in command probes in trusted environments to verify setup and tests.

## Detected Artifacts

| Path                            | Exists | Kind    | Quality | Role                              |
| ------------------------------- | ------ | ------- | ------- | --------------------------------- |
| AGENTS.md                       | yes    | file    | strong  | Primary coding-agent instructions |
| CLAUDE.md                       | yes    | file    | partial | Claude Code project memory        |
| llms.txt                        | yes    | file    | partial | LLM-readable project map          |
| README.md                       | yes    | file    | partial | Human and agent entry point       |
| .cursor/rules                   | no     | missing | missing | Cursor rules                      |
| .github/copilot-instructions.md | no     | missing | missing | GitHub Copilot instructions       |
| .agentlighthouseignore          | yes    | file    | unknown | AgentLighthouse ignore rules      |

## Scan Metadata

- Scan ID: `scan_850c5cd3`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T21:08:14.401Z
- Completed: 2026-05-20T21:08:14.404Z
- Duration: 3ms
- Files scanned: 9
- Text files read: 8
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

### Low

#### CLAUDE.md appears stale or too vague

- Rule ID: `agent-instructions.claude-vague`
- Severity: low
- Category: agent_instructions
- Affected file: CLAUDE.md
- Recommendation: Refresh CLAUDE.md with current setup commands, product boundaries, and test expectations.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: CLAUDE.md length is 273 characters.

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

#### MCP-related files or packages detected

- Rule ID: `mcp.detected`
- Severity: info
- Category: mcp_tools
- Affected file: src/mcp-server.example.txt
- Recommendation: Ensure each MCP tool has a clear name, description, input schema, and safety guidance.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: src/mcp-server.example.txt

#### Command verification probes were skipped

- Rule ID: `COMMAND_VERIFICATION_SKIPPED`
- Severity: info
- Category: setup_and_tests
- Affected file: n/a
- Recommendation: Use command probes in trusted local or CI environments when you want executable verification.
- Agent failure mode: Without command probes, AgentLighthouse can tell agents what commands appear to exist, but not whether they currently pass.
- Fix example: agentlighthouse scan . --probe commands
- Evidence: Run with --probe commands or --run-probes to execute safe script probes.
