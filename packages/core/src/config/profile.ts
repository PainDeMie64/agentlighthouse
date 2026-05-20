import type { ProjectSignals, ScanOptions, ScanProfile } from "../schemas/types.js";
import { detectProject } from "../detection/project.js";

export interface AgentLighthouseConfig {
  profile?: ScanProfile;
  probes?: {
    commands?: boolean;
    timeoutMs?: number;
    allowedScripts?: string[];
  };
}

export interface ResolvedProfile {
  profile: ScanProfile;
  source: "cli" | "config" | "inferred";
}

export function resolveProfile(
  signals: ProjectSignals,
  options: ScanOptions = {}
): ResolvedProfile {
  if (options.profile) {
    return { profile: options.profile, source: "cli" };
  }
  const configured = parseConfig(signals.textByPath["agentlighthouse.config.json"]);
  if (configured?.profile) {
    return { profile: configured.profile, source: "config" };
  }
  const detected = detectProject(signals);
  if (detected.type === "mcp_project") return { profile: "mcp", source: "inferred" };
  if (detected.type === "openapi_project") return { profile: "api", source: "inferred" };
  if (detected.type === "docs_only") return { profile: "docs", source: "inferred" };
  if (detected.type === "node_typescript" || detected.type === "node_javascript") {
    return { profile: "library", source: "inferred" };
  }
  return { profile: "default", source: "inferred" };
}

function parseConfig(content: string | undefined): AgentLighthouseConfig | undefined {
  if (!content) return undefined;
  try {
    const parsed = JSON.parse(content) as AgentLighthouseConfig & { profile?: string };
    if (
      parsed.profile === "default" ||
      parsed.profile === "devtool" ||
      parsed.profile === "api" ||
      parsed.profile === "mcp" ||
      parsed.profile === "docs" ||
      parsed.profile === "library" ||
      parsed.profile === "internal"
    ) {
      return {
        profile: parsed.profile,
        probes: parsed.probes
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function resolveConfig(signals: ProjectSignals): AgentLighthouseConfig {
  return parseConfig(signals.textByPath["agentlighthouse.config.json"]) ?? {};
}
