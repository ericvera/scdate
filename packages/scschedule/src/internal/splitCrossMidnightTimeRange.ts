import { isAfterTime, sTime } from 'scdate'
import type { TimeRange } from './types.js'

/**
 * Splits a time range that crosses midnight into two same-day ranges.
 */
export const splitCrossMidnightTimeRange = (
  timeRange: TimeRange,
): TimeRange[] => {
  // Check if range crosses midnight
  if (isAfterTime(timeRange.to, timeRange.from)) {
    // Same day range — construct a new object to strip extra fields (e.g.,
    // weekdays) when callers pass a WeeklyScheduleRule as a TimeRange.
    return [{ from: timeRange.from, to: timeRange.to }]
  }

  // Cross-midnight range: split into two periods
  return [
    {
      from: timeRange.from,
      to: sTime('23:59'),
    },
    {
      from: sTime('00:00'),
      to: timeRange.to,
    },
  ]
}
