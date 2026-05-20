# Public Alpha Rehearsal

Generated: 2026-05-20T21:55:58.686Z

## Summary

- Git commit tested: `4ed8d9e384acfa2ca0751aa506b86c53fc5fd959`
- Clone source: remote
- Node version: `v26.1.0`
- pnpm version: `10.33.0`
- Packed CLI install result: passed
- Final recommendation: **ready with caveats: require manual approval, do not tag or publish automatically, and keep GitHub Action source-based limitations visible.**

## Package Versions

- `agentlighthouse (private)`: `0.1.0-alpha.0`
- `@agentlighthouse/core`: `0.1.0-alpha.0`
- `@agentlighthouse/cli`: `0.1.0-alpha.0`
- `@agentlighthouse/web (private)`: `0.1.0-alpha.0`

## Checks

| Check                   | Status | Detail                                                                                                                                |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh clone             | passed | remote clone checked out 4ed8d9e384acfa2ca0751aa506b86c53fc5fd959.                                                                    |
| README source workflow  | passed | Install, build, test, scan, baseline create/validate, and scan --baseline report bundle all worked from a clean clone.                |
| Packed CLI real install | passed | Packed CLI installed into a separate clean consumer project and ran without monorepo source paths or TypeScript runtime dependencies. |

## Related Reports

- `validation/reports/release-readiness.md`
- `validation/reports/package-content-audit.md`
- `validation/reports/readme-command-check.md`
- `validation/reports/external-trial-summary.md`

## Known Blockers

- None found during rehearsal.

## Caveats

- npm packages have not been published.
- No git tag was created.
- No GitHub Release was created.
- The GitHub Action is source-based and experimental until npm distribution exists.
- Automated installs use `CI=true pnpm install` to avoid non-interactive package-manager prompts.
