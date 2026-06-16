/**
 * Milliseconds-per-unit lookup for every supported duration unit.
 *
 * Order does not matter at runtime, but `ms` must be tried before `m`/`s`
 * during tokenization (see the alternation in {@link parseDuration}).
 */
const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parse a human-readable duration string into a whole number of milliseconds.
 *
 * The input is one or more `<number><unit>` segments, optionally separated by
 * whitespace, summed together. Segments may appear in any order, so `1h30m`,
 * `1h 30m`, and `30m1h` all resolve to the same total. Supported units are
 * `ms`, `s`, `m`, `h`, and `d`.
 *
 * @param input - The duration string, e.g. `"1h30m"` or `"  10m "`.
 * @returns The total duration in milliseconds.
 * @throws {RangeError} If the input is empty after trimming, or contains any
 *   segment that is not a `<number><unit>` pair with a known unit. The error
 *   message includes the offending input string.
 */
export function parseDuration(input: string): number {
  // Collapse all whitespace so separated and concatenated segments parse the
  // same way (`"1h 30m"` and `"1h30m"` are equivalent).
  const compact = input.replace(/\s+/g, "");

  if (compact === "") {
    throw new RangeError(`Invalid duration: ${JSON.stringify(input)}`);
  }

  // Sticky regex: each match must continue immediately where the last one
  // ended, so any unparseable character leaves a gap and is rejected. `ms`
  // precedes `s`/`m` in the alternation so the two-character unit wins.
  const segment = /(\d+)(ms|s|m|h|d)/y;

  let totalMs = 0;
  let position = 0;
  while (position < compact.length) {
    segment.lastIndex = position;
    const match = segment.exec(compact);
    if (match === null) {
      throw new RangeError(`Invalid duration: ${JSON.stringify(input)}`);
    }

    const value = Number(match[1]);
    const unit = match[2];
    totalMs += value * UNIT_TO_MS[unit];
    position = segment.lastIndex;
  }

  return totalMs;
}
