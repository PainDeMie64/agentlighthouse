# Schema Stability

AgentLighthouse report schemas are alpha.

## Scan Result Schema

The scan result JSON is intended to be machine-readable by CLIs, CI systems, dashboards, and future API ingestion. During public alpha, fields may still change as analyzers and reporting mature.

Expected stable direction:

- `scanId`, score, confidence, coverage, profile, findings, recommendations, detected project, detected artifacts, and report metadata remain core concepts.
- New analyzer sections may be added.
- Existing fields may be renamed before beta if they prove confusing.

## Comparison Result Schema

Comparison JSON is alpha and intended for PR deltas, future dashboards, and longitudinal tracking.

Expected stable direction:

- baseline/current snapshots
- score, confidence, coverage, and severity deltas
- new/resolved/unchanged/improved/worsened findings
- optional PR impact classification when changed-file context is available

## Rule IDs

Rule IDs are intended to be stable enough for CI gates and SARIF, but they may still evolve before beta when a rule is split, merged, or clarified.

When changing a rule ID, prefer documenting the old and new IDs in `docs/RULES.md`.

## Finding Fingerprints

Fingerprints are intended to be stable across repeated scans of the same project state. They are based on rule ID, normalized paths, symbols, OpenAPI operation subjects, MCP tool names, task IDs, and stable evidence keys.

Fingerprints may change before beta as location precision improves.

## SARIF

SARIF output targets GitHub code scanning and compatible tools. File and line locations are best-effort and will become more precise over time.

## Config

`agentlighthouse.config.json` is alpha. Profiles and command probe settings are supported now; future versions may add stricter schema validation and migration guidance.
