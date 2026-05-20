# AgentLighthouse Report: agentlighthouse

Score: **100/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

## Project Detection

- Type: `node_typescript`
- Confidence: 90%
- Package manager: `pnpm`
- Frameworks: TypeScript, Vitest
- Evidence: package.json plus TypeScript config or source files detected.

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

- Scan ID: `scan_8c34a053`
- AgentLighthouse version: `0.1.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T18:51:31.889Z
- Completed: 2026-05-20T18:51:31.898Z
- Duration: 9ms
- Files scanned: 81
- Text files read: 77
- Ignored paths observed: 13
- Warnings: 0
- Errors: 0

## Findings

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
