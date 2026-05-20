# Development

## Setup

```bash
pnpm install
```

## Commands

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm dev
pnpm validate:realworld
pnpm format:check
```

## CLI Development

```bash
pnpm --filter @agentlighthouse/cli dev scan examples/sample-project
pnpm --filter @agentlighthouse/cli dev scan . --json
pnpm --filter @agentlighthouse/cli dev scan . --format sarif --output agentlighthouse.sarif
pnpm --filter @agentlighthouse/cli dev scan . --format pr-summary --github-step-summary
pnpm --filter @agentlighthouse/cli dev init . --dry-run
```

## Coding Standards

- Keep strict TypeScript enabled.
- Keep CLI and UI thin.
- Add tests for core scanner, analyzer, scoring, and generator behavior.
- Prefer deterministic checks with clear evidence.
- Avoid new dependencies unless they simplify real product complexity.
- Keep reporters thin: they render `ScanResult` and should not duplicate scanner or scoring logic.
