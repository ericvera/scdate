import {
  getDaysBetweenDates,
  isSameDateOrAfter,
  isSameDateOrBefore,
  SDate,
} from 'scdate'
import type {
  OverrideScheduleRule,
  Schedule,
  SDateString,
  WeeklyScheduleRule,
} from '../types.js'

export type ApplicableRule =
  | { source: 'weekly'; rules: WeeklyScheduleRule[] | true }
  | { source: 'override'; overrideIndex: number; rules: WeeklyScheduleRule[] }

/**
 * Determines which rules apply for a given date based on overrides or weekly
 * schedule. Returns a discriminated union indicating the source (`'weekly'` or
 * `'override'`) and the applicable rules. When the source is `'weekly'` and
 * the schedule has `weekly: true`, the returned `rules` will be `true`.
 *
 * When multiple overrides apply, selects the most specific (shortest duration).
 *
 * Priority:
 * 1. Specific overrides (with 'to' date) - shortest duration wins
 * 2. Indefinite overrides (no 'to' date) - latest 'from' date wins
 * 3. Weekly schedule (fallback)
 */
export const getApplicableRuleForDate = (
  schedule: Schedule,
  date: SDate | SDateString,
): ApplicableRule => {
  // - Check the case where there are no overrides (just return the weekly
  // schedule)
  if (!schedule.overrides || schedule.overrides.length === 0) {
    return {
      source: 'weekly',
      rules: schedule.weekly,
    }
  }

  // - Check the case where there are overrides and collect all specific
  //   overrides that apply to this date (first filter to only include overrides
  //   with a 'to' date as they are more specific and take precedence over
  //   indefinite overrides)
  const applicableOverrides: {
    override: OverrideScheduleRule
    index: number
  }[] = []

  schedule.overrides.forEach((override, index) => {
    if (override.to) {
      const isInRange =
        isSameDateOrAfter(date, override.from) &&
        isSameDateOrBefore(date, override.to)

      if (isInRange) {
        applicableOverrides.push({ override, index })
      }
    }
  })

  // - When there are multiple applicable overrides (with from and to dates),
  //   select the most specific (shortest duration as it has higher precedence)
  //   over the longer duration overrides (e.g. 31 day override like a holiday
  //   season) vs 1 day override like a specific holiday).
  if (applicableOverrides.length > 0) {
    const mostSpecific = applicableOverrides.reduce((shortest, current) => {
      // Both have 'to' defined since we only added overrides with 'to'
      if (!shortest.override.to || !current.override.to) {
        return shortest
      }

      const shortestDuration = getDaysBetweenDates(
        shortest.override.from,
        shortest.override.to,
      )
      const currentDuration = getDaysBetweenDates(
        current.override.from,
        current.override.to,
      )

      return currentDuration < shortestDuration ? current : shortest
    })

    return {
      source: 'override',
      overrideIndex: mostSpecific.index,
      rules: mostSpecific.override.rules,
    }
  }

  // - At this point, we know there are no applicable overrides with from and
  //   to dates, so we need to check for indefinite overrides (without to).
  //   When multiple indefinite overrides exist, select the one with the latest
  //   'from' date that still applies (most recent policy wins).
  const applicableIndefiniteOverrides: {
    override: OverrideScheduleRule
    index: number
  }[] = []

  schedule.overrides.forEach((override, index) => {
    if (!override.to && isSameDateOrAfter(date, override.from)) {
      applicableIndefiniteOverrides.push({ override, index })
    }
  })

  if (applicableIndefiniteOverrides.length > 0) {
    // Select the indefinite override with the latest 'from' date
    const mostRecent = applicableIndefiniteOverrides.reduce(
      (latest, current) => {
        return isSameDateOrAfter(current.override.from, latest.override.from)
          ? current
          : latest
      },
    )

    return {
      source: 'override',
      overrideIndex: mostRecent.index,
      rules: mostRecent.override.rules,
    }
  }

  // - If there are no applicable indefinite overrides, return the weekly rules
  return {
    source: 'weekly',
    rules: schedule.weekly,
  }
}
