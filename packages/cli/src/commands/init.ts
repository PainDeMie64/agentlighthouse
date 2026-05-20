import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateStarterArtifacts } from "@agentlighthouse/core";
import { resolveFromInvocationCwd } from "../pathing.js";

export interface InitCommandOptions {
  dryRun?: boolean;
  force?: boolean;
  yes?: boolean;
}

export async function runInitCommand(
  targetPath: string,
  options: InitCommandOptions
): Promise<void> {
  const rootPath = resolveFromInvocationCwd(targetPath);
  const artifacts = await generateStarterArtifacts(rootPath);
  const created: string[] = [];
  const skipped: string[] = [];
  const wouldCreate: string[] = [];
  const overwritten: string[] = [];

  for (const artifact of artifacts) {
    const absolutePath = path.join(rootPath, artifact.path);
    const exists = await fileExists(absolutePath);
    if (options.dryRun) {
      wouldCreate.push(
        `${artifact.path}${exists && options.force ? " (overwrite)" : exists ? " (skip existing)" : ""}`
      );
      continue;
    }
    if (exists && !options.force) {
      skipped.push(artifact.path);
      continue;
    }
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, artifact.content, "utf8");
    if (exists) {
      overwritten.push(artifact.path);
    } else {
      created.push(artifact.path);
    }
  }

  if (options.dryRun) {
    process.stdout.write(
      `AgentLighthouse init dry run for ${rootPath}\n${wouldCreate.map((file) => `- ${file}`).join("\n")}\n`
    );
    return;
  }

  process.stdout.write(`AgentLighthouse init completed for ${rootPath}\n`);
  if (created.length > 0) {
    process.stdout.write(`Created:\n${created.map((file) => `- ${file}`).join("\n")}\n`);
  }
  if (overwritten.length > 0) {
    process.stdout.write(`Overwritten:\n${overwritten.map((file) => `- ${file}`).join("\n")}\n`);
  }
  if (skipped.length > 0) {
    process.stdout.write(
      `Skipped existing files:\n${skipped.map((file) => `- ${file}`).join("\n")}\n`
    );
    process.stdout.write("Use --force to overwrite existing starter artifacts.\n");
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
