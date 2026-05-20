import { deriveFindingIdentity, stableFingerprint } from "../findings/helpers.js";
import { normalizeChangedPath } from "../changes/files.js";
import type {
  ChangedFile,
  ComparisonFinding,
  ComparisonResult,
  ComparisonScanSnapshot,
  Finding,
  PrImpact,
  ScanResult,
  Severity
} from "../schemas/types.js";
import { confidenceRank, severityRank } from "../reporters/shared.js";

export const comparisonModelVersion = "0.1.0";

const severities: Severity[] = ["critical", "high", "medium", "low", "info"];

export function compareScanResults(
  baseline: ScanResult,
  current: ScanResult,
  options: { changedFiles?: ChangedFile[] } = {}
): ComparisonResult {
  const baselineFindings = baseline.findings.map(ensureFindingIdentity);
  const currentFindings = current.findings.map(ensureFindingIdentity);
  const baselineByFingerprint = mapByFingerprint(baselineFindings);
  const currentByFingerprint = mapByFingerprint(currentFindings);

  const newFindings: ComparisonFinding[] = [];
  const resolvedFindings: ComparisonFinding[] = [];
  const unchangedFindings: ComparisonFinding[] = [];
  const worsenedFindings: ComparisonFinding[] = [];
  const improvedFindings: ComparisonFinding[] = [];

  for (const finding of currentFindings) {
    const previous = baselineByFingerprint.get(finding.fingerprint ?? "");
    if (!previous) {
      newFindings.push(finding);
      continue;
    }
    if (severityRank(finding.severity) > severityRank(previous.severity)) {
      worsenedFindings.push({
        ...finding,
        previousSeverity: previous.severity,
        currentSeverity: finding.severity
      });
    } else if (severityRank(finding.severity) < severityRank(previous.severity)) {
      improvedFindings.push({
        ...finding,
        previousSeverity: previous.severity,
        currentSeverity: finding.severity
      });
    } else {
      unchangedFindings.push(finding);
    }
  }

  for (const finding of baselineFindings) {
    if (!currentByFingerprint.has(finding.fingerprint ?? "")) {
      resolvedFindings.push(finding);
    }
  }

  const scoreDelta = current.score - baseline.score;
  const confidenceDelta = current.scoreConfidenceScore - baseline.scoreConfidenceScore;
  const coverageDelta = current.coverage.coveragePercent - baseline.coverage.coveragePercent;
  const severityCountDeltas = severityDeltas(baselineFindings, currentFindings);
  const caveats = comparisonCaveats(baseline, current, baselineFindings, currentFindings);
  const regressionDetected =
    scoreDelta < 0 ||
    coverageDelta < 0 ||
    confidenceDelta < 0 ||
    newFindings.some((finding) => severityRank(finding.severity) >= severityRank("high")) ||
    worsenedFindings.length > 0;
  const improvementDetected =
    scoreDelta > 0 || resolvedFindings.length > 0 || improvedFindings.length > 0;
  const prImpact =
    options.changedFiles && options.changedFiles.length > 0
      ? classifyPrImpact(options.changedFiles, {
          newFindings,
          resolvedFindings,
          unchangedFindings,
          worsenedFindings,
          improvedFindings
        })
      : undefined;
  const verdict =
    caveats.some((caveat) => caveat.includes("incompatible")) ||
    (baselineFindings.length + currentFindings.length > 0 &&
      [...baselineFindings, ...currentFindings].some((finding) => !finding.fingerprint))
      ? "inconclusive"
      : regressionDetected && improvementDetected
        ? scoreDelta >= 0
          ? "mixed"
          : "regressed"
        : regressionDetected
          ? "regressed"
          : improvementDetected
            ? "improved"
            : "unchanged";

  return {
    comparisonId: createComparisonId(baseline, current),
    baseline: scanSnapshot(baseline),
    current: scanSnapshot(current),
    deltas: {
      scoreDelta,
      confidenceDelta,
      coverageDelta,
      findingCountDelta: currentFindings.length - baselineFindings.length,
      severityCountDeltas
    },
    findings: {
      new: sortFindings(newFindings),
      resolved: sortFindings(resolvedFindings),
      unchanged: sortFindings(unchangedFindings),
      worsened: sortFindings(worsenedFindings),
      improved: sortFindings(improvedFindings)
    },
    ...(prImpact ? { prImpact } : {}),
    summary: {
      verdict,
      regressionDetected,
      improvementDetected,
      topRegressions: topRegressions(newFindings, worsenedFindings, scoreDelta, coverageDelta),
      topImprovements: topImprovements(resolvedFindings, improvedFindings, scoreDelta),
      recommendedActions: recommendedActions(newFindings, worsenedFindings, scoreDelta),
      caveats
    },
    metadata: {
      agentLighthouseVersion: current.agentLighthouseVersion,
      comparisonModelVersion
    }
  };
}

export function classifyPrImpact(
  changedFiles: ChangedFile[],
  findings: {
    newFindings: ComparisonFinding[];
    resolvedFindings: ComparisonFinding[];
    unchangedFindings: ComparisonFinding[];
    worsenedFindings: ComparisonFinding[];
    improvedFindings: ComparisonFinding[];
  }
): PrImpact {
  const normalizedChangedFiles = changedFiles.map((file) => ({
    ...file,
    path: normalizeChangedPath(file.path),
    ...(file.oldPath ? { oldPath: normalizeChangedPath(file.oldPath) } : {})
  }));
  const changedPathSet = new Set(
    normalizedChangedFiles.flatMap((file) => [file.path, file.oldPath].filter(Boolean) as string[])
  );
  const classify = (finding: ComparisonFinding): ComparisonFinding => ({
    ...finding,
    prImpactClassification: classifyFinding(finding, changedPathSet)
  });
  const newClassified = findings.newFindings.map(classify);
  const resolvedClassified = findings.resolvedFindings.map(classify);
  const unchangedClassified = findings.unchangedFindings.map(classify);
  const changedNew = newClassified.filter(isChangedImpact);
  const changedResolved = resolvedClassified.filter(isChangedImpact);
  const changedUnchanged = unchangedClassified.filter(isChangedImpact);
  const globalNew = newClassified.filter((finding) => finding.prImpactClassification === "global");
  const globalResolved = resolvedClassified.filter(
    (finding) => finding.prImpactClassification === "global"
  );
  const unknown = [...newClassified, ...resolvedClassified, ...unchangedClassified].filter(
    (finding) => finding.prImpactClassification === "unknown"
  );
  const unrelatedExisting = unchangedClassified.filter(
    (finding) => finding.prImpactClassification === "unrelated"
  );
  const impactedFiles = [...changedNew, ...changedResolved, ...changedUnchanged]
    .map((finding) => normalizeFindingFile(finding))
    .filter((file): file is string => Boolean(file));
  const highestChangedFileSeverity = [...changedNew, ...changedResolved]
    .map((finding) => finding.severity)
    .sort((a, b) => severityRank(b) - severityRank(a))[0];

  return {
    changedFiles: normalizedChangedFiles,
    changedFileCount: normalizedChangedFiles.length,
    newFindingsOnChangedFiles: sortFindings(changedNew),
    resolvedFindingsOnChangedFiles: sortFindings(changedResolved),
    unchangedFindingsOnChangedFiles: sortFindings(changedUnchanged),
    globalNewFindings: sortFindings(globalNew),
    globalResolvedFindings: sortFindings(globalResolved),
    unknownLocationFindings: sortFindings(unknown),
    unrelatedExistingFindings: sortFindings(unrelatedExisting),
    filesWithAgentReadinessImpact: [...new Set(impactedFiles)].sort(),
    ...(highestChangedFileSeverity ? { highestChangedFileSeverity } : {}),
    summary: summarizePrImpact(changedNew, globalNew, unknown, normalizedChangedFiles.length)
  };
}

export function ensureFindingIdentity(finding: Finding): ComparisonFinding {
  if (finding.fingerprint && finding.identityParts && finding.locationKey && finding.subject) {
    return finding;
  }
  const identity = deriveFindingIdentity({
    ruleId: finding.ruleId,
    affectedFile: finding.affectedFile,
    evidence: finding.evidence,
    subject: finding.subject,
    locationKey: finding.locationKey,
    identityParts: finding.identityParts
  });
  return {
    ...finding,
    identityParts: finding.identityParts ?? identity.identityParts,
    locationKey: finding.locationKey ?? identity.locationKey,
    subject: finding.subject ?? identity.subject,
    fingerprint: finding.fingerprint ?? stableFingerprint(identity.identityParts)
  };
}

function scanSnapshot(result: ScanResult): ComparisonScanSnapshot {
  return {
    scanId: result.scanId,
    scannedPath: result.scannedPath,
    score: result.score,
    confidence: result.scoreConfidence,
    confidenceScore: result.scoreConfidenceScore,
    coverage: result.coverage.coveragePercent,
    profile: result.profile,
    completedAt: result.completedAt
  };
}

function mapByFingerprint(findings: ComparisonFinding[]): Map<string, ComparisonFinding> {
  const map = new Map<string, ComparisonFinding>();
  for (const finding of findings) {
    if (finding.fingerprint) {
      map.set(finding.fingerprint, finding);
    }
  }
  return map;
}

function severityDeltas(
  baseline: ComparisonFinding[],
  current: ComparisonFinding[]
): Record<string, number> {
  const baselineCounts = severityCounts(baseline);
  const currentCounts = severityCounts(current);
  return Object.fromEntries(
    severities.map((severity) => [severity, currentCounts[severity] - baselineCounts[severity]])
  );
}

function severityCounts(findings: ComparisonFinding[]): Record<Severity, number> {
  return severities.reduce<Record<Severity, number>>(
    (counts, severity) => ({
      ...counts,
      [severity]: findings.filter((f) => f.severity === severity).length
    }),
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  );
}

function sortFindings<T extends ComparisonFinding>(findings: T[]): T[] {
  return [...findings].sort((a, b) => {
    const severityDelta = severityRank(b.severity) - severityRank(a.severity);
    if (severityDelta !== 0) return severityDelta;
    return (a.ruleId + (a.locationKey ?? "")).localeCompare(b.ruleId + (b.locationKey ?? ""));
  });
}

function comparisonCaveats(
  baseline: ScanResult,
  current: ScanResult,
  baselineFindings: ComparisonFinding[],
  currentFindings: ComparisonFinding[]
): string[] {
  const caveats: string[] = [];
  if (baseline.profile !== current.profile) {
    caveats.push(`Different profiles: baseline ${baseline.profile}, current ${current.profile}.`);
  }
  if (baseline.scoringModelVersion !== current.scoringModelVersion) {
    caveats.push(
      `Different scoring model versions: baseline ${baseline.scoringModelVersion}, current ${current.scoringModelVersion}.`
    );
  }
  if (baseline.agentLighthouseVersion !== current.agentLighthouseVersion) {
    caveats.push(
      `Different AgentLighthouse versions: baseline ${baseline.agentLighthouseVersion}, current ${current.agentLighthouseVersion}.`
    );
  }
  if (Math.abs(current.coverage.coveragePercent - baseline.coverage.coveragePercent) >= 25) {
    caveats.push("Coverage changed substantially; score deltas may reflect changed analyzability.");
  }
  if (
    confidenceRank(baseline.scoreConfidence) === 0 ||
    confidenceRank(current.scoreConfidence) === 0
  ) {
    caveats.push("One or both scans have low confidence.");
  }
  if ([...baselineFindings, ...currentFindings].some((finding) => !finding.fingerprint)) {
    caveats.push("Some findings have missing fingerprints, making comparison incomplete.");
  }
  return caveats;
}

function topRegressions(
  newFindings: ComparisonFinding[],
  worsenedFindings: ComparisonFinding[],
  scoreDelta: number,
  coverageDelta: number
): string[] {
  const messages = [
    ...sortFindings(newFindings)
      .filter((finding) => severityRank(finding.severity) >= severityRank("medium"))
      .slice(0, 3)
      .map((finding) => `New ${finding.severity} finding: ${finding.title}`),
    ...sortFindings(worsenedFindings)
      .slice(0, 3)
      .map(
        (finding) =>
          `Worsened finding: ${finding.title} (${finding.previousSeverity} -> ${finding.currentSeverity})`
      )
  ];
  if (scoreDelta < 0) messages.push(`Score dropped by ${Math.abs(scoreDelta)} point(s).`);
  if (coverageDelta < 0) messages.push(`Coverage dropped by ${Math.abs(coverageDelta)} point(s).`);
  return messages.slice(0, 5);
}

function topImprovements(
  resolvedFindings: ComparisonFinding[],
  improvedFindings: ComparisonFinding[],
  scoreDelta: number
): string[] {
  const messages = [
    ...sortFindings(resolvedFindings)
      .slice(0, 3)
      .map((finding) => `Resolved ${finding.severity} finding: ${finding.title}`),
    ...sortFindings(improvedFindings)
      .slice(0, 3)
      .map(
        (finding) =>
          `Improved finding: ${finding.title} (${finding.previousSeverity} -> ${finding.currentSeverity})`
      )
  ];
  if (scoreDelta > 0) messages.push(`Score improved by ${scoreDelta} point(s).`);
  return messages.slice(0, 5);
}

function recommendedActions(
  newFindings: ComparisonFinding[],
  worsenedFindings: ComparisonFinding[],
  scoreDelta: number
): string[] {
  const actions: string[] = [];
  if (newFindings.some((finding) => severityRank(finding.severity) >= severityRank("high"))) {
    actions.push("Fix new high-severity agent-readiness findings before merging.");
  }
  if (worsenedFindings.length > 0) {
    actions.push("Review worsened findings and restore the clearer baseline behavior.");
  }
  if (scoreDelta < 0) {
    actions.push("Compare the changed files with the baseline report and recover lost context.");
  }
  for (const finding of sortFindings(newFindings).slice(0, 3)) {
    if (!actions.includes(finding.recommendation)) {
      actions.push(finding.recommendation);
    }
  }
  return actions.slice(0, 5);
}

function createComparisonId(baseline: ScanResult, current: ScanResult): string {
  const input = `${baseline.scanId}:${current.scanId}:${baseline.completedAt}:${current.completedAt}`;
  let hash = 2166136261;
  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `cmp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function classifyFinding(
  finding: ComparisonFinding,
  changedPathSet: Set<string>
): NonNullable<ComparisonFinding["prImpactClassification"]> {
  const file = normalizeFindingFile(finding);
  if (file && changedPathSet.has(file)) return "touched";
  if (
    file &&
    [...changedPathSet].some((changedFile) => finding.locationKey?.includes(changedFile))
  ) {
    return "related";
  }
  if (isGlobalFinding(finding)) return "global";
  if (!file) return "unknown";
  return "unrelated";
}

function normalizeFindingFile(finding: ComparisonFinding): string | undefined {
  const file = finding.location?.file ?? finding.affectedFile;
  if (!file || file === "n/a") return undefined;
  return normalizeChangedPath(file);
}

function isChangedImpact(finding: ComparisonFinding): boolean {
  return (
    finding.prImpactClassification === "touched" || finding.prImpactClassification === "related"
  );
}

function isGlobalFinding(finding: ComparisonFinding): boolean {
  if (!finding.affectedFile && !finding.location?.file) return true;
  return /^(COMMAND_VERIFICATION_SKIPPED|api\.openapi-not-detected|mcp\.not-evaluated)$/.test(
    finding.ruleId
  );
}

function summarizePrImpact(
  changedNew: ComparisonFinding[],
  globalNew: ComparisonFinding[],
  unknown: ComparisonFinding[],
  changedFileCount: number
): string {
  return `${changedFileCount} changed file(s) analyzed; ${changedNew.length} new finding(s) on changed files, ${globalNew.length} new global finding(s), ${unknown.length} unknown-location finding(s).`;
}
