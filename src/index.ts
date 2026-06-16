const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

// A single `<number><unit>` segment. `ms` is listed before `s`/`m` so the
// alternation prefers the two-character unit when it applies.
const SEGMENT = /(\d+(?:\.\d+)?)(ms|s|m|h|d)/y;
const WHITESPACE = /\s+/y;

/**
 * Parse a human-readable duration string into a whole number of milliseconds.
 *
 * Sums one or more `<number><unit>` segments (order-independent), optionally
 * separated by whitespace. Supported units: ms, s, m, h, d.
 *
 * @throws {RangeError} if the input is empty (after trimming) or contains a
 *   segment that is not a `<number><unit>` pair with a known unit.
 */
export function parseDuration(input: string): number {
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new RangeError(`Cannot parse duration from empty input: ${JSON.stringify(input)}`);
  }

  let total = 0;
  let index = 0;

  while (index < trimmed.length) {
    // Skip any whitespace separating segments.
    WHITESPACE.lastIndex = index;
    if (WHITESPACE.test(trimmed)) {
      index = WHITESPACE.lastIndex;
      if (index >= trimmed.length) break;
    }

    SEGMENT.lastIndex = index;
    const match = SEGMENT.exec(trimmed);
    if (match === null) {
      throw new RangeError(`Invalid duration: ${JSON.stringify(input)}`);
    }

    total += Number(match[1]) * UNIT_MS[match[2]];
    index = SEGMENT.lastIndex;
  }

  return total;
}
