# Rules

AgentLighthouse findings use stable rule IDs. These IDs are intended to remain stable for future JSON, Markdown, SARIF, GitHub Action, and dashboard consumers.

Rule IDs are emitted in JSON, Markdown, PR summaries, and SARIF. Avoid renaming rules unless the meaning changes enough to justify a documented migration.

## Agent Instructions

### `agent-instructions.missing-agents-md`

- Category: `agent_instructions`
- Default severity: `high`
- Checks: root `AGENTS.md` exists.
- Why it matters: coding agents need a canonical project operating guide.
- Fix: add setup, test, architecture, conventions, safety, generated-file, and uncertainty guidance.
- Bad: no `AGENTS.md`.
- Good: `AGENTS.md` with exact commands and ownership boundaries.

### `agent-instructions.agents-too-short`

- Category: `agent_instructions`
- Default severity: `medium`
- Checks: `AGENTS.md` has enough substance for realistic work.
- Why it matters: shallow files can game presence checks while still failing agents.
- Fix: expand with concrete commands, architecture map, conventions, and safety rules.

### `agent-instructions.missing-claude-md`

- Category: `agent_instructions`
- Default severity: `medium`
- Checks: root `CLAUDE.md` exists.
- Why it matters: Claude Code users benefit from concise project memory.
- Fix: add workflow, testing expectations, product boundaries, and naming conventions.

## Artifact Quality

### `artifact-quality.agents-missing-command-blocks`

- Category: `agent_instructions`
- Default severity: `low`
- Checks: `AGENTS.md` includes fenced command examples.
- Why it matters: agents execute fenced commands more reliably than prose.
- Fix: add shell blocks for install, lint, typecheck, test, and build.

### `artifact-quality.readme-missing-verification-step`

- Category: `documentation`
- Default severity: `low`
- Checks: README includes a post-install verification command.
- Why it matters: agents need a quick way to confirm setup succeeded.
- Fix: add `pnpm test`, `pnpm build`, `pytest`, `cargo test`, `go test`, or a healthcheck.

### `artifact-quality.readme-commands-not-grounded-in-scripts`

- Category: `documentation`
- Default severity: `medium`
- Checks: README command examples map to discoverable package scripts when a Node `package.json` is present.
- Why it matters: agents should not follow commands that look authoritative but cannot run.
- Fix: either add the referenced script to `package.json` or update README commands to match existing scripts.

### `artifact-quality.readme-missing-troubleshooting`

- Category: `documentation`
- Default severity: `low`
- Checks: devtool/API READMEs include troubleshooting or common-issue guidance.
- Why it matters: agents often need recovery paths when setup fails.
- Fix: add troubleshooting notes for common dependency, auth, test, or environment failures.

### `artifact-quality.agents-missing-ownership-notes`

- Category: `agent_instructions`
- Default severity: `low`
- Checks: devtool/API `AGENTS.md` files describe ownership, maintenance, or contribution boundaries.
- Why it matters: agents need to know which areas are stable contracts and which areas are internal implementation detail.
- Fix: add notes about package ownership, generated files, migration boundaries, and review expectations.

### `artifact-quality.llms-too-few-project-links`

- Category: `agent_instructions`
- Default severity: `low`
- Checks: `llms.txt` links to enough concrete local context.
- Why it matters: homepage-level links are weaker than direct architecture, API, and task links.
- Fix: link README, architecture docs, development docs, examples, and benchmark tasks.

### `artifact-quality.benchmarks-not-verifiable`

- Category: `task_benchmarks`
- Default severity: `medium`
- Checks: benchmark tasks include success criteria.
- Why it matters: task prompts without criteria cannot verify agent success.
- Fix: add concrete success criteria for each task.

### `artifact-quality.<artifact>.missing-<section>`

- Category: depends on the artifact and missing section.
- Default severity: `low` to `medium`
- Checks: important artifacts include concrete sections such as architecture maps, coding conventions, security guidance, examples, docs links, and workflow steps.
- Why it matters: file presence is not enough; agents need specific operational context.
- Fix: add the missing section with project-specific commands, directories, examples, and constraints.

## Documentation

### `docs.missing-readme`

- Category: `documentation`
- Default severity: `high`
- Checks: root README exists.
- Why it matters: README is the main entry point for humans and agents.
- Fix: add purpose, quickstart, install, examples, and development commands.

### `docs.readme-no-quickstart`

- Category: `documentation`
- Default severity: `medium`
- Checks: README has quickstart/getting-started guidance.
- Fix: add a short path from clone to working command.

### `docs.no-markdown`

- Category: `documentation`
- Default severity: `medium`
- Checks: docs source includes Markdown or MDX files.
- Why it matters: agents need readable source docs, not only generated sites.
- Fix: add Markdown docs or expose docs source.

## Setup And Tests

### `setup.package-json-no-scripts`

- Category: `setup_and_tests`
- Default severity: `high`
- Checks: `package.json` has scripts.
- Why it matters: agents discover workflows from package scripts.
- Fix: add `test`, `lint`, `typecheck`, `build`, and `dev` where applicable.

### `setup.missing-test-script`

- Category: `setup_and_tests`
- Default severity: `high`
- Checks: package scripts include `test`.
- Fix: add a test script or clearly document the equivalent command.

### `setup.missing-lint-script`

- Category: `setup_and_tests`
- Default severity: `medium`
- Checks: package scripts include `lint`.
- Fix: add a lint script or document the equivalent command.

### `setup.missing-typecheck-script`

- Category: `setup_and_tests`
- Default severity: `medium`
- Checks: package scripts include `typecheck`.
- Fix: add a typecheck script or document the equivalent command.

## API And MCP

### `api.openapi-not-detected`

- Category: `api_schema`
- Default severity: `info`, or `high` under API profile.
- Checks: OpenAPI or Swagger file exists.
- Why it matters: API-focused projects need machine-readable schemas.
- Fix: publish an OpenAPI schema with descriptions and examples.

### `api.openapi-no-nearby-examples`

- Category: `api_schema`
- Default severity: `medium`
- Checks: OpenAPI has nearby examples or inline examples.
- Fix: add request/response examples.

### `mcp.not-evaluated`

- Category: `mcp_tools`
- Default severity: `info`, or higher for MCP projects.
- Checks: MCP readiness could be evaluated.
- Why it matters: absence of MCP signals should reduce coverage rather than masquerade as success.
- Fix: expose MCP server/tool definitions with descriptions and schemas.

### `OPENAPI_*`

- Category: `api_schema`
- Default severity: `low` to `high`
- Checks: operation IDs, descriptions, examples, auth, server URLs, error responses, pagination, rate limits, and destructive-operation markings.
- Why it matters: agents often generate API clients from specs and need enough context to avoid invented calls or unsafe write operations.
- Fix: add specific operation IDs, useful descriptions, request/response examples, auth schemes, error responses, pagination/rate-limit guidance, and safety notes for destructive endpoints.
- Bad: `operationId: delete` with no error responses or warning.
- Good: `operationId: revokeSandboxToken` with auth, examples, 401/403/404/429 responses, and destructive-action guidance.

### `MCP_*`

- Category: `mcp_tools`
- Default severity: `low` to `high`
- Checks: tool names, descriptions, input schemas, examples, destructive behavior, auth/privacy guidance, and error behavior.
- Why it matters: MCP tools are direct agent affordances; ambiguity can cause the wrong tool call or unsafe side effects.
- Fix: use action-resource names, describe when to use and avoid each tool, add schemas and examples, and mark sensitive tools clearly.
- Bad: `server.tool("run", { description: "Runs stuff." })`
- Good: `server.tool("search_public_docs", { description, inputSchema, examples })`

### `COMMAND_*`

- Category: `setup_and_tests`
- Default severity: `info` to `high`
- Checks: opt-in command probe status, skipped scripts, failures, timeouts, and redacted output.
- Why it matters: commands may be documented but broken; agents need verifiable setup and test feedback.
- Fix: add stable scripts, keep fast verification commands, and avoid printing secrets.

### `TASK_*`

- Category: `task_benchmarks`
- Default severity: `low` to `medium`
- Checks: richer benchmark tasks in `agentlighthouse.tasks.yaml`.
- Why it matters: future agent benchmark evaluation needs concrete tasks, success criteria, docs, outputs, verification commands, risk levels, and common failure modes.
- Fix: add concrete objectives, required docs, expected outputs, verification commands, risk level, and failure modes.

## Security

### `security.missing-agentlighthouseignore`

- Category: `security_and_privacy`
- Default severity: `medium`
- Checks: `.agentlighthouseignore` exists.
- Fix: ignore build output, dependencies, secrets, env files, vendor folders, and temporary repos.

### `security.secret-looking-strings`

- Category: `security_and_privacy`
- Default severity: `critical`
- Checks: docs/examples for credential-looking strings.
- Fix: replace realistic credentials with obvious placeholders.

## Freshness

### `freshness.deprecated-or-todo-terms`

- Category: `freshness_and_consistency`
- Default severity: `low`
- Checks: Markdown for TODO/deprecated/legacy language without migration guidance.
- Fix: resolve stale notes or add explicit replacement guidance.

## SARIF Notes

Every emitted rule becomes a SARIF rule definition. Findings with an affected file become file-level annotations. Future phases may add line-precise locations and SARIF quick fixes.
