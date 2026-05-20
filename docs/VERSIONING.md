# Versioning

AgentLighthouse is preparing for `0.1.0-alpha.0`.

## Package Versions

Publishable packages:

- `@agentlighthouse/core`
- `@agentlighthouse/cli`

Private packages:

- `@agentlighthouse/web`

The web app is a repository-local dashboard and is not intended for npm publishing during public alpha.

## Version Policy

- `0.x` releases are alpha and may include breaking changes.
- Patch versions should be used for compatible fixes within an alpha line.
- Minor versions may change scanner behavior, scoring behavior, report schemas, and CLI options.
- `1.0.0` is reserved for a stable CLI/report contract and documented upgrade policy.

## Manual Release Steps

Version changes are manual for now:

1. Update root and package versions.
2. Update `CHANGELOG.md`.
3. Run `pnpm release:check`.
4. Run `pnpm release:dry-run`.
5. Commit the release prep.
6. Create and push a tag only after explicit maintainer approval.

No script in this repository creates or pushes tags automatically.
