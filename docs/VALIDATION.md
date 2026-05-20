# Validation

Real-world validation keeps AgentLighthouse from becoming a scanner that only works on hand-crafted fixtures.

## Why It Matters

The scanner should find useful, non-obvious, actionable agent-readiness issues in real repositories, documentation systems, APIs, and developer-tool projects. A rule is valuable when it gives an agent-facing improvement with clear evidence.

## Run Against This Repo

```bash
pnpm --filter @agentlighthouse/cli dev scan .
```

## Run Against the Sample Project

```bash
pnpm --filter @agentlighthouse/cli dev scan examples/sample-project
pnpm --filter @agentlighthouse/cli dev scan examples/sample-good-project
pnpm --filter @agentlighthouse/cli dev scan examples/sample-bad-project
```

## Run Against Any Local Repo

```bash
pnpm --filter @agentlighthouse/cli dev scan /path/to/repo
pnpm --filter @agentlighthouse/cli dev scan /path/to/repo --json --output validation/reports/repo.json
```

Only scan paths you are allowed to inspect. Avoid recursively scanning private directories without an explicit target path.

## Clone Public Repos for Validation

```bash
mkdir -p .tmp/validation-repos
git clone https://github.com/example/project.git .tmp/validation-repos/project
pnpm validate:realworld
```

Do not commit cloned repositories. `.tmp/` is ignored.

## Reports

Use JSON for machine analysis and Markdown for human review:

```bash
pnpm --filter @agentlighthouse/cli dev scan examples/sample-project --json --output validation/reports/sample-project.json
```

Reports should not contain secrets or sensitive local paths. Sanitize before committing if needed.

`pnpm validate:realworld` generates:

- `validation/reports/sample-project.json`
- `validation/reports/sample-project.md`
- `validation/reports/sample-good-project.json`
- `validation/reports/sample-good-project.md`
- `validation/reports/sample-bad-project.json`
- `validation/reports/sample-bad-project.md`
- `validation/reports/agentlighthouse.json`
- `validation/reports/agentlighthouse.md`

## Useful Findings

Useful findings have evidence and point to an agent-facing improvement: missing setup commands, stale docs links, absent benchmark tasks, missing secret-handling rules, unclear API examples, or inconsistent package scripts.

## Known False Positives

- Non-JavaScript projects may not need `package.json`.
- Projects without HTTP APIs may not need OpenAPI specs.
- Some docs sites generate Markdown from another source and may require a future docs connector.
- Initial validation found that README commands using `pnpm --filter` were misread as missing package scripts. The command extraction rule now ignores option flags.

## Initial Real-World Targets

The first implementation was exercised against:

- AgentLighthouse itself for dogfooding.
- `examples/sample-project` as an intentionally imperfect setup target.
- `examples/sample-good-project` as a high-readiness reference.
- `examples/sample-bad-project` as a low-readiness reference.
- `sindresorhus/is` as a small JavaScript/TypeScript library.
- `modelcontextprotocol/typescript-sdk` as a developer-tool and MCP/API-focused project.
- `expressjs/expressjs.com` as a documentation-heavy project.

External repositories were cloned into `.tmp/validation-repos/` and were not committed.

## Rule Improvements Next

- Project-type detection before applying package-specific expectations.
- Better command extraction from READMEs.
- Richer OpenAPI operation parsing.
- MCP tool schema parsing.
- Configurable severity profiles.
