# AgentLighthouse Report: agentlighthouse

Score: **94/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (74/100)  
Coverage: **73%**

## Project Detection

- Type: `node_typescript`
- Confidence: 90%
- Package manager: `pnpm`
- Frameworks: TypeScript, Vitest
- Evidence: package.json plus TypeScript config or source files detected.

## Subscores

- Agent Instructions: 96/100
- Documentation: 98/100
- API & Tooling: 100/100
- Examples & Tasks: 100/100
- Security & Privacy: 100/100
- Freshness & Consistency: 100/100

## Coverage

- Evaluated checks: 8
- Skipped checks: 0
- Not applicable checks: 3
- Not evaluated checks: 3
- Evaluated categories: agent_instructions, documentation, setup_and_tests, security_and_privacy, task_benchmarks
- Missing categories: examples, freshness_and_consistency

## Scoring Caps

- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **low**: AGENTS.md has too few fenced command examples (AGENTS.md)
- **low**: README lacks troubleshooting guidance (README.md)
- **low**: AGENTS.md lacks ownership or maintenance notes (AGENTS.md)

## Recommended Actions

No prioritized actions.

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

- Scan ID: `scan_52146573`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T19:08:58.829Z
- Completed: 2026-05-20T19:08:58.841Z
- Duration: 12ms
- Files scanned: 87
- Text files read: 83
- Ignored paths observed: 13
- Warnings: 0
- Errors: 0

## Findings

### Low

#### AGENTS.md has too few fenced command examples

- Severity: low
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Add fenced command examples for install, test, lint/typecheck, and build workflows.
- Evidence: Detected 0 fenced shell command block(s).

#### README lacks troubleshooting guidance

- Severity: low
- Category: documentation
- Affected file: README.md
- Recommendation: Add a short troubleshooting section with common setup and test failure fixes.
- Evidence: No troubleshooting, debug, FAQ, or common-issue section was detected.

#### AGENTS.md lacks ownership or maintenance notes

- Severity: low
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Add maintenance and ownership notes for sensitive modules or review expectations.
- Evidence: No ownership, maintainer, review, approval, or responsibility language was detected.

### Info

#### OpenAPI file not detected

- Severity: info
- Category: api_schema
- Affected file: n/a
- Recommendation: For API products, publish an OpenAPI spec with operation descriptions and examples.
- Evidence: No openapi._ or swagger._ file was scanned.

#### MCP readiness could not be evaluated yet

- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Evidence: No file or package name matching MCP was scanned.
