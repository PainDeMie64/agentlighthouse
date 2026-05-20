# Post-Alpha Readiness

Status: ready for public feedback.

## npm Install Verification

Verified from a clean temporary npm consumer project outside the monorepo:

```bash
npm init -y
npm install @agentlighthouse/cli@alpha
npx agentlighthouse version
npx agentlighthouse scan .
npx @agentlighthouse/cli@alpha --help
npx @agentlighthouse/cli@alpha scan <sample-good-project>
```

Result:

- `npx agentlighthouse version` resolved to `0.1.0-alpha.1`.
- `npx agentlighthouse scan .` completed successfully on a minimal npm project.
- `npx @agentlighthouse/cli@alpha scan <sample-good-project>` completed successfully.

## npm Package State

- `@agentlighthouse/core@0.1.0-alpha.1` is published.
- `@agentlighthouse/cli@0.1.0-alpha.1` is published.
- `@agentlighthouse/core` dist-tags: `alpha -> 0.1.0-alpha.1`, `latest -> 0.1.0-alpha.1`.
- `@agentlighthouse/cli` dist-tags: `alpha -> 0.1.0-alpha.1`, `latest -> 0.1.0-alpha.1`.
- `@agentlighthouse/cli@0.1.0-alpha.0` is deprecated as broken.

## GitHub Release State

- alpha.1 prerelease: https://github.com/PainDeMie64/agentlighthouse/releases/tag/v0.1.0-alpha.1
- alpha.0 prerelease: https://github.com/PainDeMie64/agentlighthouse/releases/tag/v0.1.0-alpha.0
- alpha.0 release notes warn users to use alpha.1 or later.

## Public Repo Polish

- README now starts with a 30-second `npx @agentlighthouse/cli@alpha scan .` trial path.
- README explains alpha quality, the first usable npm alpha, and the deprecated alpha.0 CLI.
- Package README sources were updated for future npm package copy.
- npm registry metadata currently reports an empty package README for the already-published
  alpha.1 packages even though the tarballs include `README.md`; fix in the next npm patch if the
  npm package pages remain empty.
- First-user issue templates were added for bugs, false positives/negatives, analyzer requests,
  and docs feedback.
- `docs/FIRST_USER_TRIAL.md` explains the recommended trial workflow.
- `docs/NEXT_ISSUES.md` captures likely next public-alpha work.

## Known Limitations

- No hosted SaaS.
- No auth or billing.
- No token-backed PR comments.
- No GitHub Checks API integration.
- No AI-agent execution.
- OpenAPI `$ref` resolution is incomplete.
- MCP static extraction is useful but incomplete.
- Some findings are file-level rather than line-precise.
- GitHub Action remains source-based and experimental.

## Recommendation

AgentLighthouse is ready for public feedback as a cautious alpha. The preferred trial command is:

```bash
npx @agentlighthouse/cli@alpha scan .
```
