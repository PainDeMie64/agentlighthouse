# Release Process

AgentLighthouse is not published to npm yet. Phase 2G rehearses the first public alpha from a clean clone without publishing packages, creating GitHub releases, or pushing tags.

## Intended Packages

Publish later:

- `@agentlighthouse/core`
- `@agentlighthouse/cli`

Do not publish during public alpha packaging prep:

- `@agentlighthouse/web` because it is a private repository-local dashboard.

## One-Command Release Check

Run this before any alpha tag or publish decision:

```bash
CI=true pnpm install
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

## Full Public Alpha Rehearsal

Run this before asking for final tag approval:

```bash
pnpm release:rehearsal
```

The rehearsal runs:

- `pnpm release:check`
- `pnpm release:dry-run`
- `pnpm release:package-audit`
- `pnpm release:readme-check`
- `pnpm release:external-trial`
- `pnpm release:fresh-clone`

It writes:

- `validation/reports/release-readiness.md`
- `validation/reports/package-content-audit.md`
- `validation/reports/readme-command-check.md`
- `validation/reports/external-trial-summary.md`
- `validation/reports/public-alpha-rehearsal.md`

No release rehearsal script publishes npm packages, creates git tags, pushes tags, or creates a
GitHub Release.

## Fresh Clone Rehearsal

```bash
pnpm release:fresh-clone
```

The fresh-clone rehearsal clones `https://github.com/PainDeMie64/agentlighthouse.git` when the
current `HEAD` matches `origin/main`. If the local checkout is ahead of `origin/main`, or the remote
clone fails, it falls back to a local clone and records that limitation in
`validation/reports/public-alpha-rehearsal.md`.

Inside the clean clone it runs the README source workflow:

1. `CI=true pnpm install`
2. `pnpm build`
3. `pnpm test`
4. `pnpm --filter @agentlighthouse/cli dev scan examples/sample-good-project`
5. `pnpm --filter @agentlighthouse/cli dev baseline create examples/sample-good-project --output baseline.json`
6. `pnpm --filter @agentlighthouse/cli dev baseline validate baseline.json`
7. `pnpm --filter @agentlighthouse/cli dev scan examples/sample-good-project --baseline baseline.json --report-dir agentlighthouse-reports`

It then packs `@agentlighthouse/core` and `@agentlighthouse/cli` from the fresh clone, installs the
packed CLI into a separate clean consumer project, and runs the installed `agentlighthouse` binary.

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

## Package Content Audit

```bash
pnpm release:package-audit
```

The audit verifies that publishable tarballs include package metadata, README, LICENSE, `dist`
JavaScript, and type declarations while excluding source, tests, examples, validation reports,
temporary files, tarballs, and `.env` files. It writes
`validation/reports/package-content-audit.md`.

## README Command Check

```bash
pnpm release:readme-check
```

This writes `validation/reports/readme-command-check.md` and confirms the README distinguishes
runnable source-checkout commands from future npm commands that will only work after publishing.

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
7. Run `pnpm release:fresh-clone`.
8. Review `validation/reports/release-readiness.md` and
   `validation/reports/public-alpha-rehearsal.md`.
9. Commit the release prep.

## Manual Tag Commands

Do not run these unless the maintainer explicitly decides to tag a release:

```bash
git tag -a v0.1.0-alpha.0 -m "AgentLighthouse v0.1.0-alpha.0"
git push origin v0.1.0-alpha.0
```

No release script creates or pushes tags.

## Manual npm Publish Commands

Do not run these during release rehearsal. They are future manual commands after release checks pass:

```bash
pnpm --dir packages/core publish --access public --no-git-checks
pnpm --dir packages/cli publish --access public --no-git-checks
```

After publishing, verify:

```bash
npm view @agentlighthouse/core version
npm view @agentlighthouse/cli version
npx @agentlighthouse/cli@alpha --help
npx @agentlighthouse/cli@alpha scan .
```

## GitHub Release Checklist

- CI is green.
- `origin/main` contains the intended release commit.
- `pnpm release:check` passes.
- `pnpm release:dry-run` passes.
- `pnpm release:fresh-clone` passes.
- `CHANGELOG.md` is updated.
- `docs/SCHEMA_STABILITY.md` reflects schema risk honestly.
- Validation reports contain no sensitive local or external repository data.
- No tarballs or `.tmp` artifacts are committed.
- Release notes mention local-first behavior and current limitations.

Creating a GitHub Release is manual and out of scope for release rehearsal.

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
