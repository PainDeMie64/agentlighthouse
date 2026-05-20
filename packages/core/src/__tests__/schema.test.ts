import { describe, expect, it } from "vitest";
import { sampleScanResult, scanResultSchema } from "../index.js";

describe("scanResultSchema", () => {
  it("validates the stable Phase 1 scan result shape", () => {
    expect(() => scanResultSchema.parse(sampleScanResult)).not.toThrow();
    expect(sampleScanResult.scanId).toBeTruthy();
    expect(sampleScanResult.detectedProject.type).toBe("node_typescript");
    expect(sampleScanResult.scanStats.findingCount).toBeGreaterThan(0);
  });
});
