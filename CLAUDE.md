# Claude Project Memory: AgentLighthouse

AgentLighthouse is an agent-readiness scanner, not a coding agent or model wrapper. Its job is to verify whether real agents can understand a repo, docs, API, MCP tools, and workflows.

## Preferred Workflow

- Install with `pnpm install`.
- Run `pnpm test`, `pnpm typecheck`, and `pnpm lint` after code changes.
- Run `pnpm release:check` and `pnpm release:dry-run` for packaging or release-readiness changes.
- Use `pnpm --filter @agentlighthouse/cli dev scan .` to dogfood scanner behavior.
- Keep core logic in `packages/core`; keep CLI and web thin.

## Testing Expectations

- Scanner, analyzer, scoring, and generator changes need focused unit tests.
- CLI should preserve safe behavior: `init` must not overwrite existing files unless `--force` is used.
- Validation reports must avoid secrets and third-party source code.

## Product Boundaries

- Do not build a general AI chatbot, AI IDE, model gateway, or broad governance suite.
- Do not require model-provider keys for the local MVP.
- Do not turn generated docs into the core value. Verification is the product.

## Naming Conventions

- Product name: AgentLighthouse.
- Category: agent-readiness.
- Score: AgentLighthouse Score.
- Stable finding IDs should use namespaces like `agent-instructions.*`, `docs.*`, and `setup.*`.
