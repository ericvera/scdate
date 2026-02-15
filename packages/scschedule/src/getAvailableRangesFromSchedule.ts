import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getTimestampFromDateAndTime,
  getWeekdayFromDate,
  isAfterTime,
  isSameDateOrBefore,
  type SDate,
} from 'scdate'
import { getApplicableRuleForDate } from './internal/getApplicableRuleForDate.js'
import type { AvailabilityRange, Schedule } from './types.js'

/**
 * Returns all available time ranges within a schedule for the specified
 * date range.
 *
 * Iterates day-by-day from startDate to endDate (inclusive). For each day,
 * when rules are `true` (always available), emits a full-day range
 * (00:00-23:59). Otherwise, emits each matching time range, including
 * cross-midnight ranges that extend into the next day.
 *
 * @param schedule The schedule to get availability from.
 * @param startDate The start of the date range (inclusive).
 * @param endDate The end of the date range (inclusive).
 * @returns An array of availability ranges within the date range.
 */
export const getAvailableRangesFromSchedule = (
  schedule: Schedule,
  startDate: SDate | string,
  endDate: SDate | string,
): AvailabilityRange[] => {
  const ranges: AvailabilityRange[] = []

  // Walk through each day in the date range
  let currentDate = startDate

  while (isSameDateOrBefore(currentDate, endDate)) {
    const weekday = getWeekdayFromDate(currentDate)
    const { rules } = getApplicableRuleForDate(schedule, currentDate)

    // If weekly is true, the entire day is available
    if (rules === true) {
      ranges.push({
        from: getTimestampFromDateAndTime(currentDate, '00:00'),
        to: getTimestampFromDateAndTime(currentDate, '23:59'),
      })

      currentDate = addDaysToDate(currentDate, 1)

      continue
    }

    // Find all time ranges for this day
    for (const rule of rules) {
      // Skip if this weekday is not in the rule
      if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
        continue
      }

      // Handle cross-midnight ranges (from > to means it crosses midnight)
      const isCrossMidnight = isAfterTime(rule.from, rule.to)
      const rangeStart = getTimestampFromDateAndTime(currentDate, rule.from)
      const rangeEnd = isCrossMidnight
        ? getTimestampFromDateAndTime(addDaysToDate(currentDate, 1), rule.to)
        : getTimestampFromDateAndTime(currentDate, rule.to)

      ranges.push({
        from: rangeStart,
        to: rangeEnd,
      })
    }

    // Move to the next day
    currentDate = addDaysToDate(currentDate, 1)
  }

  return ranges
}
