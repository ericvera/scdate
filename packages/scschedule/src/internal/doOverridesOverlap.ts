import { isSameDateOrBefore } from 'scdate'
import type { OverrideScheduleRule } from '../types.js'

/**
 * Checks if two specific override date ranges overlap.
 */
export const doOverridesOverlap = (
  override1: OverrideScheduleRule,
  override2: OverrideScheduleRule,
): boolean => {
  // Only check specific overrides (both must have 'to' date)
  if (!override1.to || !override2.to) {
    return false
  }

  // Ranges overlap if:
  // override1.from <= override2.to AND override2.from <= override1.to
  return (
    isSameDateOrBefore(override1.from, override2.to) &&
    isSameDateOrBefore(override2.from, override1.to)
  )
}
