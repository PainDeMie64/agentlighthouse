import { runCommand } from "./release-utils.js";

const steps = [
  ["release:check", ["release:check"]],
  ["release:dry-run", ["release:dry-run"]],
  ["release:package-audit", ["release:package-audit"]],
  ["release:readme-check", ["release:readme-check"]],
  ["release:external-trial", ["release:external-trial"]]
] as const;

for (const [name, args] of steps) {
  process.stdout.write(`\n== ${name} ==\n`);
  await runCommand("pnpm", [...args]);
}

process.stdout.write("\n== release:fresh-clone ==\n");
await runCommand("pnpm", ["release:fresh-clone"], {
  env: { AGENTLIGHTHOUSE_RELEASE_REHEARSAL_PRIOR_CHECKS: "1" }
});

process.stdout.write(
  "\nPublic alpha release rehearsal passed. No tags or packages were published.\n"
);
