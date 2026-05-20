import type { Finding, FindingCategory, Severity, SuggestedFixType } from "../schemas/types.js";

export function finding(input: {
  id: string;
  ruleId?: string;
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
  return {
    ...input,
    ruleId: input.ruleId ?? input.id
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
