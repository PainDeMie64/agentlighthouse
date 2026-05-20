# Sample Good Project

Sample Good Project is a small TypeScript API service used to validate AgentLighthouse scoring on a well-documented repository.

## Quickstart

```bash
pnpm install
pnpm dev
```

## Installation

Use pnpm with Node.js 22 or newer.

```bash
pnpm install
```

## Usage Example

```bash
pnpm test
```

The example API exposes a health helper in `src/index.ts`.

## Architecture

- `src/` contains TypeScript source code.
- `docs/` contains architecture and API guidance.
- `agentlighthouse.tasks.yaml` contains realistic agent task workflows.

## Development Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Troubleshooting

If commands fail, verify Node.js 22+, run `pnpm install`, and confirm `EXAMPLE_API_KEY` is used instead of real credentials.
