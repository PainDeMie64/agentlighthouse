# MCP Analysis

AgentLighthouse performs static MCP readiness analysis. It does not start or execute MCP servers in Phase 2A.

## What It Detects

- MCP SDK dependencies.
- Files and config names containing MCP signals.
- Static tool registration patterns such as `server.tool(...)` and `registerTool(...)`.

## Tool Checks

- Tool names should be specific.
- Descriptions should explain when to use the tool and when not to.
- Input schemas should be present and descriptive.
- Destructive or mutating tools should be clearly marked.
- Privacy-sensitive tools should mention auth and private-data constraints.
- Examples and error behavior should be documented.

## Why It Matters For Agents

MCP tools are direct affordances for agents. Ambiguous names or missing schemas can make an agent call the wrong tool, pass malformed arguments, or perform unsafe side effects.
