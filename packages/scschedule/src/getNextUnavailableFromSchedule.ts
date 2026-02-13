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
  type SDate,
  type STime,
  type STimestamp,
} from 'scdate'
import { getApplicableRuleForDate } from './internal/getApplicableRuleForDate.js'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule, STimeString, WeeklyScheduleRule } from './types.js'

/**
 * Collects "range end + 1 minute" candidate timestamps for a given date's
 * rules. For cross-midnight ranges, the candidate falls on the next day.
 * When afterTime is provided, regular (non-cross-midnight) ranges ending
 * before afterTime are excluded.
 */
const collectRangeEndCandidates = (
  rules: WeeklyScheduleRule[],
  date: SDate,
  timezone: string,
  afterTime?: STime | STimeString,
): STimestamp[] => {
  const candidates: STimestamp[] = []
  const weekday = getWeekdayFromDate(date)

  for (const rule of rules) {
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
      continue
    }

    for (const timeRange of rule.times) {
      if (isAfterTime(timeRange.from, timeRange.to)) {
        // Cross-midnight range ends tomorrow
        const tomorrow = addDaysToDate(date, 1)
        const rangeEnd = getTimestampFromDateAndTime(tomorrow, timeRange.to)
        candidates.push(addMinutesToTimestamp(rangeEnd, 1, timezone))
      } else {
        if (afterTime && !isSameTimeOrAfter(timeRange.to, afterTime)) {
          continue
        }

        const rangeEnd = getTimestampFromDateAndTime(date, timeRange.to)
        candidates.push(addMinutesToTimestamp(rangeEnd, 1, timezone))
      }
    }
  }

  return candidates
}

/**
 * Collects candidate timestamps from the previous day's cross-midnight ranges
 * that spill into the current date. Only includes spillover endings at or
 * after afterTime.
 */
const collectSpilloverCandidates = (
  schedule: Schedule,
  currentDate: SDate,
  afterTime: STime | STimeString,
): STimestamp[] => {
  const candidates: STimestamp[] = []
  const previousDate = addDaysToDate(currentDate, -1)
  const previousWeekday = getWeekdayFromDate(previousDate)
  const previousResult = getApplicableRuleForDate(schedule, previousDate.date)

  if (previousResult.rules === true) {
    return candidates
  }

  for (const rule of previousResult.rules) {
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
      continue
    }

    for (const timeRange of rule.times) {
      // Only cross-midnight ranges (from > to) spill into today
      if (!isAfterTime(timeRange.from, timeRange.to)) {
        continue
      }

      if (!isSameTimeOrAfter(timeRange.to, afterTime)) {
        continue
      }

      const rangeEnd = getTimestampFromDateAndTime(currentDate, timeRange.to)
      candidates.push(addMinutesToTimestamp(rangeEnd, 1, schedule.timezone))
    }
  }

  return candidates
}

/**
 * Sorts timestamps chronologically and returns the first one where the
 * schedule is unavailable, or undefined if all are available.
 */
const findFirstUnavailableTimestamp = (
  schedule: Schedule,
  candidates: STimestamp[],
): STimestamp | undefined => {
  candidates.sort((a, b) => (isBeforeTimestamp(a, b) ? -1 : 1))

  for (const candidate of candidates) {
    if (!isScheduleAvailable(schedule, candidate)) {
      return candidate
    }
  }

  return undefined
}

/**
 * Finds the next unavailable timestamp in a schedule starting from the
 * specified timestamp.
 *
 * This function searches forward from the given timestamp to find when the
 * schedule next becomes unavailable. It handles:
 * - Always-available schedules (`weekly: true`) by searching for overrides
 * - Same-day unavailability (gaps between time ranges or after the last range)
 * - Cross-midnight ranges (unavailability after a range that crosses midnight)
 * - Date overrides (temporary closures)
 *
 * The algorithm works by:
 * 1. Checking if fromTimestamp is already unavailable
 * 2. If `weekly` is `true`, searching forward day-by-day for an override that
 *    closes availability
 * 3. Otherwise, collecting all potential "end of availability" candidates from:
 *    - Previous day's cross-midnight spillover (ends today at `to` time)
 *    - Current day's regular ranges (end today at `to` time)
 *    - Current day's cross-midnight ranges (end tomorrow at `to` time)
 * 4. Sorting candidates and returning the earliest one that's unavailable
 *
 * Note: For rule-based schedules, no day-by-day iteration is needed because if
 * available, the current range ends within at most ~48 hours (cross-midnight).
 *
 * @param schedule - The schedule to check availability against
 * @param fromTimestamp - The starting timestamp to search from
 * @param maxDaysToSearch - Maximum number of days to search forward
 * @returns The next unavailable timestamp, or undefined if no unavailability
 *   is found within the search window
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
 *
 * @example
 * // Schedule: weekly: true, override closing Dec 25
 * // Query: Dec 20 at 10:00
 * // Returns: Dec 25 at 00:00
 */
export const getNextUnavailableFromSchedule = (
  schedule: Schedule,
  fromTimestamp: STimestamp | string,
  maxDaysToSearch: number,
): STimestamp | undefined => {
  const initialTimestamp = sTimestamp(fromTimestamp)

  // Check if already unavailable at fromTimestamp
  if (!isScheduleAvailable(schedule, initialTimestamp)) {
    return initialTimestamp
  }

  const currentDate = getDateFromTimestamp(initialTimestamp)
  const fromTime = getTimeFromTimestamp(initialTimestamp)

  // When weekly is true (always available), search forward for an override
  // that closes availability.
  const initialResult = getApplicableRuleForDate(schedule, currentDate.date)

  if (initialResult.rules === true) {
    // rules === true implies source === 'weekly', so skip current date
    // and start searching from the next day.
    let searchDate = addDaysToDate(currentDate, 1)

    for (let day = 1; day < maxDaysToSearch; day++) {
      const result = getApplicableRuleForDate(schedule, searchDate.date)

      // If we are here it means that weekly is true, so we need to search for
      // an override that closes availability.
      if (result.source === 'override') {
        const dayStart = getTimestampFromDateAndTime(searchDate, '00:00')

        const nextUnavailable = findFirstUnavailableTimestamp(schedule, [
          dayStart,
          ...collectRangeEndCandidates(
            result.rules,
            searchDate,
            schedule.timezone,
          ),
        ])

        if (nextUnavailable) {
          return nextUnavailable
        }
      }

      searchDate = addDaysToDate(searchDate, 1)
    }

    return undefined
  }

  // Collect candidates from previous day's cross-midnight spillover and
  // current day's ranges, then return the earliest unavailable one.
  const { rules } = getApplicableRuleForDate(schedule, currentDate.date)

  if (rules === true) {
    return undefined
  }

  return findFirstUnavailableTimestamp(schedule, [
    ...collectSpilloverCandidates(schedule, currentDate, fromTime),
    ...collectRangeEndCandidates(
      rules,
      currentDate,
      schedule.timezone,
      fromTime,
    ),
  ])
}
