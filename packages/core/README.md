# @agentlighthouse/core

Core scanner, schemas, scoring, comparison, and reporters for AgentLighthouse.

This package is intended for tool authors who want to embed AgentLighthouse's local-first agent-readiness analysis. The public alpha API is intentionally centered on the root export:

```ts
import {
  scanProject,
  compareScanResults,
  renderMarkdownReport,
  renderSarifReport
} from "@agentlighthouse/core";
```

The API is alpha. See `docs/SCHEMA_STABILITY.md` in the repository before depending on report schemas or finding fingerprints.
