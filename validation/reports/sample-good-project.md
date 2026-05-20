# AgentLighthouse Report: sample-good-project

Score: **100/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

## Project Detection

- Type: `openapi_project`
- Confidence: 85%
- Package manager: `npm`
- Frameworks: Express, TypeScript, Vitest
- Evidence: OpenAPI files detected: openapi.yaml.

## Subscores

- Agent Instructions: 100/100
- Documentation: 100/100
- API & Tooling: 100/100
- Examples & Tasks: 100/100
- Security & Privacy: 100/100
- Freshness & Consistency: 100/100

## Top Findings

No non-informational findings.

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

- Scan ID: `scan_3303de69`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T18:51:31.831Z
- Completed: 2026-05-20T18:51:31.834Z
- Duration: 3ms
- Files scanned: 13
- Text files read: 12
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

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
