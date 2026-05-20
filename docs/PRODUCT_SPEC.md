# Product Spec

## MVP Requirements

- Scan a local project directory.
- Detect common agent-readiness artifacts and developer context files.
- Produce a 0-100 score with transparent severity penalties.
- Return structured findings with evidence and recommendations.
- Generate safe starter artifacts without overwriting existing files by default.
- Provide CLI commands: `scan`, `init`, and `version`.
- Provide a local dashboard with sample scan data.
- Include an intentionally imperfect sample project.
- Include tests and CI.

## Phase 2A Capabilities

- Deterministic OpenAPI semantic analysis for operation descriptions, examples, auth, error recovery, pagination, rate limits, and destructive operations.
- Static MCP tool analysis for names, descriptions, schemas, examples, privacy, auth, and side effects.
- Opt-in command probes that run only safe configured package scripts in trusted environments.
- Richer `agentlighthouse.tasks.yaml` benchmark schema.
- Findings can include agent failure modes and concrete fix examples.
- Reports distinguish human-readable project signals, agent-specific context, and verifiability.

## Future Features

- GitHub Action with score gates and PR annotations.
- Markdown, SARIF, and GitHub Checks reports.
- Docs-site crawler.
- Deeper OpenAPI operation and example validation.
- MCP server introspection and tool-description scoring.
- Agent benchmark runner with deterministic and optional LLM-backed evaluation.
- PR-ready patches for agent instruction and docs improvements.
- Hosted SaaS with project history and team dashboards.

## Non-Goals

- General AI chatbot.
- Replacement for coding agents.
- AI IDE.
- Model-provider gateway as the main product.
- Broad enterprise AI governance platform.
- Mandatory hosted service or API key for the first MVP.
