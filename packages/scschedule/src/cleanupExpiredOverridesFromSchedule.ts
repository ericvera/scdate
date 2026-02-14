import { isSameDateOrAfter, type SDate } from 'scdate'
import type { Schedule } from './types.js'

/**
 * Removes expired overrides from a schedule that ended before the
 * specified date. It does not remove indefinite overrides (no to date).
 *
 * @param schedule The schedule to clean up.
 * @param beforeDate Overrides that ended before this date are removed. It
 * can be an SDate or a string in the YYYY-MM-DD format.
 */
export const cleanupExpiredOverridesFromSchedule = (
  schedule: Schedule,
  beforeDate: SDate | string,
): Schedule => {
  // If there are no overrides, return the schedule as-is
  if (!schedule.overrides || schedule.overrides.length === 0) {
    return schedule
  }

  // Filter out overrides that have ended before the given date
  const filteredOverrides = schedule.overrides.filter((override) => {
    // Keep indefinite overrides (no 'to' date)
    if (!override.to) {
      return true
    }

    // Keep overrides that end on or after beforeDate
    return isSameDateOrAfter(override.to, beforeDate)
  })

  // Return new Schedule instance with filtered overrides
  if (filteredOverrides.length === 0) {
    const { overrides, ...rest } = schedule

    return rest
  }

  return {
    ...schedule,
    overrides: filteredOverrides,
  }
}
