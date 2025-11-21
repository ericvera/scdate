import { ValidationIssue } from '../constants.js'
import type { Schedule, ValidationError } from '../types.js'
import { isValidTimezone } from './isValidTimezone.js'

/**
 * Validates that a schedule's timezone is a valid IANA timezone identifier.
 */
export const validateTimezone = (schedule: Schedule): ValidationError[] => {
  if (!isValidTimezone(schedule.timezone)) {
    return [
      {
        issue: ValidationIssue.InvalidTimezone,
        timezone: schedule.timezone,
      },
    ]
  }

  return []
}
