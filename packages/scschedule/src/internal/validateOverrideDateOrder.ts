import { isBeforeDate, sDate } from 'scdate'
import { ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'

/**
 * Validates that override 'to' dates are not before their 'from' dates.
 * Only checks overrides that have both from and to dates (specific overrides).
 */
export const validateOverrideDateOrder = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  schedule.overrides?.forEach((override, overrideIndex) => {
    // Skip indefinite overrides (no 'to' date)
    if (!override.to) {
      return
    }

    const fromDate = sDate(override.from)
    const toDate = sDate(override.to)

    // Check if 'to' is before 'from'
    if (isBeforeDate(toDate, fromDate)) {
      errors.push({
        issue: ValidationIssue.InvalidOverrideDateOrder,
        overrideIndex,
        from: fromDate.toJSON(),
        to: toDate.toJSON(),
      })
    }
  })

  return errors
}
