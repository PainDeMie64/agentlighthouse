# Security Policy

AgentLighthouse is local-first and should not require cloud services, model-provider keys, or tokens for normal scanning.

## Reporting Security Issues

During public alpha preparation, please avoid public disclosure of sensitive issues until maintainers have had a chance to respond.

Open a GitHub issue with minimal details, or contact the repository owner privately if the issue involves secrets, credential leakage, arbitrary command execution, or unsafe CI behavior.

## Scanner Safety

- Static analysis is the default.
- Command probes are opt-in.
- Command probes must not run install commands or arbitrary commands copied from docs.
- Validation reports must not include secrets or private repository content.
- External repositories used for validation belong under `.tmp/validation-repos/` and must not be committed.

## Supported Versions

No public release is available yet. The first planned release line is `0.1.0-alpha.0`.
