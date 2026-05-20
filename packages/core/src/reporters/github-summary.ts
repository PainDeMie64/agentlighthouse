import type { ScanResult } from "../schemas/types.js";
import { renderPrSummaryReport, type PrSummaryOptions } from "./pr-summary.js";

export function renderGithubStepSummary(
  result: ScanResult,
  options: PrSummaryOptions = {}
): string {
  return renderPrSummaryReport(result, options);
}
