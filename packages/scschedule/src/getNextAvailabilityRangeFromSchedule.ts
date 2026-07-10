import { sTimestamp, type STimestamp } from 'scdate'
import { getAvailabilityRangeEnd } from './internal/getAvailabilityRangeEnd.js'
import { getNextAvailableFromSchedule } from './getNextAvailableFromSchedule.js'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule } from './types.js'

/**
 * A contiguous period of availability found by a forward search. The `to`
 * boundary is exclusive: it is the first unavailable instant.
 */
export interface NextAvailabilityRange {
  /** Start of the availability period (inclusive) */
  from: STimestamp
  /**
   * End of the availability period (exclusive) — the first unavailable
   * instant. Undefined if availability does not end within the search
   * window.
   */
  to: STimestamp | undefined
}

/**
 * Result of finding the next availability range in a schedule.
 */
export interface NextAvailabilityRangeFromScheduleResult {
  /**
   * True if the schedule is available at `fromTimestamp` (in which case
   * `range.from` equals `fromTimestamp`).
   */
  available: boolean
  /**
   * The availability range containing `fromTimestamp`, or the next one to
   * begin. Undefined if the schedule has no availability within the search
   * window.
   */
  range: NextAvailabilityRange | undefined
}

/**
 * Finds the availability range that contains the given timestamp, or the
 * next one to begin, searching forward up to the specified number of days.
 *
 * This single query answers the common availability questions together:
 * - Available now? (`available`)
 * - When next? (`range.from`)
 * - Until when? (`range.to` — the first unavailable instant, e.g. a rule's
 *   end time; adjacent ranges chain into one contiguous period)
 *
 * @param schedule The schedule to search.
 * @param fromTimestamp The starting timestamp to search from.
 * @param maxDaysToSearch Maximum number of days to search forward (applied
 *   to finding the start, and again to finding the end from the start).
 * @returns Whether the schedule is available at `fromTimestamp`, and the
 *   availability range (undefined if the schedule has no availability within
 *   the search window).
 *
 * @example
 * // Schedule: Mon-Fri 09:00-17:00
 * // Query: Tuesday at 10:00
 * // Returns: { available: true,
 * //   range: { from: Tuesday 10:00, to: Tuesday 17:00 } }
 *
 * @example
 * // Schedule: Mon-Fri 09:00-17:00
 * // Query: Saturday at 10:00
 * // Returns: { available: false,
 * //   range: { from: Monday 09:00, to: Monday 17:00 } }
 *
 * @example
 * // Schedule: weekly true (always available)
 * // Query: any time
 * // Returns: { available: true,
 * //   range: { from: query time, to: undefined } }
 */
export const getNextAvailabilityRangeFromSchedule = (
  schedule: Schedule,
  fromTimestamp: STimestamp | string,
  maxDaysToSearch: number,
): NextAvailabilityRangeFromScheduleResult => {
  const initialTimestamp = sTimestamp(fromTimestamp)
  const available = isScheduleAvailable(schedule, initialTimestamp)

  const start = available
    ? initialTimestamp
    : getNextAvailableFromSchedule(schedule, initialTimestamp, maxDaysToSearch)

  if (start === undefined) {
    return { available, range: undefined }
  }

  return {
    available,
    range: {
      from: start,
      to: getAvailabilityRangeEnd(schedule, start, maxDaysToSearch),
    },
  }
}
