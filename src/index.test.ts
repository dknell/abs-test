import { describe, expect, it } from "vitest";

import { parseDuration } from "./index";

describe("parseDuration", () => {
  // AC1: parseDuration('500ms') === 500
  it("parses a millisecond segment (AC1)", () => {
    expect(parseDuration("500ms")).toBe(500);
  });

  // AC2: parseDuration('2s') === 2000
  it("parses a seconds segment (AC2)", () => {
    expect(parseDuration("2s")).toBe(2000);
  });

  // AC3: parseDuration('1h30m') === 5400000 (segments may appear in any
  // order and are summed)
  describe("sums multiple segments in any order (AC3)", () => {
    it("parses adjacent segments", () => {
      expect(parseDuration("1h30m")).toBe(5_400_000);
    });

    it("parses segments separated by whitespace", () => {
      expect(parseDuration("1h 30m")).toBe(5_400_000);
    });

    it("parses segments given in reverse order", () => {
      expect(parseDuration("30m1h")).toBe(5_400_000);
    });
  });

  // AC4: parseDuration('  10m ') === 600000 (surrounding whitespace ignored)
  it("ignores surrounding whitespace (AC4)", () => {
    expect(parseDuration("  10m ")).toBe(600_000);
  });

  // AC5: parseDuration('') and parseDuration('5x') each throw a RangeError
  // whose message names the bad input.
  describe("rejects invalid input with a RangeError (AC5)", () => {
    it("throws a RangeError for empty input", () => {
      expect(() => parseDuration("")).toThrow(RangeError);
    });

    it("throws a RangeError for an unknown unit and names the bad input", () => {
      expect(() => parseDuration("5x")).toThrow(RangeError);
      expect(() => parseDuration("5x")).toThrow(/5x/);
    });
  });

  // AC6: parseDuration is exported by name from the package entry point and
  // importable.
  describe("is exported by name from the package entry point (AC6)", () => {
    it("is importable as a named function export", async () => {
      expect(typeof parseDuration).toBe("function");

      const entryPoint = await import("./index");
      expect(typeof entryPoint.parseDuration).toBe("function");
    });
  });
});
