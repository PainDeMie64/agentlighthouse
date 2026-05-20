# Architecture

```text
SourceConnector
      |
      v
Scanner -> ProjectSignals -> Analyzer -> Findings -> ScoringModule -> ScanResult
                                                            |
                                                            v
ArtifactGenerator / Fixer / Reporter / Dashboard
```

## Package Responsibilities

- `packages/core`: schemas, extension interfaces, scanner, analyzers, scoring, generators, reporters, and sample data.
- `packages/cli`: command parsing, filesystem writes, report output, and exit codes.
- `apps/web`: dashboard presentation for scan results.
- `examples/sample-project`: intentionally imperfect validation target.
- `docs`: product, architecture, development, scoring, roadmap, and validation context.

## Extension Interfaces

- `SourceConnector`: reads a source such as local repo, docs site, GitHub repo, OpenAPI spec, MCP server, or package registry.
- `Scanner`: extracts raw signals.
- `Analyzer`: turns signals into findings.
- `ScoringModule`: turns findings and signals into scores.
- `ArtifactGenerator`: creates or updates machine-readable artifacts.
- `BenchmarkProvider`: defines realistic agent tasks.
- `Evaluator`: evaluates whether an agent or deterministic simulation can complete a task.
- `Fixer`: proposes patches.
- `Reporter`: renders CLI, JSON, Markdown, GitHub, dashboard, or SARIF reports.

## Data Flow

The local filesystem scanner walks a target directory, respecting common ignored paths and `.agentlighthouseignore`. It extracts text signals, artifact presence, package scripts, docs files, OpenAPI files, MCP signals, and benchmark files. The analyzer emits deterministic findings. The scoring model subtracts severity weights and computes subscores. Reporters and generators consume the same result shape.
