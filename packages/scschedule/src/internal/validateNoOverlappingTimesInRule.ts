import { RuleLocationType, ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError, WeeklyScheduleRule } from '../types.js'
import { doTimeRangesOverlap } from './doTimeRangesOverlap.js'

type RuleLocation =
  | { type: RuleLocationType.Weekly; ruleIndex: number }
  | {
      type: RuleLocationType.Override
      overrideIndex: number
      ruleIndex: number
    }

/**
 * Validates that time ranges within a single rule do not overlap.
 */
const validateRuleTimes = (
  rule: WeeklyScheduleRule,
  location: RuleLocation,
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (rule.times.length < 2) {
    return errors
  }

  // Check all pairs of time ranges for overlap on the same weekday
  for (let i = 0; i < rule.times.length; i++) {
    for (let j = i + 1; j < rule.times.length; j++) {
      const timeRange1 = rule.times[i]
      const timeRange2 = rule.times[j]

      if (
        timeRange1 &&
        timeRange2 &&
        doTimeRangesOverlap(timeRange1, timeRange2)
      ) {
        errors.push({
          issue: ValidationIssue.OverlappingTimesInRule,
          location,
          timeRangeIndexes: [i, j],
        })
      }
    }
  }

  return errors
}

/**
 * Validates that time ranges within rules do not overlap with each other.
 */
export const validateNoOverlappingTimesInRule = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  // Validate weekly rules
  const weeklyRules = schedule.weekly === true ? [] : schedule.weekly
  weeklyRules.forEach((rule, ruleIndex) => {
    const ruleErrors = validateRuleTimes(rule, {
      type: RuleLocationType.Weekly,
      ruleIndex,
    })

    errors.push(...ruleErrors)
  })

  // Validate override rules
  schedule.overrides?.forEach((override, overrideIndex) => {
    override.rules.forEach((rule, ruleIndex) => {
      const ruleErrors = validateRuleTimes(rule, {
        type: RuleLocationType.Override,
        overrideIndex,
        ruleIndex,
      })
      errors.push(...ruleErrors)
    })
  })

  return errors
}
