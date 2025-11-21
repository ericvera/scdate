import {
  addDaysToDate,
  addMinutesToTimestamp,
  doesWeekdaysIncludeWeekday,
  getDateFromTimestamp,
  getTimeFromTimestamp,
  getTimestampFromDateAndTime,
  getWeekdayFromDate,
  isAfterTime,
  isBeforeTimestamp,
  isSameTimeOrAfter,
  sTimestamp,
  type STimestamp,
} from 'scdate'
import { getApplicableRuleForDate } from './internal/getApplicableRuleForDate.js'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule } from './types.js'

/**
 * Finds the next unavailable timestamp in a schedule starting from the
 * specified timestamp.
 *
 * This function searches forward from the given timestamp to find when the
 * schedule next becomes unavailable. It handles:
 * - Same-day unavailability (gaps between time ranges or after the last range)
 * - Cross-midnight ranges (unavailability after a range that crosses midnight)
 * - Date overrides (temporary closures)
 *
 * The algorithm works by:
 * 1. Checking if fromTimestamp is already unavailable
 * 2. Collecting all potential "end of availability" candidates from:
 *    - Previous day's cross-midnight spillover (ends today at `to` time)
 *    - Current day's regular ranges (end today at `to` time)
 *    - Current day's cross-midnight ranges (end tomorrow at `to` time)
 * 3. Sorting candidates and returning the earliest one that's unavailable
 *
 * Note: No day-by-day iteration is needed because if we're available, we must
 * be in some range, and that range ends within at most 24 hours (or ~48 hours
 * for cross-midnight ranges).
 *
 * @param schedule - The schedule to check availability against
 * @param fromTimestamp - The starting timestamp to search from
 * @returns The next unavailable timestamp, or undefined if always available
 *
 * @example
 * // Schedule: Mon-Fri 09:00-17:00
 * // Query: Tuesday at 10:00
 * // Returns: Tuesday at 17:01 (one minute after closing)
 *
 * @example
 * // Schedule: Mon-Fri 09:00-12:00, 13:00-17:00
 * // Query: Tuesday at 10:00
 * // Returns: Tuesday at 12:01 (lunch break)
 *
 * @example
 * // Schedule: Thu-Sat 20:00-02:00 (cross-midnight)
 * // Query: Thursday at 23:00
 * // Returns: Friday at 02:01 (after shift ends)
 */
export const getNextUnavailableFromSchedule = (
  schedule: Schedule,
  fromTimestamp: STimestamp | string,
): STimestamp | undefined => {
  const initialTimestamp = sTimestamp(fromTimestamp)

  // Check if already unavailable at fromTimestamp
  if (!isScheduleAvailable(schedule, initialTimestamp)) {
    return initialTimestamp
  }

  const currentDate = getDateFromTimestamp(initialTimestamp)
  const fromTime = getTimeFromTimestamp(initialTimestamp)

  // Collect all candidate "end + 1 minute" timestamps
  const candidates: STimestamp[] = []

  // 1. Check previous day's cross-midnight spillover into today
  const previousDate = addDaysToDate(currentDate, -1)
  const previousWeekday = getWeekdayFromDate(previousDate)
  const { rules: previousRules } = getApplicableRuleForDate(
    schedule,
    previousDate.date,
  )

  for (const rule of previousRules) {
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
      continue
    }

    for (const timeRange of rule.times) {
      // Cross-midnight range (from > to) spills into today
      if (!isAfterTime(timeRange.from, timeRange.to)) {
        continue
      }

      // Spillover ends today at timeRange.to
      // Only consider if end is at or after current time
      if (!isSameTimeOrAfter(timeRange.to, fromTime)) {
        continue
      }

      const rangeEnd = getTimestampFromDateAndTime(currentDate, timeRange.to)
      const afterRangeEnd = addMinutesToTimestamp(
        rangeEnd,
        1,
        schedule.timezone,
      )
      candidates.push(afterRangeEnd)
    }
  }

  // 2. Check current day's ranges
  const weekday = getWeekdayFromDate(currentDate)
  const { rules } = getApplicableRuleForDate(schedule, currentDate.date)

  for (const rule of rules) {
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
      continue
    }

    for (const timeRange of rule.times) {
      // Cross-midnight range (from > to) ends TOMORROW
      if (isAfterTime(timeRange.from, timeRange.to)) {
        const tomorrow = addDaysToDate(currentDate, 1)
        const rangeEnd = getTimestampFromDateAndTime(tomorrow, timeRange.to)
        const afterRangeEnd = addMinutesToTimestamp(
          rangeEnd,
          1,
          schedule.timezone,
        )
        candidates.push(afterRangeEnd)
      } else {
        // Regular range ends today - only consider if end >= current time
        if (!isSameTimeOrAfter(timeRange.to, fromTime)) {
          continue
        }

        const rangeEnd = getTimestampFromDateAndTime(currentDate, timeRange.to)
        const afterRangeEnd = addMinutesToTimestamp(
          rangeEnd,
          1,
          schedule.timezone,
        )
        candidates.push(afterRangeEnd)
      }
    }
  }

  // Sort candidates chronologically and find first that's actually unavailable
  candidates.sort((a, b) => (isBeforeTimestamp(a, b) ? -1 : 1))

  for (const candidate of candidates) {
    if (!isScheduleAvailable(schedule, candidate)) {
      return candidate
    }
  }

  return undefined
}
