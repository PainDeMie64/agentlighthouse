# Package Content Audit

Generated: 2026-05-20T22:46:15.751Z

This audit checks the local packed tarballs for the packages intended for public alpha publication.
It inspects the packed package.json metadata, not only the source package.json.

| Package                 | Status | Tarball                                                         |
| ----------------------- | ------ | --------------------------------------------------------------- |
| `@agentlighthouse/core` | passed | `.tmp/release-artifacts/agentlighthouse-core-0.1.0-alpha.1.tgz` |
| `@agentlighthouse/cli`  | passed | `.tmp/release-artifacts/agentlighthouse-cli-0.1.0-alpha.1.tgz`  |

## Included Files Verified

### `@agentlighthouse/core`

- `package/package.json`
- `package/README.md`
- `package/LICENSE`
- `package/dist/index.js`
- `package/dist/index.d.ts`

### `@agentlighthouse/cli`

- `package/package.json`
- `package/README.md`
- `package/LICENSE`
- `package/dist/index.js`
- `package/dist/index.d.ts`

## Excluded Junk Checked

### `@agentlighthouse/core`

- `package/src/`
- `package/validation/`
- `package/examples/`
- `package/.tmp/`
- `package/.env`
- `.test.ts`
- `.test.js`
- `.tgz`

### `@agentlighthouse/cli`

- `package/src/`
- `package/validation/`
- `package/examples/`
- `package/.tmp/`
- `package/.env`
- `.test.ts`
- `.test.js`
- `.tgz`

## Notes

### `@agentlighthouse/core`

- The package files field keeps source, tests, examples, validation reports, temp files, and tarballs out of the publish artifact.
- No executable binary is expected for this package.
- Packed package metadata was checked for workspace: dependency protocol leaks.

### `@agentlighthouse/cli`

- The package files field keeps source, tests, examples, validation reports, temp files, and tarballs out of the publish artifact.
- The CLI binary target is package/dist/index.js and is included.
- Packed package metadata was checked for workspace: dependency protocol leaks.

## Result

Passed. No release tarballs or temp artifacts should be committed.
