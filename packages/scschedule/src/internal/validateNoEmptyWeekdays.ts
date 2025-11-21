import { isWeekdaysEmpty } from 'scdate'
import { RuleLocationType, ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'

/**
 * Validates that no rules have empty weekdays patterns (no days selected).
 * Note: This validator should run after validateScDateFormats to ensure
 * weekdays are valid before checking if they're empty.
 */
export const validateNoEmptyWeekdays = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  // Check weekly rules
  schedule.weekly.forEach((rule, ruleIndex) => {
    try {
      if (isWeekdaysEmpty(rule.weekdays)) {
        errors.push({
          issue: ValidationIssue.EmptyWeekdays,
          location: {
            type: RuleLocationType.Weekly,
            ruleIndex,
          },
        })
      }
    } catch {
      // Invalid weekdays format - will be caught by validateScDateFormats
    }
  })

  // Check override rules
  if (schedule.overrides) {
    schedule.overrides.forEach((override, overrideIndex) => {
      override.rules.forEach((rule, ruleIndex) => {
        try {
          if (isWeekdaysEmpty(rule.weekdays)) {
            errors.push({
              issue: ValidationIssue.EmptyWeekdays,
              location: {
                type: RuleLocationType.Override,
                overrideIndex,
                ruleIndex,
              },
            })
          }
        } catch {
          // Invalid weekdays format - will be caught by validateScDateFormats
        }
      })
    })
  }

  return errors
}
