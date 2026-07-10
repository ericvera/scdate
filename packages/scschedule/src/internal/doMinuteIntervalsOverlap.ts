import type { MinuteInterval } from './types.js'

/**
 * Checks if two half-open minute intervals overlap. Intervals that merely
 * touch (one's `to` equals the other's `from`) do not overlap.
 */
export const doMinuteIntervalsOverlap = (
  interval1: MinuteInterval,
  interval2: MinuteInterval,
): boolean => interval1.from < interval2.to && interval2.from < interval1.to
