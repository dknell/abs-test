/**
 * Maps each supported duration unit to its length in milliseconds.
 */
const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Matches a single `<number><unit>` segment. The unit alternation lists `ms`
 * before `m`/`s` so the longer unit wins (e.g. `500ms` parses as 500 × `ms`,
 * not 500 × `m` followed by a stray `s`).
 */
const SEGMENT_PATTERN = /(\d+)(ms|s|m|h|d)/g;

/**
 * Validates that the entire (already-trimmed) input is one or more valid
 * segments, optionally separated by whitespace, and nothing else.
 */
const FULL_PATTERN = /^(?:\d+(?:ms|s|m|h|d)\s*)+$/;

/**
 * Parse a human-readable duration string into a whole number of milliseconds.
 *
 * Accepts one or more `<number><unit>` segments, optionally separated by
 * whitespace and in any order, and sums them. Supported units: `ms`, `s`
 * (1000ms), `m` (60000ms), `h` (3600000ms), `d` (86400000ms). Surrounding
 * whitespace is ignored.
 *
 * @throws {RangeError} If the input is empty or contains any segment that is
 *   not a `<number><unit>` pair with a known unit. The error message includes
 *   the offending input.
 */
export function parseDuration(input: string): number {
  const normalized = input.trim();

  if (normalized === "" || !FULL_PATTERN.test(normalized)) {
    throw new RangeError(`Invalid duration: ${JSON.stringify(input)}`);
  }

  let totalMs = 0;
  for (const match of normalized.matchAll(SEGMENT_PATTERN)) {
    const value = Number(match[1]);
    const unit = match[2];
    totalMs += value * UNIT_TO_MS[unit];
  }

  return totalMs;
}
