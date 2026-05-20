# AgentLighthouse Report: agentlighthouse

Score: **98/100**

Strong agent-readiness with 0 high-priority issue(s) remaining.

## Subscores

- Agent Instructions: 100/100
- Documentation: 100/100
- API & Tooling: 100/100
- Examples & Tasks: 100/100
- Security & Privacy: 100/100
- Freshness & Consistency: 98/100

## Recommended Actions

## Findings

### OpenAPI file detected

- Severity: info
- Category: api_schema
- Affected file: examples/sample-project/openapi.yaml
- Recommendation: Keep API descriptions, examples, and auth details current.
- Evidence: examples/sample-project/openapi.yaml

### MCP readiness could not be evaluated yet

- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Evidence: No file or package name matching MCP was scanned.

### Docs contain TODO/deprecated-looking terms without migration guidance

- Severity: low
- Category: freshness_and_consistency
- Affected file: n/a
- Recommendation: Resolve TODOs or add explicit migration/replacement guidance.
- Evidence: examples/sample-project/README.md:14: TODO: add more complete docs soon.; examples/sample-project/docs/overview.md:5: The legacy v1 endpoint is deprecated.
