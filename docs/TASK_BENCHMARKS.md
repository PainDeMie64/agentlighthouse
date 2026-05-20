# Task Benchmarks

Phase 2A introduces `agentlighthouse.tasks.yaml` as the preferred task benchmark file.

## Schema

Each task can include:

- `id`
- `title`
- `persona`
- `objective`
- `projectAreas`
- `requiredDocs`
- `allowedFiles`
- `disallowedFiles`
- `expectedActions`
- `expectedOutputs`
- `successCriteria`
- `verificationCommands`
- `riskLevel`
- `commonFailureModes`

## What AgentLighthouse Checks

- Objectives are concrete.
- Success criteria exist.
- Required docs are listed.
- Expected outputs are verifiable.
- Risky tasks mark risk level.
- Verification commands exist.
- Common failure modes are documented.

## Current Limit

AgentLighthouse does not execute AI agents yet. Benchmarks are analyzed for task quality and future evaluator readiness.
