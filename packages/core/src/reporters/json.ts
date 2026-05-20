import type { ScanResult } from "../schemas/types.js";

export function renderJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}
