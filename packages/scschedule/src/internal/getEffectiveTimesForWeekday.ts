import { doesWeekdaysIncludeWeekday, getPreviousWeekday, Weekday } from 'scdate'
import type { TimeRange, WeeklyScheduleRule } from '../types.js'
import { splitCrossMidnightTimeRange } from './splitCrossMidnightTimeRange.js'

/**
 * Gets the effective time ranges that apply to a specific weekday for a given
 * rule, accounting for both direct ranges and cross-midnight spillover from
 * the previous day.
 *
 * @param rule The weekly schedule rule to analyze
 * @param weekday The weekday to analyze
 * @returns Array of time ranges that apply to this weekday
 */
export const getEffectiveTimesForWeekday = (
  rule: WeeklyScheduleRule,
  weekday: Weekday,
): TimeRange[] => {
  const effectiveTimes: TimeRange[] = []
  const previousWeekday = getPreviousWeekday(weekday)

  // Check if this weekday is directly included in the rule's weekdays
  if (doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
    // Add all time ranges for this weekday
    rule.times.forEach((timeRange) => {
      const splitRanges = splitCrossMidnightTimeRange(timeRange)

      if (splitRanges.length > 0 && splitRanges[0]) {
        effectiveTimes.push(splitRanges[0])
      }
    })
  }

  // Check if previous weekday has cross-midnight ranges that spill into this
  // weekday.
  //
  // Note: For override rules with date ranges, the schedule should be
  // normalized first (via normalizeScheduleForValidation) to filter weekdays to
  // only those that occur in the date range. This ensures spillover is only
  // included from days that actually exist in the override period.
  if (doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
    rule.times.forEach((timeRange) => {
      const splitRanges = splitCrossMidnightTimeRange(timeRange)

      // If there are 2 ranges, the second one is the spillover to next day
      if (splitRanges.length === 2 && splitRanges[1]) {
        effectiveTimes.push(splitRanges[1])
      }
    })
  }

  return effectiveTimes
}
