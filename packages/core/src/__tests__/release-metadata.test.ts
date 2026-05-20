import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  description?: string;
  license?: string;
  repository?: unknown;
  homepage?: string;
  bugs?: unknown;
  keywords?: string[];
  main?: string;
  types?: string;
  exports?: unknown;
  files?: string[];
  bin?: Record<string, string>;
  publishConfig?: { access?: string };
  dependencies?: Record<string, string>;
}

describe("release metadata", () => {
  it("marks publishable packages with alpha metadata and dist exports", async () => {
    const core = await readPackage("packages/core/package.json");
    const cli = await readPackage("packages/cli/package.json");

    for (const pkg of [core, cli]) {
      expect(pkg.version).toBe("0.1.0-alpha.1");
      expect(pkg.description).toBeTruthy();
      expect(pkg.license).toBe("MIT");
      expect(pkg.repository).toBeTruthy();
      expect(pkg.homepage).toContain("github.com/PainDeMie64/agentlighthouse");
      expect(pkg.bugs).toBeTruthy();
      expect(pkg.keywords?.length).toBeGreaterThan(0);
      expect(pkg.main).toBe("./dist/index.js");
      expect(pkg.types).toBe("./dist/index.d.ts");
      expect(JSON.stringify(pkg.exports)).toContain("./dist/index.js");
      expect(pkg.files).toEqual(expect.arrayContaining(["dist", "README.md", "LICENSE"]));
      expect(pkg.files).not.toContain("src");
      expect(pkg.publishConfig?.access).toBe("public");
    }

    expect(cli.bin?.agentlighthouse).toBe("dist/index.js");
    expect(cli.dependencies?.["@agentlighthouse/core"]).toBe("0.1.0-alpha.1");
    expect(JSON.stringify(cli.dependencies)).not.toContain("workspace:");
  });

  it("keeps the dashboard private", async () => {
    const web = await readPackage("apps/web/package.json");
    expect(web.private).toBe(true);
    expect(web.name).toBe("@agentlighthouse/web");
  });

  it("documents release and schema stability before public alpha", async () => {
    await expect(access(path.join(repoRoot, "CHANGELOG.md"))).resolves.toBeUndefined();
    await expect(access(path.join(repoRoot, "CONTRIBUTING.md"))).resolves.toBeUndefined();
    await expect(access(path.join(repoRoot, "SECURITY.md"))).resolves.toBeUndefined();
    await expect(access(path.join(repoRoot, "docs", "RELEASE.md"))).resolves.toBeUndefined();
    await expect(access(path.join(repoRoot, "docs", "VERSIONING.md"))).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "docs", "SCHEMA_STABILITY.md"))
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(repoRoot, "docs", "ALPHA_RELEASE_CHECKLIST.md"))
    ).resolves.toBeUndefined();
  });

  it("documents npm alpha status explicitly in the README", async () => {
    const readme = await readFile(path.join(repoRoot, "README.md"), "utf8");
    expect(readme).toMatch(/has not been published to npm yet|npm alpha is now published/i);
    expect(readme).toMatch(/Future npm install path after publication|@agentlighthouse\/cli@alpha/);
    expect(readme).toContain("direct pnpm CLI commands are the recommended CI path");
    expect(readme).not.toContain("npm install -g @agentlighthouse/cli\n\n## Quickstart");
  });

  it("exposes release scripts from the root package", async () => {
    const root = await readPackage("package.json");
    const rootWithScripts = root as PackageJson & { scripts?: Record<string, string> };
    expect(rootWithScripts.scripts?.["release:smoke"]).toBe("tsx scripts/release-smoke.ts");
    expect(rootWithScripts.scripts?.["release:check"]).toBe("tsx scripts/release-check.ts");
    expect(rootWithScripts.scripts?.["release:dry-run"]).toBe("tsx scripts/release-dry-run.ts");
    expect(rootWithScripts.scripts?.["release:fresh-clone"]).toBe(
      "tsx scripts/release-fresh-clone.ts"
    );
    expect(rootWithScripts.scripts?.["release:rehearsal"]).toBe("tsx scripts/release-rehearsal.ts");
    expect(rootWithScripts.scripts?.["release:package-audit"]).toBe(
      "tsx scripts/package-content-audit.ts"
    );
    expect(rootWithScripts.scripts?.["release:readme-check"]).toBe(
      "tsx scripts/readme-command-check.ts"
    );
    expect(rootWithScripts.scripts?.["release:external-trial"]).toBe(
      "tsx scripts/external-trial-summary.ts"
    );
  });

  it("keeps release rehearsal scripts in source control", async () => {
    const scripts = [
      "scripts/release-fresh-clone.ts",
      "scripts/release-rehearsal.ts",
      "scripts/package-content-audit.ts",
      "scripts/readme-command-check.ts",
      "scripts/external-trial-summary.ts"
    ];
    for (const script of scripts) {
      await expect(access(path.join(repoRoot, script))).resolves.toBeUndefined();
    }
  });

  it("keeps the changelog ready for the alpha candidate", async () => {
    const changelog = await readFile(path.join(repoRoot, "CHANGELOG.md"), "utf8");
    expect(changelog).toContain("## 0.1.0-alpha.1");
    expect(changelog).toContain("## 0.1.0-alpha.0");
    expect(changelog).toContain("workspace:");
    expect(changelog).toContain("### Added");
    expect(changelog).toContain("### Fixed");
    expect(changelog).toContain("### Known Issue");
  });
});

async function readPackage(relativePath: string): Promise<PackageJson> {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8")) as PackageJson;
}
