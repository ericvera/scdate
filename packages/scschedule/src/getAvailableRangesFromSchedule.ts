import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getTimestampFromDateAndTime,
  getWeekdayFromDate,
  isSameDateOrBefore,
} from 'scdate'
import type { SDate } from 'scdate'
import { getApplicableRuleForDate } from './getApplicableRuleForDate.js'
import { getRangeEndTimestamp } from './internal/getRangeEndTimestamp.js'
import type { AvailabilityRange, Schedule } from './types.js'

/**
 * Returns all available time ranges within a schedule for the specified
 * date range.
 *
 * Iterates day-by-day from startDate to endDate (inclusive). For each day,
 * when rules are `true` (always available), emits a full-day range (00:00 up
 * to the next day's 00:00). Otherwise, emits each matching time range,
 * including cross-midnight ranges that extend into the next day. Range ends
 * are exclusive.
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
        to: getTimestampFromDateAndTime(addDaysToDate(currentDate, 1), '00:00'),
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

      ranges.push({
        from: getTimestampFromDateAndTime(currentDate, rule.from),
        to: getRangeEndTimestamp(currentDate, rule),
      })
    }

    // Move to the next day
    currentDate = addDaysToDate(currentDate, 1)
  }

  return ranges
}
