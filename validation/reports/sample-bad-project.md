# AgentLighthouse Report: sample-bad-project

AgentLighthouse measures **agent-readiness**, not general software quality. A mature human-friendly project can score lower when it lacks agent-specific context, verifiable workflows, or machine-readable API/tool guidance.

Score: **0/100**

Agent-readiness needs focused work before agents can reliably use this project.

Confidence: **Low** (58/100)

Coverage: **93%**

## Project Detection

- Type: `node_javascript`
- Profile: `library`
- Confidence: 80%
- Package manager: `npm`
- Frameworks: none detected
- Evidence: package.json detected.

## Score Interpretation

- Agent-Readiness Score: 0/100
- Human-readable project signals: 40/100 - README present, package metadata present
- Agent-specific context layer: 0/100 - none detected
- Verifiability: 0/100 - command probes not run

## CI Interpretation

- This score should be used as an agent-readiness gate, not as a judgment of overall engineering quality.
- Low scores usually mean agents need more context files, clearer examples, verifiable commands, or safer API/MCP descriptions.
- Command execution probes are opt-in; static analysis remains the default.

## Subscores

- Agent Instructions: 70/100
- Documentation: 78/100
- API & Tooling: 70/100
- Examples & Tasks: 95/100
- Security & Privacy: 90/100
- Freshness & Consistency: 96/100

## API Analysis

- Spec files: none
- Operations: 0
- Operations with examples: 0
- Operations missing descriptions: 0
- Auth schemes: none
- Destructive operations: none
- Weak operations: none

## MCP Analysis

- Detected: no
- Files: none
- Tools: 0
- Tools with schemas: 0
- Tools with examples: 0
- Ambiguous tools: none
- Destructive tools: none
- Weak tools: none

## Command Probes

- Enabled: no
- Attempted: 0
- Passed: 0
- Failed: 0
- Timed out: 0
- Skipped: 3

## Coverage

- Evaluated checks: 25
- Skipped checks: 0
- Not applicable checks: 3
- Not evaluated checks: 2
- Evaluated categories: agent_instructions, documentation, setup_and_tests, security_and_privacy, task_benchmarks, freshness_and_consistency
- Missing categories: examples

## Scoring Caps

- cap.no-agent-instructions: max 80. No agent instruction artifact exists.
- cap.setup-or-tests-not-verifiable: max 85. Setup or test commands are not verifiable from project scripts.
- cap.no-task-benchmarks: max 90. No realistic agent task benchmark file was found.
- cap.shallow-key-artifacts: max 95. One or more key agent-readiness artifacts are shallow or partial.

## Top Findings

- **high**: Missing AGENTS.md (AGENTS.md)
- **medium**: Missing CLAUDE.md (CLAUDE.md)
- **medium**: README.md exists, but does not include clear test command (README.md)
- **medium**: README.md exists, but does not include architecture or repo map (README.md)
- **low**: README has installation guidance but no verification step (README.md)

## Recommended Actions

1. Run: agentlighthouse init .
2. Add or document setup, test, lint, and typecheck commands.
3. Improve README and docs so agents can find quickstart, install, and examples.
4. Add task benchmarks for the top developer workflows agents should complete.
5. Use opt-in command probes in trusted environments to verify setup and tests.

## Detected Artifacts

| Path                            | Exists | Kind    | Quality | Role                              |
| ------------------------------- | ------ | ------- | ------- | --------------------------------- |
| AGENTS.md                       | no     | missing | missing | Primary coding-agent instructions |
| CLAUDE.md                       | no     | missing | missing | Claude Code project memory        |
| llms.txt                        | no     | missing | missing | LLM-readable project map          |
| README.md                       | yes    | file    | thin    | Human and agent entry point       |
| .cursor/rules                   | no     | missing | missing | Cursor rules                      |
| .github/copilot-instructions.md | no     | missing | missing | GitHub Copilot instructions       |
| .agentlighthouseignore          | no     | missing | missing | AgentLighthouse ignore rules      |

## Scan Metadata

- Scan ID: `scan_58483fff`
- AgentLighthouse version: `0.1.0-alpha.0`
- Scoring model: `0.1.0`
- Started: 2026-05-20T21:29:31.539Z
- Completed: 2026-05-20T21:29:31.540Z
- Duration: 1ms
- Files scanned: 3
- Text files read: 2
- Ignored paths observed: 0
- Warnings: 0
- Errors: 0

## Findings

### High

#### Missing AGENTS.md

- Rule ID: `agent-instructions.missing-agents-md`
- Severity: high
- Category: agent_instructions
- Affected file: AGENTS.md
- Recommendation: Create AGENTS.md with setup, tests, architecture, conventions, and safety rules.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: AGENTS.md was not found at the repository root.

#### package.json has no scripts

- Rule ID: `setup.package-json-no-scripts`
- Severity: high
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add scripts for test, lint, typecheck, build, and local development.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts object is empty.

#### No test script in package.json

- Rule ID: `setup.missing-test-script`
- Severity: high
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "test" script or document the equivalent command clearly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts does not include "test".

### Medium

#### Missing CLAUDE.md

- Rule ID: `agent-instructions.missing-claude-md`
- Severity: medium
- Category: agent_instructions
- Affected file: CLAUDE.md
- Recommendation: Add CLAUDE.md with concise workflow, boundaries, and testing expectations.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: CLAUDE.md was not found at the repository root.

#### README.md exists, but does not include clear test command

- Rule ID: `artifact-quality.READMEmd.missing-clear-test-command`
- Severity: medium
- Category: agent_instructions
- Affected file: README.md
- Recommendation: Add clear test command to README.md.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: test, pnpm test, npm test, pytest, cargo test, go test.

#### README.md exists, but does not include architecture or repo map

- Rule ID: `artifact-quality.READMEmd.missing-architecture-or-repo-map`
- Severity: medium
- Category: agent_instructions
- Affected file: README.md
- Recommendation: Add architecture or repo map to README.md.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: architecture, repo structure, packages/, apps/, src/.

#### Missing llms.txt

- Rule ID: `llms.missing`
- Severity: medium
- Category: agent_instructions
- Affected file: llms.txt
- Recommendation: Create llms.txt with links to README, docs, architecture, examples, and API references.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: llms.txt was not found at the repository root.

#### README.md has no quickstart section

- Rule ID: `docs.readme-no-quickstart`
- Severity: medium
- Category: documentation
- Affected file: README.md
- Recommendation: Add a quickstart that gets a new user to a working command quickly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: quickstart, quick start, getting started.

#### README.md has no installation instructions

- Rule ID: `docs.readme-no-install`
- Severity: medium
- Category: documentation
- Affected file: README.md
- Recommendation: Add installation commands and prerequisites.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: install, pnpm, npm, yarn, pip.

#### README.md has no examples

- Rule ID: `docs.readme-no-examples`
- Severity: medium
- Category: documentation
- Affected file: README.md
- Recommendation: Add concrete examples showing expected usage and output.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md does not contain any of: example, usage, demo.

#### Docs exist but no Markdown files are discoverable

- Rule ID: `docs.no-markdown`
- Severity: medium
- Category: documentation
- Affected file: docs/
- Recommendation: Add Markdown documentation or ensure docs source is not ignored.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: docs/ exists but no .md or .mdx files were scanned.

#### No lint script in package.json

- Rule ID: `setup.missing-lint-script`
- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "lint" script or document the equivalent command clearly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts does not include "lint".

#### No typecheck script in package.json

- Rule ID: `setup.missing-typecheck-script`
- Severity: medium
- Category: setup_and_tests
- Affected file: package.json
- Recommendation: Add a package.json "typecheck" script or document the equivalent command clearly.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: package.json scripts does not include "typecheck".

#### Missing .agentlighthouseignore

- Rule ID: `security.missing-agentlighthouseignore`
- Severity: medium
- Category: security_and_privacy
- Affected file: .agentlighthouseignore
- Recommendation: Add .agentlighthouseignore with node_modules, build outputs, env files, secrets, and vendor paths.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: .agentlighthouseignore was not found at the repository root.

#### Instructions do not tell agents how to handle secrets

- Rule ID: `security.agent-secret-guidance-missing`
- Severity: medium
- Category: security_and_privacy
- Affected file: AGENTS.md
- Recommendation: Add a security section explaining secret handling and external LLM constraints.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No secret/privacy guidance was detected in AGENTS.md.

#### Missing agent task benchmark file

- Rule ID: `TASK_BENCHMARK_MISSING`
- Severity: medium
- Category: task_benchmarks
- Affected file: agentlighthouse.tasks.yaml
- Recommendation: Add agentlighthouse.tasks.yaml with realistic, verifiable agent workflows.
- Agent failure mode: A team cannot tell whether agents can complete common workflows because no deterministic task set exists.
- Fix example: Add tasks for installing the project, running tests, adding a small feature, and using the public API.
- Evidence: No agent task benchmark file was found.

### Low

#### README has installation guidance but no verification step

- Rule ID: `artifact-quality.readme-missing-verification-step`
- Severity: low
- Category: documentation
- Affected file: README.md
- Recommendation: Add a short verification step such as running tests, typecheck, build, or a health command.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README does not show an obvious test, build, healthcheck, or smoke-test step after installation.

#### README commands are not clearly grounded in package.json scripts

- Rule ID: `artifact-quality.readme-commands-not-grounded-in-scripts`
- Severity: low
- Category: freshness_and_consistency
- Affected file: README.md
- Recommendation: Show package-manager commands that map directly to package.json scripts.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No fenced README command references a package.json script such as test, lint, typecheck, dev, or build.

#### Docs contain TODO/deprecated-looking terms without migration guidance

- Rule ID: `freshness.deprecated-or-todo-terms`
- Severity: low
- Category: freshness_and_consistency
- Affected file: n/a
- Recommendation: Resolve TODOs or add explicit migration/replacement guidance.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: README.md:3: Coming soon.; README.md:5: TODO old setup.

### Info

#### OpenAPI file not detected

- Rule ID: `api.openapi-not-detected`
- Severity: info
- Category: api_schema
- Affected file: n/a
- Recommendation: For API products, publish an OpenAPI spec with operation descriptions and examples.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No openapi._ or swagger._ file was scanned.

#### MCP readiness could not be evaluated yet

- Rule ID: `mcp.not-evaluated`
- Severity: info
- Category: mcp_tools
- Affected file: n/a
- Recommendation: If this project exposes MCP tools, include server files and clear tool descriptions.
- Agent failure mode: n/a
- Fix example: n/a
- Evidence: No file or package name matching MCP was scanned.

#### Command verification probes were skipped

- Rule ID: `COMMAND_VERIFICATION_SKIPPED`
- Severity: info
- Category: setup_and_tests
- Affected file: n/a
- Recommendation: Use command probes in trusted local or CI environments when you want executable verification.
- Agent failure mode: Without command probes, AgentLighthouse can tell agents what commands appear to exist, but not whether they currently pass.
- Fix example: agentlighthouse scan . --probe commands
- Evidence: Run with --probe commands or --run-probes to execute safe script probes.
