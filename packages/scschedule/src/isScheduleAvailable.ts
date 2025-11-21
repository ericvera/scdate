import type { STimestamp } from 'scdate'
import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getDateFromTimestamp,
  getTimeFromTimestamp,
  getWeekdayFromDate,
} from 'scdate'
import { getApplicableRuleForDate } from './internal/getApplicableRuleForDate.js'
import { isTimeInTimeRange } from './internal/isTimeInTimeRange.js'
import type { Schedule } from './types.js'

/**
 * Checks if a schedule is available at the specified timestamp.
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

  // Check if any rule's time ranges include this timestamp (same-day check)
  const matchesSameDay = rules.some((rule) => {
    // Check if this weekday is in the rule
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
      return false
    }

    // Check if any time range matches
    return rule.times.some((timeRange) =>
      isTimeInTimeRange(time, timeRange, true),
    )
  })

  if (matchesSameDay) {
    return true
  }

  // Also check previous day's rules for cross-midnight spillover
  const previousDate = addDaysToDate(date, -1)
  const previousWeekday = getWeekdayFromDate(previousDate)
  const { rules: previousRules } = getApplicableRuleForDate(
    schedule,
    previousDate.date,
  )

  return previousRules.some((rule) => {
    // Check if previous day's weekday is in the rule
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
      return false
    }

    // Check if any time range matches (next-day portion)
    return rule.times.some((timeRange) =>
      isTimeInTimeRange(time, timeRange, false),
    )
  })
}
