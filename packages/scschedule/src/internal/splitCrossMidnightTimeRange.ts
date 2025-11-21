import { isAfterTime, sTime } from 'scdate'
import type { TimeRange } from '../types.js'

/**
 * Splits a time range that crosses midnight into two same-day ranges.
 */
export const splitCrossMidnightTimeRange = (
  timeRange: TimeRange,
): TimeRange[] => {
  // Check if range crosses midnight
  if (isAfterTime(timeRange.to, timeRange.from)) {
    // Same day range
    return [timeRange]
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
