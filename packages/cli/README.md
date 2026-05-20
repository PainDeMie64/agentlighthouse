# @agentlighthouse/cli

Command-line interface for AgentLighthouse, a local-first agent-readiness scanner.

The package provides the `agentlighthouse` binary:

```bash
agentlighthouse scan .
agentlighthouse baseline create . --output agentlighthouse-baseline.json
agentlighthouse scan . --baseline agentlighthouse-baseline.json --report-dir agentlighthouse-reports
```

The package is prepared for public alpha packaging, but npm publishing is not part of this repository change. For source development, use the root workspace commands documented in the repository README.
