# README Command Check

Generated: 2026-05-20T21:49:55.875Z

This checklist separates commands that work from source today from future npm-package commands.

| Command                                                                                           | Context                                 | Status          | Notes                                                                                                                         |
| ------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                                                                                    | Source checkout quickstart              | verified        | Verified during local and fresh-clone rehearsal. Non-interactive automation can set CI=true to avoid package-manager prompts. |
| `pnpm build`                                                                                      | Source checkout quickstart              | verified        | Verified by release:check and fresh-clone rehearsal.                                                                          |
| `pnpm --filter @agentlighthouse/cli dev scan .`                                                   | Source checkout scan                    | verified        | Verified by validation and fresh-clone rehearsal.                                                                             |
| `pnpm --filter @agentlighthouse/cli dev scan . --report-dir agentlighthouse-reports`              | Source checkout report bundle           | verified        | Verified by workflow validation and fresh-clone rehearsal.                                                                    |
| `pnpm --filter @agentlighthouse/cli dev baseline create . --output agentlighthouse-baseline.json` | Source checkout baseline lifecycle      | verified        | Verified by release smoke and fresh-clone rehearsal.                                                                          |
| `npm install -g @agentlighthouse/cli`                                                             | Future npm install path                 | future          | README explicitly states the package has not been published to npm yet.                                                       |
| `npx @agentlighthouse/cli scan .`                                                                 | Future npm install path                 | future          | README explicitly marks this as intended post-publication usage.                                                              |
| `uses: PainDeMie64/agentlighthouse@main`                                                          | Experimental source-based GitHub Action | documented-only | The README and GitHub Action docs recommend direct pnpm CLI commands until npm distribution exists.                           |

## Result

Passed. npm install and npx examples are clearly marked as future post-publication usage.
