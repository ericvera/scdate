import {
  filterWeekdaysForDates,
  isWeekdaysEmpty,
  sDate,
  sWeekdays,
} from 'scdate'
import { ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'

/**
 * Validates that override rules have weekdays that match at least one actual
 * date in the override's date range. If no dates match, the override is
 * effectively closed and should use empty rules instead.
 *
 * Runs before normalization to provide better error messages showing the
 * original weekdays specified by the user rather than the filtered result.
 */
export const validateOverrideWeekdaysMatchDates = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!schedule.overrides) {
    return errors
  }

  schedule.overrides.forEach((override, overrideIndex) => {
    // Skip indefinite overrides (no 'to' date) - they extend forever so
    // weekdays will eventually match
    if (!override.to) {
      return
    }

    // Skip overrides with empty rules - those are intentionally closed
    if (override.rules.length === 0) {
      return
    }

    // Store dates for filtering and error messages
    const fromDate = sDate(override.from)
    const toDate = sDate(override.to)

    // Check each rule in the override
    override.rules.forEach((rule, ruleIndex) => {
      const originalWeekdays = sWeekdays(rule.weekdays)

      // Filter weekdays to only those that occur in the date range
      // Note: If dates are invalid (from > to), filterWeekdaysForDates will
      // throw. We let it throw since validateOverrideDateOrder should catch
      // this in structural validation. However, we wrap in try-catch to be
      // defensive in case validators run in isolation.
      let filteredWeekdays

      try {
        filteredWeekdays = filterWeekdaysForDates(
          originalWeekdays,
          fromDate,
          toDate,
        )
      } catch {
        // Invalid date range - skip this rule. The error will be caught by
        // validateOverrideDateOrder in structural validation.
        return
      }

      // If no weekdays match the date range after filtering, report an error
      // showing the ORIGINAL weekdays the user specified
      if (isWeekdaysEmpty(filteredWeekdays)) {
        errors.push({
          issue: ValidationIssue.OverrideWeekdaysMismatch,
          overrideIndex,
          ruleIndex,
          weekdays: originalWeekdays.toJSON(),
          dateRange: {
            from: fromDate.toJSON(),
            to: toDate.toJSON(),
          },
        })
      }
    })
  })

  return errors
}
