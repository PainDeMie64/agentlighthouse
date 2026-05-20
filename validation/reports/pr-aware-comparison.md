# AgentLighthouse Comparison Report

Verdict: **Regressed**

AgentLighthouse compares **agent-readiness**, not general software quality. A score regression means agents have less usable context, weaker verifiability, or new semantic risk under the selected profile.

## Delta Summary

| Metric           | Baseline | Current | Delta |
| ---------------- | -------: | ------: | ----: |
| Score            |       85 |       0 |   -85 |
| Confidence score |       66 |      58 |    -8 |
| Coverage         |      67% |     93% |  +26% |
| Findings         |        3 |      22 |   +19 |

## PR Impact Summary

5 changed file(s) analyzed; 16 new finding(s) on changed files, 1 new global finding(s), 0 unknown-location finding(s).

| Bucket                             | Count |
| ---------------------------------- | ----: |
| Changed files                      |     5 |
| New findings on changed files      |    16 |
| Resolved findings on changed files |     0 |
| New global findings                |     1 |
| Unknown-location findings          |     0 |
| Unrelated existing findings        |     0 |

## Changed Files

- modified: README.md
- modified: package.json
- added: AGENTS.md
- added: llms.txt
- added: agentlighthouse.tasks.yaml

## New Findings On Changed Files

1. **high** `agent-instructions.missing-agents-md`: Missing AGENTS.md (AGENTS.md, AGENTS.md)
2. **high** `setup.missing-test-script`: No test script in package.json (package.json:1, package.json)
3. **high** `setup.package-json-no-scripts`: package.json has no scripts (package.json:1, package.json)
4. **medium** `artifact-quality.READMEmd.missing-architecture-or-repo-map`: README.md exists, but does not include architecture or repo map (README.md:1, README.md)
5. **medium** `artifact-quality.READMEmd.missing-clear-test-command`: README.md exists, but does not include clear test command (README.md:1, README.md)
6. **medium** `docs.readme-no-examples`: README.md has no examples (README.md:1, README.md)
7. **medium** `docs.readme-no-install`: README.md has no installation instructions (README.md:1, README.md)
8. **medium** `docs.readme-no-quickstart`: README.md has no quickstart section (README.md:1, README.md)
9. **medium** `llms.missing`: Missing llms.txt (llms.txt, llms.txt)
10. **medium** `security.agent-secret-guidance-missing`: Instructions do not tell agents how to handle secrets (AGENTS.md, AGENTS.md)
11. **medium** `setup.missing-lint-script`: No lint script in package.json (package.json:1, package.json)
12. **medium** `setup.missing-typecheck-script`: No typecheck script in package.json (package.json:1, package.json)
13. **medium** `TASK_BENCHMARK_MISSING`: Missing agent task benchmark file (agentlighthouse.tasks.yaml, agentlighthouse.tasks.yaml)
14. **low** `artifact-quality.readme-commands-not-grounded-in-scripts`: README commands are not clearly grounded in package.json scripts (README.md:1, README.md)
15. **low** `artifact-quality.readme-missing-verification-step`: README has installation guidance but no verification step (README.md:1, README.md)
16. **low** `freshness.deprecated-or-todo-terms`: Docs contain TODO/deprecated-looking terms without migration guidance (README.md:1, README.md:3: Coming soon.)

## Resolved Findings On Changed Files

None.

## New Global Findings

1. **info** `api.openapi-not-detected`: OpenAPI file not detected (No openapi._ or swagger._ file was scanned., No openapi._ or swagger._ file was scanned.)

## Unknown-Location Findings

None.

## Unrelated Existing Findings Summary

0 unchanged finding(s) are outside the changed-file set.

## Gate Status

No comparison gate status was provided.

## Severity Count Deltas

| Severity | Delta |
| -------- | ----: |
| critical |     0 |
| high     |    +3 |
| medium   |   +13 |
| low      |    +3 |
| info     |     0 |

## New Findings

1. **high** `agent-instructions.missing-agents-md`: Missing AGENTS.md (AGENTS.md, AGENTS.md)
2. **high** `setup.missing-test-script`: No test script in package.json (package.json:1, package.json)
3. **high** `setup.package-json-no-scripts`: package.json has no scripts (package.json:1, package.json)
4. **medium** `agent-instructions.missing-claude-md`: Missing CLAUDE.md (CLAUDE.md, CLAUDE.md)
5. **medium** `artifact-quality.READMEmd.missing-architecture-or-repo-map`: README.md exists, but does not include architecture or repo map (README.md:1, README.md)
6. **medium** `artifact-quality.READMEmd.missing-clear-test-command`: README.md exists, but does not include clear test command (README.md:1, README.md)
7. **medium** `docs.no-markdown`: Docs exist but no Markdown files are discoverable (docs/, docs/)
8. **medium** `docs.readme-no-examples`: README.md has no examples (README.md:1, README.md)
9. **medium** `docs.readme-no-install`: README.md has no installation instructions (README.md:1, README.md)
10. **medium** `docs.readme-no-quickstart`: README.md has no quickstart section (README.md:1, README.md)
11. **medium** `llms.missing`: Missing llms.txt (llms.txt, llms.txt)
12. **medium** `security.agent-secret-guidance-missing`: Instructions do not tell agents how to handle secrets (AGENTS.md, AGENTS.md)
13. **medium** `security.missing-agentlighthouseignore`: Missing .agentlighthouseignore (.agentlighthouseignore, .agentlighthouseignore)
14. **medium** `setup.missing-lint-script`: No lint script in package.json (package.json:1, package.json)
15. **medium** `setup.missing-typecheck-script`: No typecheck script in package.json (package.json:1, package.json)
16. **medium** `TASK_BENCHMARK_MISSING`: Missing agent task benchmark file (agentlighthouse.tasks.yaml, agentlighthouse.tasks.yaml)
17. **low** `artifact-quality.readme-commands-not-grounded-in-scripts`: README commands are not clearly grounded in package.json scripts (README.md:1, README.md)
18. **low** `artifact-quality.readme-missing-verification-step`: README has installation guidance but no verification step (README.md:1, README.md)
19. **low** `freshness.deprecated-or-todo-terms`: Docs contain TODO/deprecated-looking terms without migration guidance (README.md:1, README.md:3: Coming soon.)
20. **info** `api.openapi-not-detected`: OpenAPI file not detected (No openapi._ or swagger._ file was scanned., No openapi._ or swagger._ file was scanned.)

## Resolved Findings

1. **info** `api.openapi-detected`: OpenAPI file detected (openapi.yaml:1, openapi.yaml)

## Worsened Findings

None.

## Improved Findings

None.

## Unchanged

2 finding(s) remained unchanged.

## Recommended Actions

1. Fix new high-severity agent-readiness findings before merging.
2. Compare the changed files with the baseline report and recover lost context.
3. Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
4. Add a package.json "test" script or document the equivalent command clearly.
5. Add scripts for test, lint, typecheck, build, and local development.

## Caveats

- Different profiles: baseline api, current library.
- Coverage changed substantially; score deltas may reflect changed analyzability.
- One or both scans have low confidence.

## Metadata

- Baseline scan: `scan_7793b496` (2026-05-20T20:44:21.033Z)
- Current scan: `scan_1eeadae9` (2026-05-20T20:44:21.061Z)
- Baseline profile: `api`
- Current profile: `library`
- Comparison model: `0.1.0`
