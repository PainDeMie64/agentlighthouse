# Agent Instructions

## Project Overview

This project demonstrates clear MCP tool metadata.

## Setup Commands

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

## Architecture Map

- `src/mcp-server.example.txt`: MCP tool registrations.
- `agentlighthouse.tasks.yaml`: benchmark workflows.

## Coding Conventions

Tool names must be action-resource specific and descriptions must explain when not to use the tool.

## Common Mistakes

- Do not use generic tool names like `run`.
- Do not edit generated build output.
- Do not omit privacy notes for tools that touch user data.

## Security and Privacy

Never expose secrets. Tools that access private data must state auth and privacy constraints.

## Ownership

Maintainers review any tool that writes, revokes, deletes, or accesses private data.
