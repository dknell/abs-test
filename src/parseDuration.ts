const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

// Matches a single `<number><unit>` segment. `ms` is listed before `s`/`m`
// so the two-character unit wins when both could match.
const SEGMENT_PATTERN = /(\d+)(ms|s|m|h|d)/g;

/**
 * Parse a human-readable duration string into a whole number of milliseconds.
 *
 * Accepts one or more `<number><unit>` segments in any order, optionally
 * separated by whitespace (e.g. `1h30m`, `1h 30m`, and `30m1h` all equal
 * `5400000`). Supported units: `ms`, `s`, `m`, `h`, `d`.
 *
 * @throws {RangeError} if the input is empty or contains a malformed segment.
 *   The error message includes the offending input string.
 */
export function parseDuration(input: string): number {
  // Trim surrounding whitespace and ignore any inter-segment whitespace.
  const compact = input.trim().replace(/\s+/g, "");

  if (compact === "") {
    throw new RangeError(`Invalid duration: "${input}"`);
  }

  const segments = [...compact.matchAll(SEGMENT_PATTERN)];

  // Fail closed: the matched segments must reconstruct the whole input,
  // otherwise some part was not a valid `<number><unit>` pair.
  if (segments.map((match) => match[0]).join("") !== compact) {
    throw new RangeError(`Invalid duration: "${input}"`);
  }

  return segments.reduce(
    (total, [, value, unit]) => total + Number(value) * UNIT_TO_MS[unit],
    0,
  );
}
