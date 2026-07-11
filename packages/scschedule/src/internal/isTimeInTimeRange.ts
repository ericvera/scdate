import { getTimeInMinutes } from 'scdate'
import type { STime, STimeString } from 'scdate'
import { getMinuteIntervalsFromTimeRange } from './getMinuteIntervalsFromTimeRange.js'
import type { TimeRange } from './types.js'

/**
 * Checks if a time falls within a time range (`from` inclusive, `to`
 * exclusive), with support for cross-midnight ranges (next-day portion).
 */
export const isTimeInTimeRange = (
  time: STime | STimeString,
  timeRange: TimeRange,
  onSameDay: boolean,
): boolean => {
  const timeInMinutes = getTimeInMinutes(time)

  const { sameDay, nextDay } = getMinuteIntervalsFromTimeRange(timeRange)

  // For same-day check, use the same-day interval
  // For next-day check (cross-midnight spillover), use the next-day interval
  // if it exists
  const interval = onSameDay ? sameDay : nextDay

  if (!interval) {
    return false
  }

  return timeInMinutes >= interval.from && timeInMinutes < interval.to
}
