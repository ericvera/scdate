import { DayToWeekday, Weekday } from 'scdate'
import type { WeeklyScheduleRule } from '../types.js'
import { doTimeRangesOverlap } from './doTimeRangesOverlap.js'
import { getEffectiveTimesForWeekday } from './getEffectiveTimesForWeekday.js'

/**
 * Checks if two weekly schedule rules have any overlapping weekdays and time
 * ranges, accounting for cross-midnight spillover.
 *
 * When checking rules within an override, expects the rules to already have
 * weekdays filtered to only those that occur in the override's date range
 * (via normalizeScheduleForValidation).
 *
 * @param rule1 First rule to compare
 * @param rule2 Second rule to compare
 * @returns The weekday where overlap occurs, or undefined if no overlap
 */
export const doRulesOverlap = (
  rule1: WeeklyScheduleRule,
  rule2: WeeklyScheduleRule,
): Weekday | undefined => {
  // Check each possible weekday
  for (const weekday of DayToWeekday) {
    const rule1Times = getEffectiveTimesForWeekday(rule1, weekday)
    const rule2Times = getEffectiveTimesForWeekday(rule2, weekday)

    // If both rules have times on this weekday, check for overlaps
    if (rule1Times.length > 0 && rule2Times.length > 0) {
      // Check all pairs of time ranges
      for (const time1 of rule1Times) {
        for (const time2 of rule2Times) {
          if (doTimeRangesOverlap(time1, time2)) {
            // Found an overlap - return the weekday
            return weekday
          }
        }
      }
    }
  }

  return undefined
}
