import type { STimestamp } from 'scdate'
import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getDateFromTimestamp,
  getTimeFromTimestamp,
  getWeekdayFromDate,
} from 'scdate'
import { getApplicableRuleForDate } from './getApplicableRuleForDate.js'
import { isTimeInTimeRange } from './internal/isTimeInTimeRange.js'
import type { Schedule } from './types.js'

/**
 * Checks if a schedule is available at the specified timestamp.
 *
 * When `weekly` is `true`, the schedule is always available (unless an
 * override applies). Otherwise, checks whether the timestamp falls within any
 * matching time range for the day, including cross-midnight spillover from the
 * previous day.
 *
 * @param schedule The schedule to check availability against.
 * @param timestamp The timestamp to check.
 * @returns True if the schedule is available at the given timestamp.
 */
export const isScheduleAvailable = (
  schedule: Schedule,
  timestamp: STimestamp | string,
): boolean => {
  const date = getDateFromTimestamp(timestamp)
  const time = getTimeFromTimestamp(timestamp)
  const weekday = getWeekdayFromDate(date)

  // Get the applicable rules for this date
  const { rules } = getApplicableRuleForDate(schedule, date.date)

  // If weekly is true, always available (unless overridden)
  if (rules === true) {
    return true
  }

  // Check if any rule's time ranges include this timestamp (same-day check)
  const matchesSameDay = rules.some((rule) => {
    // Check if this weekday is in the rule
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
      return false
    }

    // Check if time range matches
    return isTimeInTimeRange(time, rule, true)
  })

  if (matchesSameDay) {
    return true
  }

  // Also check previous day's rules for cross-midnight spillover
  const previousDate = addDaysToDate(date, -1)
  const previousWeekday = getWeekdayFromDate(previousDate)
  const previousResult = getApplicableRuleForDate(schedule, previousDate.date)

  // If previous day was always available, no cross-midnight rules to check
  if (previousResult.rules === true) {
    return false
  }

  return previousResult.rules.some((rule) => {
    // Check if previous day's weekday is in the rule
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
      return false
    }

    // Check if time range matches (next-day portion)
    return isTimeInTimeRange(time, rule, false)
  })
}
