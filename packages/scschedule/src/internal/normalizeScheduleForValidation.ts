import { filterWeekdaysForDates, sDate } from 'scdate'
import type { Schedule } from '../types.js'

/**
 * Normalizes a schedule for validation by filtering override rule weekdays to
 * only include weekdays that actually occur within each override's date range.
 *
 * This preprocessing step ensures that validation logic doesn't need to
 * repeatedly filter weekdays, and automatically handles edge cases like
 * cross-midnight spillover at override boundaries.
 *
 * Note: This assumes the schedule has valid structure (valid date formats and
 * valid date order). Should only be called after structural validation passes.
 */
export const normalizeScheduleForValidation = (
  schedule: Schedule,
): Schedule => {
  // No overrides - return as-is
  if (!schedule.overrides) {
    return schedule
  }

  return {
    ...schedule,
    overrides: schedule.overrides.map((override) => {
      // Indefinite overrides extend forever - keep original weekdays
      if (!override.to) {
        return override
      }

      const toDate = sDate(override.to)

      // Filter each rule's weekdays to only those that occur in date range
      return {
        ...override,
        rules: override.rules.map((rule) => ({
          ...rule,
          weekdays: filterWeekdaysForDates(
            rule.weekdays,
            override.from,
            toDate,
          ),
        })),
      }
    }),
  }
}
