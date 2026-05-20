import type { Finding, FindingCategory, Severity, SuggestedFixType } from "../schemas/types.js";

const openApiEvidencePattern =
  /(?<file>[^:;\n]+):\s*(?<method>GET|POST|PUT|PATCH|DELETE)\s+(?<path>\/[^\s;(]+)/i;
const mcpOrTaskEvidencePattern = /(?<file>[^:;\n]+):\s*(?<subject>[A-Za-z0-9_.:-]+)/;

export function finding(input: {
  id: string;
  ruleId?: string;
  fingerprint?: string;
  identityParts?: string[];
  locationKey?: string;
  subject?: string;
  title: string;
  severity: Severity;
  category: FindingCategory;
  description: string;
  evidence: string[];
  recommendation: string;
  affectedFile?: string;
  agentFailureMode?: string;
  fixExample?: string;
  docsLinks?: string[];
  suggestedFixType: SuggestedFixType;
}): Finding {
  const ruleId = input.ruleId ?? input.id;
  const identity = deriveFindingIdentity({
    ruleId,
    affectedFile: input.affectedFile,
    evidence: input.evidence,
    subject: input.subject,
    locationKey: input.locationKey,
    identityParts: input.identityParts
  });
  return {
    ...input,
    ruleId,
    fingerprint: input.fingerprint ?? stableFingerprint(identity.identityParts),
    identityParts: input.identityParts ?? identity.identityParts,
    locationKey: input.locationKey ?? identity.locationKey,
    subject: input.subject ?? identity.subject
  };
}

export function textIncludesAny(text: string | undefined, needles: readonly string[]): boolean {
  if (!text) {
    return false;
  }
  const lower = text.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

export function hasUsefulMarkdownLinks(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  return /\[[^\]]+\]\([^)]+\)/.test(text) || /^https?:\/\//m.test(text) || /^\//m.test(text);
}

export function deriveFindingIdentity(input: {
  ruleId: string;
  affectedFile?: string;
  evidence: string[];
  subject?: string;
  locationKey?: string;
  identityParts?: string[];
}): { identityParts: string[]; locationKey: string; subject: string } {
  if (input.identityParts && input.identityParts.length > 0) {
    const normalizedParts = input.identityParts.map(normalizeIdentityPart);
    return {
      identityParts: normalizedParts,
      locationKey: input.locationKey ?? normalizedParts[1] ?? input.ruleId,
      subject: input.subject ?? normalizedParts.at(-1) ?? input.ruleId
    };
  }

  const evidenceKey = firstEvidenceKey(input.evidence);
  const openApiMatch = input.evidence.join("; ").match(openApiEvidencePattern);
  if (openApiMatch?.groups) {
    const file = normalizePath(openApiMatch.groups.file ?? input.affectedFile ?? "");
    const method = (openApiMatch.groups.method ?? "").toUpperCase();
    const apiPath = openApiMatch.groups.path ?? "";
    const subject = input.subject ?? `${method} ${apiPath}`;
    const locationKey =
      input.locationKey ?? `${file}#/paths/${jsonPointerPath(apiPath)}/${method.toLowerCase()}`;
    return {
      identityParts: [input.ruleId, locationKey, normalizeIdentityPart(subject)],
      locationKey,
      subject
    };
  }

  if (/^MCP_/.test(input.ruleId) || /^TASK_/.test(input.ruleId)) {
    const parsed = input.evidence.join("; ").match(mcpOrTaskEvidencePattern);
    if (parsed?.groups) {
      const file = normalizePath(parsed.groups.file ?? input.affectedFile ?? "");
      const subject = input.subject ?? parsed.groups.subject ?? input.ruleId;
      const prefix = input.ruleId.startsWith("TASK_") ? "task" : "tool";
      const locationKey =
        input.locationKey ?? `${file}#${prefix}:${normalizeIdentityPart(subject)}`;
      return {
        identityParts: [input.ruleId, locationKey, normalizeIdentityPart(subject)],
        locationKey,
        subject
      };
    }
  }

  const locationKey = input.locationKey ?? normalizePath(input.affectedFile ?? evidenceKey);
  const subject = input.subject ?? normalizeSubject(input.affectedFile ?? evidenceKey);
  return {
    identityParts: [
      input.ruleId,
      normalizeIdentityPart(locationKey || "project"),
      normalizeIdentityPart(subject || input.ruleId)
    ],
    locationKey: locationKey || input.ruleId,
    subject: subject || input.ruleId
  };
}

export function stableFingerprint(identityParts: string[]): string {
  const input = identityParts.map(normalizeIdentityPart).join("|");
  let hash = 2166136261;
  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `alh_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function firstEvidenceKey(evidence: string[]): string {
  return evidence[0] ?? "project";
}

function normalizePath(value: string): string {
  return value
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "")
    .replace(/^<repo>\//, "")
    .toLowerCase();
}

function normalizeSubject(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeIdentityPart(value: string): string {
  return normalizeSubject(value).replaceAll("\\", "/").toLowerCase();
}

function jsonPointerPath(apiPath: string): string {
  return apiPath
    .split("/")
    .map((part) => part.replaceAll("~", "~0").replaceAll("/", "~1"))
    .join("~1");
}
