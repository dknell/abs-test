import { describe, expect, it } from "vitest";

// AC6: parseDuration must be exported by name from the package entry point and
// importable as `import { parseDuration } from '<package>'`. The package name is
// `abs-test` (see package.json) and its `exports` map points the entry point at
// ./src/index.ts, so a self-referencing import must resolve to the function.
import { parseDuration } from "abs-test";

describe("parseDuration", () => {
  it("AC1: parses a milliseconds segment", () => {
    expect(parseDuration("500ms")).toBe(500);
  });

  it("AC2: parses a seconds segment", () => {
    expect(parseDuration("2s")).toBe(2000);
  });

  describe("AC3: sums multiple segments in any order", () => {
    it("sums adjacent segments", () => {
      expect(parseDuration("1h30m")).toBe(5400000);
    });

    it("is order-independent", () => {
      expect(parseDuration("30m1h")).toBe(5400000);
    });

    it("ignores inter-segment whitespace", () => {
      expect(parseDuration("1h 30m")).toBe(5400000);
    });
  });

  it("AC4: ignores surrounding whitespace", () => {
    expect(parseDuration("  10m ")).toBe(600000);
  });

  describe("AC5: fails closed with a RangeError naming the offending input", () => {
    it("throws a RangeError on empty input", () => {
      expect(() => parseDuration("")).toThrow(RangeError);
    });

    it("throws a RangeError on a malformed segment", () => {
      expect(() => parseDuration("5x")).toThrow(RangeError);
    });

    it("includes the offending input in the message", () => {
      expect(() => parseDuration("5x")).toThrow("5x");
    });
  });

  it("AC6: is exported by name from the package entry point", () => {
    expect(typeof parseDuration).toBe("function");
  });
});
