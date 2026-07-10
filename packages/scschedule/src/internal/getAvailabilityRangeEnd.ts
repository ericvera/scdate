import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getDateFromTimestamp,
  getTimestampFromDateAndTime,
  getWeekdayFromDate,
  isAfterTimestamp,
  isBeforeTimestamp,
  type STimestamp,
} from 'scdate'
import { getApplicableRuleForDate } from '../getApplicableRuleForDate.js'
import { isScheduleAvailable } from '../isScheduleAvailable.js'
import type { Schedule } from '../types.js'
import { getRangeEndTimestamp } from './getRangeEndTimestamp.js'

/**
 * Finds the end (exclusive) of the contiguous availability period containing
 * the given timestamp, which must be available in the schedule.
 *
 * Collects every boundary at which availability could end — each applicable
 * rule's range end (including the previous day's cross-midnight spillover
 * end) and each day's midnight (for always-available days that an override
 * may close) — then returns the earliest boundary at which the schedule is
 * actually unavailable. Boundaries where another range continues seamlessly
 * (its `from` equals the ending range's `to`) are skipped, so adjacent
 * ranges chain into one contiguous period.
 *
 * @param schedule The schedule to search.
 * @param fromTimestamp An available timestamp inside the period.
 * @param maxDaysToSearch Maximum number of days to search forward.
 * @returns The first unavailable timestamp after fromTimestamp, or undefined
 *   if availability does not end within the search window.
 */
export const getAvailabilityRangeEnd = (
  schedule: Schedule,
  fromTimestamp: STimestamp,
  maxDaysToSearch: number,
): STimestamp | undefined => {
  const startDate = getDateFromTimestamp(fromTimestamp)
  const candidates: STimestamp[] = []

  // The previous day's cross-midnight ranges can bound availability today
  const previousDate = addDaysToDate(startDate, -1)
  const previousWeekday = getWeekdayFromDate(previousDate)
  const previousResult = getApplicableRuleForDate(schedule, previousDate.date)

  if (previousResult.rules !== true) {
    for (const rule of previousResult.rules) {
      if (!doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
        continue
      }

      const end = getRangeEndTimestamp(previousDate, rule)

      if (isAfterTimestamp(end, fromTimestamp)) {
        candidates.push(end)
      }
    }
  }

  for (let day = 0; day < maxDaysToSearch; day++) {
    const currentDate = addDaysToDate(startDate, day)

    // Midnight bounds availability when the previous day was fully available
    // (e.g. weekly: true) and this day is not
    if (day > 0) {
      candidates.push(getTimestampFromDateAndTime(currentDate, '00:00'))
    }

    const { rules } = getApplicableRuleForDate(schedule, currentDate.date)

    // Always-available days contribute no range ends
    if (rules === true) {
      continue
    }

    const weekday = getWeekdayFromDate(currentDate)

    for (const rule of rules) {
      if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
        continue
      }

      const end = getRangeEndTimestamp(currentDate, rule)

      if (isAfterTimestamp(end, fromTimestamp)) {
        candidates.push(end)
      }
    }
  }

  candidates.sort((a, b) => (isBeforeTimestamp(a, b) ? -1 : 1))

  for (const candidate of candidates) {
    if (!isScheduleAvailable(schedule, candidate)) {
      return candidate
    }
  }

  return undefined
}
