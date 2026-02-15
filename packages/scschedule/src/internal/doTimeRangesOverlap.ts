import { isAfterTime, isSameTimeOrBefore } from 'scdate'
import type { TimeRange } from './types.js'

/**
 * Checks if two time ranges overlap when both start on the same day.
 *
 * For cross-midnight ranges, the range extends to the next day.
 * For example, if both ranges are for "Thursday":
 * - [22:00-02:00] means Thursday 22:00 to Friday 02:00
 * - [01:00-03:00] means Thursday 01:00 to Thursday 03:00
 * These do NOT overlap.
 *
 * But:
 * - [20:00-02:00] means Thursday 20:00 to Friday 02:00
 * - [22:00-03:00] means Thursday 22:00 to Friday 03:00
 * These DO overlap from Thursday 22:00 to Friday 02:00.
 */
export const doTimeRangesOverlap = (
  range1: TimeRange,
  range2: TimeRange,
): boolean => {
  const r1CrossesMidnight = isAfterTime(range1.from, range1.to)
  const r2CrossesMidnight = isAfterTime(range2.from, range2.to)

  // Case 1: Neither crosses midnight
  // Simple overlap check: r1.from <= r2.to AND r2.from <= r1.to
  if (!r1CrossesMidnight && !r2CrossesMidnight) {
    return (
      isSameTimeOrBefore(range1.from, range2.to) &&
      isSameTimeOrBefore(range2.from, range1.to)
    )
  }

  // Case 2: Only range1 crosses midnight
  // r1 covers: [r1.from - 23:59] on day D and [00:00 - r1.to] on day D+1
  // r2 covers: [r2.from - r2.to] on day D
  // They overlap if r2 starts before midnight AND (r2.from <= 23:59 AND
  // r1.from <= r2.to)
  if (r1CrossesMidnight && !r2CrossesMidnight) {
    // r2 is entirely on day D, r1 starts on day D and ends on day D+1
    // Overlap if r2.from is after or equal to r1.from (both on day D)
    // OR if r2.to extends to where r1.from starts
    return isSameTimeOrBefore(range1.from, range2.to)
  }

  // Case 3: Only range2 crosses midnight (symmetric to case 2)
  if (!r1CrossesMidnight && r2CrossesMidnight) {
    return isSameTimeOrBefore(range2.from, range1.to)
  }

  // Case 4: Both cross midnight
  // Both ranges extend from day D to day D+1
  // r1: [r1.from - 23:59] on D, [00:00 - r1.to] on D+1
  // r2: [r2.from - 23:59] on D, [00:00 - r2.to] on D+1
  // They always overlap because:
  // - If r1.from <= r2.from, they overlap from r2.from onwards on day D
  // - If r2.from <= r1.from, they overlap from r1.from onwards on day D
  // - They both cover midnight, so they overlap there
  return true
}
