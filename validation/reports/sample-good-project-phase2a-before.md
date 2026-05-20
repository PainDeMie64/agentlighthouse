# AgentLighthouse Report: sample-good-project

Score: **95/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

Confidence: **Medium** (72/100)  
Coverage: **73%**

## Project Detection

- Type: `openapi_project`
- Confidence: 85%
- Package manager: `npm`
- Frameworks: Express, TypeScript, Vitest
- Evidence: OpenAPI files detected: openapi.yaml.

## Subscores

- Agent Instructions: 98/100
- Documentation: 98/100
- API & Tooling: 100/100
- Examples & Tasks: 100/100
- Security & Privacy: 100/100
- Freshness & Consistency: 100/100

## Coverage

- Evaluated checks: 8
- Skipped checks: 0
- Not applicable checks: 2
- Not evaluated checks: 3
- Evaluated categories: agent_instructions, documentation, api_schema, setup_and_tests, security_and_privacy, task_benchmarks
- Missing categories: examples, freshness_and_consistency

## Scoring Caps

- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **low**: AGENTS.md has too few fenced command examples (AGENTS.md)
- **low**: README lacks troubleshooting guidance (README.md)

## Recommended Actions

No prioritized actions.

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

- Scan ID: `scan_d0656e65`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T19:20:35.249Z
- Completed: 2026-05-20T19:20:35.258Z
- Duration: 9ms
- Files scanned: 13
- Text files read: 12
- Ignored paths observed: 0
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
