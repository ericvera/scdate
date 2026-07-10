import { getTimeInMinutes } from 'scdate'
import type { MinuteInterval, TimeRange } from './types.js'

/**
 * Number of minutes in a day. Used as the exclusive end-of-day boundary in
 * minute intervals.
 */
export const MinutesInDay = 1440

/**
 * The per-day minute intervals covered by a time range.
 */
export interface TimeRangeMinuteIntervals {
  /** Portion of the range on the day the rule applies to */
  sameDay: MinuteInterval
  /**
   * Portion that spills past midnight into the next day. Only present for
   * ranges that wrap past midnight (`from` at or after `to`, with a `to`
   * other than 00:00).
   */
  nextDay?: MinuteInterval
}

/**
 * Converts a time range into half-open minute intervals (`from` inclusive,
 * `to` exclusive).
 *
 * A `to` of 00:00 is treated as the end of the day (1440), so a range like
 * 22:00-00:00 runs to midnight without spilling into the next day, and
 * 00:00-00:00 covers the entire day. For any other time, `from` at or after
 * `to` wraps past midnight (`from` equal to `to` covers a full 24 hours).
 */
export const getMinuteIntervalsFromTimeRange = (
  timeRange: TimeRange,
): TimeRangeMinuteIntervals => {
  const from = getTimeInMinutes(timeRange.from)
  const to = getTimeInMinutes(timeRange.to, true)

  if (from < to) {
    return { sameDay: { from, to } }
  }

  // Wraps past midnight (from === to means a full 24 hours)
  return {
    sameDay: { from, to: MinutesInDay },
    nextDay: { from: 0, to },
  }
}
