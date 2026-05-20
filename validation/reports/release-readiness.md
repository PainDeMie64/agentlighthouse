# Release Readiness

Generated: 2026-05-20T21:29:46.614Z

## Package Versions

- `agentlighthouse (private)`: `0.1.0-alpha.0`
- `@agentlighthouse/core`: `0.1.0-alpha.0`
- `@agentlighthouse/cli`: `0.1.0-alpha.0`
- `@agentlighthouse/web (private)`: `0.1.0-alpha.0`

## Tarballs Tested

- `.tmp/release-artifacts/agentlighthouse-core-0.1.0-alpha.0.tgz`
- `.tmp/release-artifacts/agentlighthouse-cli-0.1.0-alpha.0.tgz`

## Checks

- PASSED: Typecheck - pnpm typecheck
- PASSED: Lint - pnpm lint
- PASSED: Tests - pnpm test
- PASSED: Build - pnpm build
- PASSED: Format check - pnpm format:check
- PASSED: Real-world validation - pnpm validate:realworld
- PASSED: Packed install smoke - pnpm release:smoke
- PASSED: npm publish dry-run - pnpm release:dry-run
- PASSED: Git whitespace check - git diff --check

## Known Packaging Limitations

- npm publish dry-run was performed only as a dry-run. No package was published.
- The GitHub Action is source-based for public alpha and will become faster after npm distribution.
- No git tag or npm package is created by release:check.
