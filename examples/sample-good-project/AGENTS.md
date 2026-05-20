# Agent Instructions for Sample Good Project

## Project Overview

Sample Good Project is a TypeScript API service used to validate agent-readiness checks.

## Setup Commands

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm build
```

## Test, Lint, and Typecheck Commands

```bash
pnpm test
```

```bash
pnpm lint
```

```bash
pnpm typecheck
```

## Architecture Map

- `src/` contains application code.
- `docs/` contains architecture and API documentation.
- `agentlighthouse.tasks.yaml` contains agent task workflows.

## Coding Conventions

- Use strict TypeScript.
- Keep functions small and named for their behavior.
- Prefer deterministic logic and explicit error handling.

## Common Mistakes

- Do not edit generated `dist/`, `coverage/`, or build output.
- Avoid committing local environment files.

## Privacy and Security

- Never commit secrets, credentials, tokens, or private data.
- Use placeholders such as `EXAMPLE_API_KEY`.
- Do not send code or docs to external LLMs without user approval.

## Task Workflows

- Add a small endpoint.
- Run lint, typecheck, and tests.
- Update docs and benchmarks when behavior changes.

## Ownership

Maintainers review API contract changes, benchmark workflow changes, and any security-sensitive examples.
