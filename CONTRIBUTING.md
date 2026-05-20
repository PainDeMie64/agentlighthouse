# Contributing

Thanks for helping make projects easier for AI agents to understand.

## Development Setup

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

Use `pnpm validate:realworld` before changes that affect scanner output, scoring, reports, or sample projects.

## Product Boundaries

AgentLighthouse is an agent-readiness scanner. It is not an agent executor, chatbot, AI IDE, model gateway, hosted governance suite, or SaaS billing product.

Prefer deterministic local analysis before adding optional model-backed features.

## Pull Request Expectations

- Keep changes scoped.
- Add tests for new rules, reporters, CLI behavior, or schema changes.
- Update docs when CLI commands, report schemas, scoring, or rules change.
- Regenerate validation reports when scanner output changes.
- Do not commit `.tmp`, tarballs, private repo scans, secrets, or external repository source.

## Release Work

Release prep must pass:

```bash
pnpm release:check
pnpm release:dry-run
```

Publishing and tagging are manual maintainer decisions.
