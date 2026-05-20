# OpenAPI Analysis

AgentLighthouse analyzes OpenAPI 3.x specs deterministically. Swagger 2.0 files are detected, but Phase 2A focuses on OpenAPI 3.x quality signals.

## What It Checks

- Spec title, version, description, servers, security schemes, tags, and external docs.
- Operation IDs, summaries, descriptions, parameters, request bodies, responses, and examples.
- Common error responses such as 400, 401, 403, 404, 409, 429, and 500.
- Pagination, rate-limit, idempotency, webhook, and destructive-operation hints.

## Why It Matters For Agents

AI coding agents often generate clients, examples, or integrations directly from API specs. Weak operation names, missing auth, absent error responses, and missing examples cause agents to invent behavior or produce happy-path-only code.

## Current Limits

The analyzer does not execute API requests. It does not fully resolve every `$ref` yet. Findings are static and evidence-based.
