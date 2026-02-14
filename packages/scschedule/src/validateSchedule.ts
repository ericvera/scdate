import { normalizeScheduleForValidation } from './internal/normalizeScheduleForValidation.js'
import { validateNoEmptyWeekdays } from './internal/validateNoEmptyWeekdays.js'
import { validateNoOverlappingOverrides } from './internal/validateNoOverlappingOverrides.js'
import { validateNoOverlappingRules } from './internal/validateNoOverlappingRules.js'
import { validateNoOverlappingTimesInRule } from './internal/validateNoOverlappingTimesInRule.js'
import { validateNoSpilloverConflictsAtOverrideBoundaries } from './internal/validateNoSpilloverConflictsAtOverrideBoundaries.js'
import { validateNonEmptyTimes } from './internal/validateNonEmptyTimes.js'
import { validateOverrideDateOrder } from './internal/validateOverrideDateOrder.js'
import { validateOverrideWeekdaysMatchDates } from './internal/validateOverrideWeekdaysMatchDates.js'
import { validateScDateFormats } from './internal/validateScDateFormats.js'
import type { Schedule, ValidationResult } from './types.js'

/**
 * Validates a schedule configuration and returns all validation errors found.
 *
 * Validation is performed in two phases:
 * 1. Structural validation (formats, date order, empty weekdays, non-empty
 *    times, weekday-date mismatch) - runs on original schedule
 * 2. Semantic validation (overlaps, conflicts) - runs on normalized schedule
 *    after filtering weekdays to actual dates
 *
 * If structural errors are found, validation stops early and returns only
 * those errors. This provides better user experience and avoids crashes from
 * invalid data during normalization.
 *
 * @param schedule The schedule to validate.
 */
export const validateSchedule = (schedule: Schedule): ValidationResult => {
  // Phase 1: Structural validation
  // Note: Order matters - date formats and order must be validated before
  // weekday matching (which calls filterWeekdaysForDates)
  const structuralErrors = [
    ...validateScDateFormats(schedule),
    ...validateOverrideDateOrder(schedule),
    ...validateNoEmptyWeekdays(schedule),
    ...validateNonEmptyTimes(schedule),
    ...validateOverrideWeekdaysMatchDates(schedule),
  ]

  // Return immediately if structural errors exist
  if (structuralErrors.length > 0) {
    return {
      valid: false,
      errors: structuralErrors,
    }
  }

  // Phase 2: Normalize - filter override weekdays to actual dates in range
  const normalizedSchedule = normalizeScheduleForValidation(schedule)

  // Phase 3: Semantic validation on normalized schedule
  const semanticErrors = [
    ...validateNoOverlappingOverrides(normalizedSchedule),
    ...validateNoOverlappingTimesInRule(normalizedSchedule),
    ...validateNoOverlappingRules(normalizedSchedule),
    ...validateNoSpilloverConflictsAtOverrideBoundaries(normalizedSchedule),
  ]

  return {
    valid: semanticErrors.length === 0,
    errors: semanticErrors,
  }
}
