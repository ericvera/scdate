import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getDateFromTimestamp,
  getTimeFromTimestamp,
  getTimestampFromDateAndTime,
  getWeekdayFromDate,
  isAfterTime,
  isBeforeTime,
  sTimestamp,
  type STime,
  type STimestamp,
} from 'scdate'
import { getApplicableRuleForDate } from './internal/getApplicableRuleForDate.js'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule, STimeString } from './types.js'

/**
 * Finds the next available timestamp in a schedule starting from the
 * specified timestamp.
 *
 * This function searches forward from the given timestamp to find when the
 * schedule next becomes available. It handles:
 * - Same-day availability (finding the next time range on the current day)
 * - Cross-midnight spillover (ranges that extend past midnight are detected
 *   via isScheduleAvailable)
 * - Date overrides (temporary schedule changes)
 * - Multi-day gaps (e.g., weekends or holiday closures)
 *
 * The algorithm works by:
 * 1. Checking if fromTimestamp is already available (including spillover from
 *    the previous day's cross-midnight ranges)
 * 2. If not, finding the earliest time range start on the current day that
 *    occurs after fromTimestamp
 * 3. If no ranges found on current day, moving to the next day and repeating
 *
 * Note: Spillover ranges don't need explicit tracking because:
 * - If we're currently in a spillover period, step 1 returns immediately
 * - If spillover has ended, we find the next time range start on the current
 *   day
 * - The "next available" time is always a time range start, never a spillover
 *   timestamp
 *
 * @param schedule - The schedule to check availability against
 * @param fromTimestamp - The starting timestamp to search from
 * @param maxDaysToSearch - Maximum number of days to search forward (default:
 *   365)
 * @returns The next available timestamp, or undefined if none found within
 *   the search window
 *
 * @example
 * // Schedule: Mon-Fri 09:00-17:00
 * // Query: Tuesday at 08:00
 * // Returns: Tuesday at 09:00
 *
 * @example
 * // Schedule: Mon-Fri 09:00-17:00
 * // Query: Saturday at 10:00
 * // Returns: Monday at 09:00
 *
 * @example
 * // Schedule: Thu-Sat 22:00-02:00 (cross-midnight)
 * // Query: Friday at 01:00
 * // Returns: Friday at 01:00 (already in spillover from Thursday)
 *
 * @example
 * // Custom search window: only search 30 days ahead
 * getNextAvailableFromSchedule(schedule, timestamp, 30)
 */
export const getNextAvailableFromSchedule = (
  schedule: Schedule,
  fromTimestamp: STimestamp | string,
  maxDaysToSearch = 365,
): STimestamp | undefined => {
  const initialTimestamp = sTimestamp(fromTimestamp)

  // Check if already available at fromTimestamp (handles spillover too)
  if (isScheduleAvailable(schedule, initialTimestamp)) {
    return initialTimestamp
  }

  // Search forward day by day, starting from the date of fromTimestamp
  let currentDate = getDateFromTimestamp(initialTimestamp)
  const fromTime = getTimeFromTimestamp(initialTimestamp)

  for (let day = 0; day < maxDaysToSearch; day++) {
    const weekday = getWeekdayFromDate(currentDate)
    const { rules } = getApplicableRuleForDate(schedule, currentDate.date)

    // Track earliest time
    let earliestTime: STime | STimeString | undefined

    for (const rule of rules) {
      if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
        continue
      }

      for (const timeRange of rule.times) {
        // Day 0: only consider ranges starting after fromTimestamp's time
        // Day 1+: consider all ranges (any start time qualifies)
        if (day === 0 && !isAfterTime(timeRange.from, fromTime)) {
          continue
        }

        if (!earliestTime || isBeforeTime(timeRange.from, earliestTime)) {
          earliestTime = timeRange.from
        }
      }
    }

    if (earliestTime) {
      return getTimestampFromDateAndTime(currentDate, earliestTime)
    }

    // Move to next date
    currentDate = addDaysToDate(currentDate, 1)
  }

  return undefined
}
