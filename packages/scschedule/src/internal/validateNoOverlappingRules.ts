import { ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'
import { doRulesOverlap } from './doRulesOverlap.js'

/**
 * Validates that rules at the same level (either in weekly or within an
 * override) do not have overlapping weekdays and time ranges. This catches
 * cases where two rules would both apply to the same time period, which is
 * ambiguous and likely unintentional.
 *
 * Accounts for cross-midnight time ranges that spill into the next day.
 *
 * For override rules, expects the schedule to be normalized so that override
 * weekdays are already filtered to only those that occur in the date range.
 */
export const validateNoOverlappingRules = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  // Check weekly rules for overlaps
  for (let i = 0; i < schedule.weekly.length; i++) {
    for (let j = i + 1; j < schedule.weekly.length; j++) {
      const rule1 = schedule.weekly[i]
      const rule2 = schedule.weekly[j]

      if (rule1 && rule2) {
        const overlapWeekday = doRulesOverlap(rule1, rule2)

        if (overlapWeekday !== undefined) {
          errors.push({
            issue: ValidationIssue.OverlappingRulesInWeekly,
            ruleIndexes: [i, j],
            weekday: overlapWeekday,
          })
        }
      }
    }
  }

  // Check override rules for overlaps
  if (schedule.overrides) {
    schedule.overrides.forEach((override, overrideIndex) => {
      for (let i = 0; i < override.rules.length; i++) {
        for (let j = i + 1; j < override.rules.length; j++) {
          const rule1 = override.rules[i]
          const rule2 = override.rules[j]

          if (rule1 && rule2) {
            const overlapWeekday = doRulesOverlap(rule1, rule2)

            if (overlapWeekday !== undefined) {
              errors.push({
                issue: ValidationIssue.OverlappingRulesInOverride,
                overrideIndex,
                ruleIndexes: [i, j],
                weekday: overlapWeekday,
              })
            }
          }
        }
      }
    })
  }

  return errors
}
