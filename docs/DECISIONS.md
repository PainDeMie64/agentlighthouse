# Decisions

## Deterministic Offline Scan Comes First

AgentLighthouse must work without model-provider credentials. This makes the first MVP easy to run in local repos, CI, and evaluation environments.

## This Is Not an Agent Executor

The product improves the environment that agents read. Running real agents against task benchmarks can come later, but the core value is readiness verification, scoring, and actionable fixes.

## Monorepo With Thin App Boundaries

The core package owns product behavior. CLI and web depend on core contracts. This keeps future GitHub Actions, hosted APIs, and report renderers from duplicating scanner logic.

## Severity-Based Scoring

The initial scoring model is simple by design. It is transparent, easy to explain, and versioned so later scoring modules can become more nuanced.
