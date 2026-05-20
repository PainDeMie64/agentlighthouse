# Alpha Release Checklist

Use this checklist before cutting `v0.1.0-alpha.0`. Do not tag, publish, or create a
GitHub Release from automation.

## Before Tagging

- `origin/main` contains the release candidate commit.
- `pnpm install` succeeds. In non-interactive automation, use `CI=true pnpm install`.
- `pnpm release:check` passes.
- `pnpm release:dry-run` passes.
- `pnpm release:smoke` passes.
- `pnpm release:fresh-clone` passes.
- `pnpm release:package-audit` passes.
- `pnpm release:readme-check` passes.
- `validation/reports/public-alpha-rehearsal.md` recommends release readiness.
- `validation/reports/package-content-audit.md` shows no unexpected package contents.
- `validation/reports/readme-command-check.md` shows npm commands are marked future until publish.
- `CHANGELOG.md` has the `0.1.0-alpha.0` entry updated.
- No `.tgz` tarballs are staged.
- No `.tmp/` artifacts are staged.
- No secrets, `.env` files, or private external reports are staged.
- `agentlighthouse-baseline.json` is current enough for the dogfood workflow.
- The source-based GitHub Action limitation is documented.
- The maintainer has manually verified npm account access and 2FA requirements.

## npm Name And Scope Readiness

Check these manually before publishing:

- `@agentlighthouse` scope exists or can be created by the maintainer.
- `@agentlighthouse/core` is available or the maintainer has publish access.
- `@agentlighthouse/cli` is available or the maintainer has publish access.
- npm login works on the release machine.
- npm 2FA requirements are understood.
- Package visibility will be public.
- The initial dist-tag should be `alpha`, not `latest`.
- The package README renders correctly on npm after publish.

## Manual Tag Commands

Do not run these automatically. Run only after explicit maintainer approval:

```bash
git tag -a v0.1.0-alpha.0 -m "AgentLighthouse v0.1.0-alpha.0"
git push origin v0.1.0-alpha.0
```

## Manual Publish Commands

Do not run these automatically. Run only after explicit maintainer approval:

```bash
pnpm --filter @agentlighthouse/core publish --access public --tag alpha
pnpm --filter @agentlighthouse/cli publish --access public --tag alpha
```

## Post-Release Verification

```bash
npm view @agentlighthouse/core version
npm view @agentlighthouse/cli version
npx @agentlighthouse/cli@alpha --help
npx @agentlighthouse/cli@alpha scan .
```

## Stop Conditions

Do not tag or publish if:

- fresh-clone rehearsal fails;
- packed CLI install fails;
- README implies npm publication before it exists;
- package tarballs contain source, tests, validation reports, temp files, tarballs, or `.env`
  files;
- validation reports contain private or sensitive external repository data;
- the GitHub Action docs imply production stability beyond the current source-based alpha.
