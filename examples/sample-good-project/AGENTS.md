# Agent Instructions for Sample Good Project

## Project Overview

Sample Good Project is a TypeScript API service used to validate agent-readiness checks.

## Setup Commands

- Install dependencies: `pnpm install`
- Start development: `pnpm dev`
- Build: `pnpm build`

## Test, Lint, and Typecheck Commands

- Tests: `pnpm test`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`

## Architecture Map

- `src/` contains application code.
- `docs/` contains architecture and API documentation.
- `benchmarks/` contains agent task workflows.

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
