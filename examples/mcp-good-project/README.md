# MCP Good Project

## Quickstart

```bash
npm test
```

## Example

The server exposes `search_public_docs` for read-only documentation search and `revoke_sandbox_token` for explicitly approved sandbox token cleanup.

## Architecture

- `src/mcp-server.example.txt` contains MCP tool definitions.
- `agentlighthouse.tasks.yaml` contains verifiable agent workflows.
- `AGENTS.md` contains agent operating instructions.

## Troubleshooting

If auth fails, use an `EXAMPLE_TOKEN` placeholder and never paste real secrets into prompts.
