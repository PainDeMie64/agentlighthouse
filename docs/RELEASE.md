# Release Process

AgentLighthouse is not published to npm yet. Phase 2F prepares the repository for a first public alpha without publishing packages, creating GitHub releases, or pushing tags.

## Intended Packages

Publish later:

- `@agentlighthouse/core`
- `@agentlighthouse/cli`

Do not publish during public alpha packaging prep:

- `@agentlighthouse/web` because it is a private repository-local dashboard.

## One-Command Release Check

Run this before any alpha tag or publish decision:

```bash
pnpm install
pnpm release:check
```

`pnpm release:check` runs:

- typecheck
- lint
- tests
- build
- format check
- real-world validation
- packed CLI install smoke test
- `git diff --check`

It does not publish packages and does not create git tags.

## Packed Install Smoke Test

```bash
pnpm release:smoke
```

The smoke test:

1. Builds packages.
2. Packs `@agentlighthouse/core`.
3. Packs `@agentlighthouse/cli`.
4. Installs those tarballs into a clean temporary project with `pnpm install --prefer-offline`.
5. Runs the installed `agentlighthouse` binary:
   - `agentlighthouse --help`
   - `agentlighthouse version`
   - `agentlighthouse scan <fixture>`
   - `agentlighthouse scan <fixture> --format json --output scan.json`
   - `agentlighthouse baseline create <fixture> --output baseline.json`
   - `agentlighthouse baseline validate baseline.json`
6. Verifies package tarballs include `dist`, package metadata, README, and license, and exclude source/tests/temp artifacts.

The package tarballs are local. External runtime dependencies are resolved through the pnpm store when available and through the registry if the store is missing a dependency tarball.

Set `AGENTLIGHTHOUSE_RELEASE_DEBUG=1` to keep the temporary smoke directory.

## npm Publish Dry-Run

```bash
pnpm release:dry-run
```

This runs `pnpm publish --dry-run --access public --no-git-checks` for the publishable packages only. It does not publish anything.

If dry-run fails, publishing is blocked until package metadata, dependency rewriting, or tarball contents are fixed.

## Manual Version Checklist

1. Update package versions in:
   - root `package.json`
   - `packages/core/package.json`
   - `packages/cli/package.json`
   - `apps/web/package.json` for workspace consistency
2. Update `packages/core/src/index.ts` and `packages/cli/src/index.ts` if the CLI-visible version changes.
3. Update `CHANGELOG.md`.
4. Regenerate validation reports with `pnpm validate:realworld`.
5. Run `pnpm release:check`.
6. Run `pnpm release:dry-run`.
7. Review `validation/reports/release-readiness.md`.
8. Commit the release prep.

## Manual Tag Commands

Do not run these unless the maintainer explicitly decides to tag a release:

```bash
git tag -a v0.1.0-alpha.0 -m "AgentLighthouse v0.1.0-alpha.0"
git push origin v0.1.0-alpha.0
```

No release script creates or pushes tags.

## Manual npm Publish Commands

Do not run these during Phase 2F. They are future manual commands after release checks pass:

```bash
pnpm --dir packages/core publish --access public --no-git-checks
pnpm --dir packages/cli publish --access public --no-git-checks
```

After publishing, verify:

```bash
npm view @agentlighthouse/core version
npm view @agentlighthouse/cli version
npx @agentlighthouse/cli --help
```

## GitHub Release Checklist

- CI is green.
- `pnpm release:check` passes.
- `pnpm release:dry-run` passes.
- `CHANGELOG.md` is updated.
- `docs/SCHEMA_STABILITY.md` reflects schema risk honestly.
- Validation reports contain no sensitive local or external repository data.
- No tarballs or `.tmp` artifacts are committed.
- Release notes mention local-first behavior and current limitations.

Creating a GitHub Release is manual and out of scope for Phase 2F.

## Rollback Notes

If a future alpha publish is bad:

1. Deprecate the affected npm version with a clear message.
2. Publish a fixed patch or next alpha.
3. Update the changelog with the issue and mitigation.
4. Avoid deleting versions unless a credential or legal issue requires it.

## Post-Release Smoke

After any future publish:

```bash
tmpdir="$(mktemp -d)"
cd "$tmpdir"
npm init -y
npm install @agentlighthouse/cli
npx agentlighthouse --help
npx agentlighthouse scan /path/to/project --report-dir agentlighthouse-reports
```

Do not use the post-release smoke as a substitute for `pnpm release:check`.
