import { describe, it, expect } from "vitest";

// Import through the package entry point ('.' -> ./src/index.ts) so the whole
// suite exercises the named export required by AC6, not just the module file.
import { parseDuration } from "abs-test";

describe("parseDuration", () => {
  describe("acceptance criteria", () => {
    it("AC1: parseDuration('500ms') === 500", () => {
      expect(parseDuration("500ms")).toBe(500);
    });

    it("AC2: parseDuration('2s') === 2000", () => {
      expect(parseDuration("2s")).toBe(2000);
    });

    it("AC3: parseDuration('1h30m') === 5400000", () => {
      expect(parseDuration("1h30m")).toBe(5_400_000);
    });

    it("AC4: parseDuration('  10m ') === 600000 (surrounding whitespace ignored)", () => {
      expect(parseDuration("  10m ")).toBe(600_000);
    });

    it("AC5: parseDuration('') throws a RangeError", () => {
      expect(() => parseDuration("")).toThrow(RangeError);
    });

    it("AC5: parseDuration('5x') throws a RangeError whose message names the bad input", () => {
      expect(() => parseDuration("5x")).toThrow(RangeError);
      // The thrown message must include the offending input string.
      expect(() => parseDuration("5x")).toThrow("5x");
    });

    it("AC6: parseDuration is importable as a named export from the package entry point", () => {
      expect(typeof parseDuration).toBe("function");
    });
  });

  describe("unit table (each unit's millisecond value)", () => {
    const cases: ReadonlyArray<[string, number]> = [
      ["1ms", 1],
      ["1s", 1_000],
      ["1m", 60_000],
      ["1h", 3_600_000],
      ["1d", 86_400_000],
    ];

    it.each(cases)("parseDuration('%s') === %i", (input, expected) => {
      expect(parseDuration(input)).toBe(expected);
    });

    it("scales the numeric multiplier per unit", () => {
      expect(parseDuration("500ms")).toBe(500);
      expect(parseDuration("90s")).toBe(90_000);
      expect(parseDuration("3m")).toBe(180_000);
      expect(parseDuration("2h")).toBe(7_200_000);
      expect(parseDuration("2d")).toBe(172_800_000);
    });
  });

  describe("order-independent summation", () => {
    it("sums concatenated segments regardless of order", () => {
      expect(parseDuration("1h30m")).toBe(5_400_000);
      expect(parseDuration("30m1h")).toBe(5_400_000);
    });

    it("sums whitespace-separated segments equivalently to concatenated ones", () => {
      expect(parseDuration("1h 30m")).toBe(5_400_000);
      expect(parseDuration("1h30m")).toBe(parseDuration("1h 30m"));
      expect(parseDuration("30m 1h")).toBe(5_400_000);
    });

    it("sums many mixed-unit segments in arbitrary order", () => {
      const expected =
        86_400_000 + 7_200_000 + 1_800_000 + 15_000 + 500; // 1d2h30m15s500ms
      expect(parseDuration("1d2h30m15s500ms")).toBe(expected);
      expect(parseDuration("500ms 15s 30m 2h 1d")).toBe(expected);
      expect(parseDuration("15s 1d 500ms 2h 30m")).toBe(expected);
    });
  });

  describe("whitespace handling", () => {
    it("ignores leading and trailing whitespace", () => {
      expect(parseDuration("  10m ")).toBe(600_000);
      expect(parseDuration("\t5s\n")).toBe(5_000);
    });
  });

  describe("returns a whole number of milliseconds", () => {
    it("yields integer results", () => {
      const result = parseDuration("1h30m");
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe("rejection rules", () => {
    it("throws RangeError on empty input after trimming", () => {
      expect(() => parseDuration("")).toThrow(RangeError);
      expect(() => parseDuration("   ")).toThrow(RangeError);
    });

    it("throws RangeError on an unknown unit", () => {
      expect(() => parseDuration("5x")).toThrow(RangeError);
    });

    it("throws RangeError on a segment missing a unit", () => {
      expect(() => parseDuration("10")).toThrow(RangeError);
    });

    it("throws RangeError on a unit missing a number", () => {
      expect(() => parseDuration("ms")).toThrow(RangeError);
    });

    it("throws RangeError when a valid segment is followed by garbage", () => {
      expect(() => parseDuration("1h5x")).toThrow(RangeError);
    });

    it("error message includes the offending input string", () => {
      expect(() => parseDuration("5x")).toThrow("5x");
      expect(() => parseDuration("10minutes")).toThrow("10minutes");
    });
  });
});
