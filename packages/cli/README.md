# @agentlighthouse/cli

Command-line interface for AgentLighthouse, a local-first agent-readiness scanner.

AgentLighthouse measures whether a repo, docs, API, MCP server, and agent-facing context are
readable and verifiable by AI coding agents. It does not execute agents or require LLM API keys.

Public alpha install:

```bash
npx @agentlighthouse/cli@alpha scan .
npm install -g @agentlighthouse/cli@alpha
agentlighthouse scan .
```

The package provides the `agentlighthouse` binary:

```bash
agentlighthouse scan .
agentlighthouse baseline create . --output agentlighthouse-baseline.json
agentlighthouse scan . --baseline agentlighthouse-baseline.json --report-dir agentlighthouse-reports
```

`0.1.0-alpha.1` is the first usable npm alpha. `@agentlighthouse/cli@0.1.0-alpha.0`
was deprecated because its published package metadata contained a workspace dependency.

This package is alpha-quality. Prefer explicit `@alpha` installs until a stable release exists.
For source development, use the root workspace commands documented in the repository README.
