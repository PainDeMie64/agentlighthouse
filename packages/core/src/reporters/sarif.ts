import type { Finding, ScanResult, Severity } from "../schemas/types.js";

type SarifLevel = "error" | "warning" | "note";

interface SarifLog {
  version: "2.1.0";
  $schema: string;
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: "AgentLighthouse";
      semanticVersion: string;
      informationUri: string;
      rules: SarifRule[];
    };
  };
  results: SarifResult[];
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription: { text: string };
  fullDescription: { text: string };
  help: { text: string; markdown: string };
  defaultConfiguration: { level: SarifLevel };
  properties: {
    category: string;
    severity: Severity;
    tags: string[];
  };
}

interface SarifResult {
  ruleId: string;
  level: SarifLevel;
  message: { text: string };
  locations?: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region: {
        startLine: number;
        startColumn?: number;
        endLine?: number;
        endColumn?: number;
      };
    };
  }>;
  partialFingerprints: {
    agentLighthouseFinding: string;
  };
  properties: {
    category: string;
    severity: Severity;
    agentFailureMode?: string;
    recommendation: string;
    fixExample?: string;
    confidence: ScanResult["scoreConfidence"];
    subject?: string;
    locationKey?: string;
    sourceKind?: string;
  };
}

export function renderSarifReport(result: ScanResult): string {
  const rules = uniqueRules(result.findings);
  const sarif: SarifLog = {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "AgentLighthouse",
            semanticVersion: result.agentLighthouseVersion,
            informationUri: "https://github.com/PainDeMie64/agentlighthouse",
            rules
          }
        },
        results: result.findings.map((finding) => findingToResult(finding, result))
      }
    ]
  };
  return JSON.stringify(sarif, null, 2);
}

function uniqueRules(findings: Finding[]): SarifRule[] {
  const byRule = new Map<string, Finding>();
  for (const finding of findings) {
    if (!byRule.has(finding.ruleId)) {
      byRule.set(finding.ruleId, finding);
    }
  }
  return [...byRule.values()].map((finding) => ({
    id: finding.ruleId,
    name: finding.title,
    shortDescription: { text: finding.title },
    fullDescription: { text: finding.description },
    help: {
      text: finding.recommendation,
      markdown: [
        finding.recommendation,
        finding.agentFailureMode ? `Agent failure mode: ${finding.agentFailureMode}` : undefined,
        finding.fixExample ? `Fix example: ${finding.fixExample}` : undefined
      ]
        .filter((line): line is string => Boolean(line))
        .join("\n\n")
    },
    defaultConfiguration: { level: severityToSarifLevel(finding.severity) },
    properties: {
      category: finding.category,
      severity: finding.severity,
      tags: ["agent-readiness", finding.category, finding.severity]
    }
  }));
}

function findingToResult(finding: Finding, result: ScanResult): SarifResult {
  return {
    ruleId: finding.ruleId,
    level: severityToSarifLevel(finding.severity),
    message: {
      text: `${finding.title}: ${finding.recommendation}`
    },
    ...(finding.location?.file || finding.affectedFile
      ? {
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: finding.location?.file ?? finding.affectedFile! },
                region: sarifRegion(finding)
              }
            }
          ]
        }
      : {}),
    partialFingerprints: {
      agentLighthouseFinding: stableFingerprint(finding)
    },
    properties: {
      category: finding.category,
      severity: finding.severity,
      ...(finding.agentFailureMode ? { agentFailureMode: finding.agentFailureMode } : {}),
      recommendation: finding.recommendation,
      ...(finding.fixExample ? { fixExample: finding.fixExample } : {}),
      confidence: result.scoreConfidence,
      ...(finding.subject || finding.location?.subject
        ? { subject: finding.subject ?? finding.location?.subject }
        : {}),
      ...(finding.locationKey || finding.location?.locationKey
        ? { locationKey: finding.locationKey ?? finding.location?.locationKey }
        : {}),
      ...(finding.location?.sourceKind ? { sourceKind: finding.location.sourceKind } : {})
    }
  };
}

function sarifRegion(
  finding: Finding
): NonNullable<SarifResult["locations"]>[number]["physicalLocation"]["region"] {
  return {
    startLine: finding.location?.startLine ?? 1,
    ...(finding.location?.startColumn ? { startColumn: finding.location.startColumn } : {}),
    ...(finding.location?.endLine ? { endLine: finding.location.endLine } : {}),
    ...(finding.location?.endColumn ? { endColumn: finding.location.endColumn } : {})
  };
}

function severityToSarifLevel(severity: Severity): SarifLevel {
  if (severity === "critical" || severity === "high") {
    return "error";
  }
  if (severity === "medium") {
    return "warning";
  }
  return "note";
}

function stableFingerprint(finding: Finding): string {
  if (finding.fingerprint) {
    return finding.fingerprint;
  }
  const input = `${finding.ruleId}:${finding.affectedFile ?? ""}:${finding.evidence.join("|")}`;
  let hash = 2166136261;
  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
