import { describe, it, expect } from "vitest";
import { parseDuration } from "./index";

describe("parseDuration", () => {
  // AC1: parseDuration('500ms') === 500
  it("parses a milliseconds segment (AC1)", () => {
    expect(parseDuration("500ms")).toBe(500);
  });

  // AC2: parseDuration('2s') === 2000
  it("parses a seconds segment (AC2)", () => {
    expect(parseDuration("2s")).toBe(2000);
  });

  // AC3: parseDuration('1h30m') === 5400000 — segments may appear in any order and are summed
  it("sums adjacent segments (AC3)", () => {
    expect(parseDuration("1h30m")).toBe(5400000);
  });

  it("sums segments regardless of order (AC3)", () => {
    expect(parseDuration("30m1h")).toBe(5400000);
  });

  it("sums segments separated by whitespace (AC3)", () => {
    expect(parseDuration("1h 30m")).toBe(5400000);
  });

  // AC4: parseDuration('  10m ') === 600000 — surrounding whitespace is ignored
  it("ignores surrounding whitespace (AC4)", () => {
    expect(parseDuration("  10m ")).toBe(600000);
  });

  // Supported units and their millisecond factors.
  it("supports every documented unit", () => {
    expect(parseDuration("1ms")).toBe(1);
    expect(parseDuration("1s")).toBe(1000);
    expect(parseDuration("1m")).toBe(60000);
    expect(parseDuration("1h")).toBe(3600000);
    expect(parseDuration("1d")).toBe(86400000);
  });

  it("sums three or more mixed segments", () => {
    expect(parseDuration("1d2h3m4s5ms")).toBe(
      86400000 + 2 * 3600000 + 3 * 60000 + 4 * 1000 + 5,
    );
  });

  // AC5: parseDuration('') throws a RangeError naming the bad input.
  it("throws RangeError on empty input (AC5)", () => {
    expect(() => parseDuration("")).toThrow(RangeError);
  });

  it("throws RangeError on whitespace-only input (AC5)", () => {
    expect(() => parseDuration("   ")).toThrow(RangeError);
  });

  // AC5: parseDuration('5x') throws a RangeError whose message names the bad input.
  it("throws RangeError naming the bad input on an unknown unit (AC5)", () => {
    expect(() => parseDuration("5x")).toThrow(RangeError);
    expect(() => parseDuration("5x")).toThrow("5x");
  });

  it("throws RangeError when any segment is invalid", () => {
    expect(() => parseDuration("1h5x")).toThrow(RangeError);
  });

  // AC6: parseDuration is exported from the package entry point and importable by name.
  it("is exported by name from the entry point (AC6)", () => {
    expect(typeof parseDuration).toBe("function");
  });
});
