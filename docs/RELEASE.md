# Release Process

AgentLighthouse is not published to npm yet. This checklist keeps the repo ready for a future public package release.

## Pre-Release Checks

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm validate:realworld
pnpm format:check
```

Also smoke the CLI:

```bash
pnpm --filter @agentlighthouse/cli dev scan . --report-dir agentlighthouse-reports
pnpm --filter @agentlighthouse/cli dev baseline create . --output agentlighthouse-baseline.json
pnpm --filter @agentlighthouse/cli dev baseline validate agentlighthouse-baseline.json
```

## Versioning

1. Update package versions in the root, `packages/core`, and `packages/cli`.
2. Update docs if CLI options or report schemas changed.
3. Regenerate validation reports.
4. Commit with a release-oriented message.
5. Tag the release after checks pass.

## Local Packing

Build first, then pack:

```bash
pnpm build
pnpm --filter @agentlighthouse/core pack
pnpm --filter @agentlighthouse/cli pack
```

Inspect the generated tarballs before publishing. The packages currently include both `src` and `dist` so local workspace development remains simple before the npm distribution is finalized.

## Future npm Publishing

Planned package names:

- `@agentlighthouse/core`
- `@agentlighthouse/cli`

Before publishing:

- Confirm package `exports` work from built `dist`.
- Confirm the CLI binary runs from a packed install.
- Add provenance if publishing from GitHub Actions.
- Decide whether to publish a convenience `agentlighthouse` package name.
- Update GitHub Action docs if the action switches from source checkout to npm install.

## GitHub Release Checklist

- Passing CI.
- Updated `CHANGELOG.md` once release notes begin.
- Updated validation reports.
- No sensitive external validation reports committed.
- Baseline file updated intentionally if scoring changed.
- Release notes call out any scoring-model or report-schema changes.
