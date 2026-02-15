import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getWeekdayFromDate,
  sDate,
} from 'scdate'
import { ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'
import { doTimeRangesOverlap } from './doTimeRangesOverlap.js'
import { getApplicableRuleForDate } from './getApplicableRuleForDate.js'
import { splitCrossMidnightTimeRange } from './splitCrossMidnightTimeRange.js'

/**
 * Validates that cross-midnight spillover at override boundaries doesn't
 * create overlapping time ranges. Checks:
 * 1. Spillover into override first day (from weekly or previous override)
 * 2. Override last day spillover into next day (weekly, weekly: true, or
 *    another override)
 *
 * Note: Spillover into empty/closed days is allowed (adds availability).
 * Spillover that overlaps with explicit time ranges OR into weekly: true
 * days (which are fully available) is flagged as an error.
 */
export const validateNoSpilloverConflictsAtOverrideBoundaries = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!schedule.overrides) {
    return errors
  }

  // Check each override
  schedule.overrides.forEach((override, overrideIndex) => {
    const firstDate = sDate(override.from)
    const firstDateWeekday = getWeekdayFromDate(firstDate)
    const previousDate = addDaysToDate(firstDate, -1)
    const previousWeekday = getWeekdayFromDate(previousDate)

    // PART 1: Check spillover INTO override first day (for ALL overrides,
    // including indefinite ones)
    // Get rules that apply to previous day (weekly or override)
    const previousDayResult = getApplicableRuleForDate(schedule, previousDate)

    // If previous day is always available (weekly: true), no cross-midnight
    // rules to check
    if (previousDayResult.rules !== true) {
      // Check each rule from previous day for cross-midnight spillover
      previousDayResult.rules.forEach(
        (previousDayRule, previousDayRuleIndex) => {
          // Skip if previous day rule doesn't include previous weekday
          if (
            !doesWeekdaysIncludeWeekday(
              previousDayRule.weekdays,
              previousWeekday,
            )
          ) {
            return
          }

          // Check for cross-midnight
          const splitRanges = splitCrossMidnightTimeRange(previousDayRule)

          // If cross-midnight, splitRanges[1] is the spillover portion
          if (splitRanges.length === 2 && splitRanges[1]) {
            const spilloverRange = splitRanges[1]

            // Check if spillover conflicts with override first day's times
            override.rules.forEach((overrideRule, overrideRuleIndex) => {
              // Does first day match override rule's weekdays?
              if (
                !doesWeekdaysIncludeWeekday(
                  overrideRule.weekdays,
                  firstDateWeekday,
                )
              ) {
                return
              }

              const overrideSplitRanges =
                splitCrossMidnightTimeRange(overrideRule)

              // Check same-day portion of override time range
              const overrideSameDayRange = overrideSplitRanges[0]

              if (
                overrideSameDayRange &&
                doTimeRangesOverlap(spilloverRange, overrideSameDayRange)
              ) {
                // Use source information from getApplicableRuleForDate
                if (previousDayResult.source === 'override') {
                  // Previous day is in an override
                  errors.push({
                    issue:
                      ValidationIssue.SpilloverConflictIntoOverrideFirstDay,
                    overrideIndex,
                    date: firstDate.toJSON(),
                    overrideRuleIndex,
                    sourceOverrideIndex: previousDayResult.overrideIndex,
                    sourceOverrideRuleIndex: previousDayRuleIndex,
                  })
                } else {
                  // Previous day is weekly
                  errors.push({
                    issue:
                      ValidationIssue.SpilloverConflictIntoOverrideFirstDay,
                    overrideIndex,
                    date: firstDate.toJSON(),
                    overrideRuleIndex,
                    sourceWeeklyRuleIndex: previousDayRuleIndex,
                  })
                }
              }
            })
          }
        },
      )
    }

    // PART 2: Check spillover FROM override last day into next day
    // Skip for indefinite overrides (no last day)
    if (!override.to) {
      return
    }

    const lastDate = sDate(override.to)
    const lastDateWeekday = getWeekdayFromDate(lastDate)
    const nextDate = addDaysToDate(lastDate, 1)
    const nextDateWeekday = getWeekdayFromDate(nextDate)

    // Check each override rule for cross-midnight spillover
    override.rules.forEach((overrideRule, overrideRuleIndex) => {
      // Does last day match override rule's weekdays?
      if (!doesWeekdaysIncludeWeekday(overrideRule.weekdays, lastDateWeekday)) {
        return
      }

      // Check for cross-midnight
      const splitRanges = splitCrossMidnightTimeRange(overrideRule)

      // If cross-midnight, splitRanges[1] is the spillover portion
      if (splitRanges.length === 2 && splitRanges[1]) {
        const spilloverRange = splitRanges[1]

        // Get what rule applies to next day
        const nextDayResult = getApplicableRuleForDate(schedule, nextDate)

        // If next day is always available (weekly: true), spillover
        // creates overlapping ranges with the full-day availability.
        if (nextDayResult.rules === true) {
          errors.push({
            issue: ValidationIssue.SpilloverConflictOverrideIntoNext,
            overrideIndex,
            date: lastDate.toJSON(),
            overrideRuleIndex,
          })

          return
        }

        // Check if spillover conflicts with next day's times
        nextDayResult.rules.forEach((nextDayRule, nextDayRuleIndex) => {
          // Does next day match the rule's weekdays?
          if (
            !doesWeekdaysIncludeWeekday(nextDayRule.weekdays, nextDateWeekday)
          ) {
            return
          }

          const nextDaySplitRanges = splitCrossMidnightTimeRange(nextDayRule)

          // Check same-day portion of next day's time range
          const nextDaySameDayRange = nextDaySplitRanges[0]
          if (
            nextDaySameDayRange &&
            doTimeRangesOverlap(spilloverRange, nextDaySameDayRange)
          ) {
            // Use source information from getApplicableRuleForDate
            if (nextDayResult.source === 'override') {
              // Next day is in an override
              errors.push({
                issue: ValidationIssue.SpilloverConflictOverrideIntoNext,
                overrideIndex,
                date: lastDate.toJSON(),
                overrideRuleIndex,
                nextDayOverrideIndex: nextDayResult.overrideIndex,
                nextDayOverrideRuleIndex: nextDayRuleIndex,
              })
            } else {
              // Next day is weekly
              errors.push({
                issue: ValidationIssue.SpilloverConflictOverrideIntoNext,
                overrideIndex,
                date: lastDate.toJSON(),
                overrideRuleIndex,
                nextDayWeeklyRuleIndex: nextDayRuleIndex,
              })
            }
          }
        })
      }
    })
  })

  return errors
}
