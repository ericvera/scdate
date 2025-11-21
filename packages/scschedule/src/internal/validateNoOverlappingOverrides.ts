import { isSameDate, isSameDateOrAfter, isSameDateOrBefore } from 'scdate'
import { ValidationIssue } from '../constants.js'
import type {
  OverrideScheduleRule,
  Schedule,
  ValidationError,
} from '../types.js'
import { doOverridesOverlap } from './doOverridesOverlap.js'

/**
 * Checks if one override is fully contained within another, which is allowed
 * for hierarchical specificity.
 */
const isOverrideContained = (
  inner: OverrideScheduleRule,
  outer: OverrideScheduleRule,
): boolean => {
  // Both must be specific overrides (have 'to' date)
  if (!inner.to || !outer.to) {
    return false
  }

  // Inner must start at or after outer starts
  const innerStartsWithinOuter = isSameDateOrAfter(inner.from, outer.from)

  // Inner must end at or before outer ends
  const innerEndsWithinOuter = isSameDateOrBefore(inner.to, outer.to)

  return innerStartsWithinOuter && innerEndsWithinOuter
}

/**
 * Validates that specific overrides do not have overlapping date ranges.
 */
export const validateNoOverlappingOverrides = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!schedule.overrides || schedule.overrides.length < 2) {
    return errors
  }

  // Check all pairs of specific overrides for overlap
  for (let i = 0; i < schedule.overrides.length; i++) {
    for (let j = i + 1; j < schedule.overrides.length; j++) {
      const override1 = schedule.overrides[i]
      const override2 = schedule.overrides[j]

      // Check for exact duplicates (same from and to dates)
      if (
        override1?.to &&
        override2?.to &&
        isSameDate(override1.from, override2.from) &&
        isSameDate(override1.to, override2.to)
      ) {
        errors.push({
          issue: ValidationIssue.DuplicateOverrides,
          overrideIndexes: [i, j],
        })
        continue
      }

      if (override1 && override2 && doOverridesOverlap(override1, override2)) {
        // Allow overlap if one override is fully contained within the other
        const isHierarchical =
          isOverrideContained(override1, override2) ||
          isOverrideContained(override2, override1)

        if (!isHierarchical) {
          errors.push({
            issue: ValidationIssue.OverlappingSpecificOverrides,
            overrideIndexes: [i, j],
          })
        }
      }
    }
  }

  return errors
}
