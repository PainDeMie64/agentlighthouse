import type { Finding, Severity } from "../schemas/types.js";

export const severityOrder: Severity[] = ["critical", "high", "medium", "low", "info"];

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function topActionableFindings(findings: Finding[], limit: number): Finding[] {
  return findings.filter((finding) => finding.severity !== "info").slice(0, limit);
}

export function findingLocation(finding: Finding): string {
  return finding.affectedFile ? ` (${finding.affectedFile})` : "";
}

export function severityRank(severity: Severity): number {
  return {
    info: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  }[severity];
}

export function confidenceRank(confidence: "low" | "medium" | "high"): number {
  return {
    low: 0,
    medium: 1,
    high: 2
  }[confidence];
}
