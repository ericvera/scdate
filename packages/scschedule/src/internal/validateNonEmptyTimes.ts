import { RuleLocationType, ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'

/**
 * Validates that all rules have at least one time range defined.
 */
export const validateNonEmptyTimes = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  // Validate weekly rules
  schedule.weekly.forEach((rule, ruleIndex) => {
    if (rule.times.length === 0) {
      errors.push({
        issue: ValidationIssue.EmptyTimes,
        location: {
          type: RuleLocationType.Weekly,
          ruleIndex,
        },
      })
    }
  })

  // Validate override rules
  schedule.overrides?.forEach((override, overrideIndex) => {
    override.rules.forEach((rule, ruleIndex) => {
      if (rule.times.length === 0) {
        errors.push({
          issue: ValidationIssue.EmptyTimes,
          location: {
            type: RuleLocationType.Override,
            overrideIndex,
            ruleIndex,
          },
        })
      }
    })
  })

  return errors
}
