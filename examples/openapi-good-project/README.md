# OpenAPI Good Project

## Quickstart

Install dependencies and verify the API contract:

```bash
npm test
```

## Usage Example

Use `GET /v1/customers` to list customers and `POST /v1/customers` to create one with an idempotency key.

## Architecture

- `openapi.yaml` contains the API contract.
- `agentlighthouse.tasks.yaml` contains verifiable agent workflows.
- `AGENTS.md` contains agent operating instructions.

## Troubleshooting

If authentication fails, check that `EXAMPLE_API_KEY` is replaced by a sandbox key.
