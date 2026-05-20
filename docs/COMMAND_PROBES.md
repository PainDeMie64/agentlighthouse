# Command Probes

Command probes are opt-in. AgentLighthouse does not execute project commands by default.

## Enable Probes

```bash
agentlighthouse scan . --probe commands
agentlighthouse scan . --run-probes
```

Or configure trusted local/CI usage:

```json
{
  "profile": "devtool",
  "probes": {
    "commands": false,
    "timeoutMs": 30000,
    "allowedScripts": ["test", "typecheck", "lint"]
  }
}
```

## Safety Rules

- Install commands are never run automatically.
- Arbitrary commands from docs are not executed.
- Only allowed package scripts are probed.
- Probes use timeouts and capture limited sanitized output.
- Secret-looking output is redacted.

## Purpose

Static analysis can say a command exists. Command probes answer whether trusted, safe verification commands actually pass in the current checkout.
