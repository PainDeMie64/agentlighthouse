import { describe, expect, it } from "vitest";
import { health } from "./index.js";

describe("health", () => {
  it("returns an ok payload", () => {
    expect(health()).toEqual({ ok: true });
  });
});
