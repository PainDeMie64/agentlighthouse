# Next Issues

These are the likely next public-alpha issues. They are intentionally scoped as roadmap items, not
active implementation in this pass.

## Scanner Depth

1. Improve OpenAPI `$ref` resolution.
2. Improve MCP static extraction accuracy across SDK versions and registration styles.
3. Add line-precise finding locations for more rules.
4. Add analyzer snapshot tests on real public repositories.
5. Improve score calibration on mature human-readable repositories that lack agent-specific
   artifacts.

## Configuration And Scoring

6. Add full config schema documentation.
7. Add rule severity customization.
8. Add profile-specific recommendation examples.
9. Add clearer docs for confidence and coverage tradeoffs.

## CI And GitHub

10. Add changed-files-only preview mode, clearly marked experimental.
11. Add GitHub Checks integration.
12. Add npm trusted publishing.
13. Harden the GitHub Action so external repositories do not need source-build behavior.

## Product Feedback

14. Collect first-user reports for false positives and false negatives.
15. Publish a small calibration matrix from public repos after reviewing license and sensitivity
    concerns.
16. Turn recurring external-trial findings into rule-specific issues.
