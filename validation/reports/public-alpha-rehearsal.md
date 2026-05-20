# Public Alpha Rehearsal

Generated: 2026-05-20T21:50:17.900Z

## Summary

- Git commit tested: `89b2494efd6450db231e28efe26e7356508d84fa`
- Clone source: remote
- Node version: `v22.22.2`
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
| Fresh clone             | passed | remote clone checked out 89b2494efd6450db231e28efe26e7356508d84fa.                                                                    |
| README source workflow  | passed | Install, build, test, scan, baseline create/validate, and scan --baseline report bundle all worked from a clean clone.                |
| Packed CLI real install | passed | Packed CLI installed into a separate clean consumer project and ran without monorepo source paths or TypeScript runtime dependencies. |
| release:check           | passed | Completed earlier in pnpm release:rehearsal before fresh-clone validation.                                                            |
| release:dry-run         | passed | Completed earlier in pnpm release:rehearsal before fresh-clone validation.                                                            |
| release:package-audit   | passed | Completed earlier in pnpm release:rehearsal before fresh-clone validation.                                                            |
| release:readme-check    | passed | Completed earlier in pnpm release:rehearsal before fresh-clone validation.                                                            |
| release:external-trial  | passed | Completed earlier in pnpm release:rehearsal before fresh-clone validation.                                                            |

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
