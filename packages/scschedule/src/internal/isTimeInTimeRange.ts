import { isSameTimeOrAfter, isSameTimeOrBefore, type STime } from 'scdate'
import type { STimeString } from '../types.js'
import type { TimeRange } from './types.js'
import { splitCrossMidnightTimeRange } from './splitCrossMidnightTimeRange.js'

/**
 * Checks if a time falls within a time range, with support for
 * cross-midnight ranges (next-day portion).
 */
export const isTimeInTimeRange = (
  time: STime | STimeString,
  timeRange: TimeRange,
  onSameDay: boolean,
): boolean => {
  const ranges = splitCrossMidnightTimeRange(timeRange)

  // For same-day check, only check the first range
  // For next-day check (cross-midnight spillover),
  // only check the second range if it exists
  const rangeToCheck = onSameDay ? ranges[0] : ranges[1]

  if (!rangeToCheck) {
    return false
  }

  // Check if time is within range (inclusive)
  return (
    isSameTimeOrAfter(time, rangeToCheck.from) &&
    isSameTimeOrBefore(time, rangeToCheck.to)
  )
}
