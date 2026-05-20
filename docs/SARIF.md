# SARIF

AgentLighthouse can render scan findings as SARIF 2.1.0 for code scanning systems.

```bash
agentlighthouse scan . --format sarif --output agentlighthouse.sarif
pnpm --filter @agentlighthouse/cli dev scan . --format sarif --output agentlighthouse.sarif
```

## Mapping

- `critical` and `high` findings become SARIF `error` results.
- `medium` findings become SARIF `warning` results.
- `low` and `info` findings become SARIF `note` results.
- Every emitted finding rule ID becomes a SARIF rule definition.
- Affected files become SARIF locations when available.
- Line regions are emitted when AgentLighthouse can locate a Markdown heading, OpenAPI operation, MCP tool registration, or benchmark task.
- Finding metadata is preserved in SARIF properties: category, severity, recommendation, agent failure mode, fix example, score confidence, subject, location key, and source kind.

SARIF output is deterministic and token-free. It does not upload anything by itself.

## GitHub Code Scanning

Use the generated SARIF with `github/codeql-action/upload-sarif`:

```yaml
- uses: PainDeMie64/agentlighthouse@main
  with:
    output-sarif: "true"
    fail-under: "75"
- uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: agentlighthouse-report.sarif
```

## Limitations

AgentLighthouse does not yet emit SARIF quick fixes or precise source line numbers for every rule. Some project-level findings intentionally have no location, and unknown-location findings should be handled in Markdown/PR summaries until scanner localization improves.
