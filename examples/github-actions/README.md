# GitHub Actions Examples

These examples are token-free except where standard GitHub artifact or SARIF upload actions require
GitHub permissions.

For the first public alpha, the recommended path is direct CLI commands from a source checkout until
`@agentlighthouse/cli` is published to npm. The composite action in this repository is experimental
and source-based: it builds AgentLighthouse during the workflow and scans the caller workspace.

Use `fetch-depth: 0` when `git-base` and `git-head` are needed for PR-aware changed-file analysis.

After npm publication, these examples can be simplified to install and run
`@agentlighthouse/cli@alpha` directly.
