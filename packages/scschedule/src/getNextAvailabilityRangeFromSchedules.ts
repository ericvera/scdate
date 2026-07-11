import {
  getDateFromTimestamp,
  getDaysBetweenDates,
  isBeforeTimestamp,
  isSameTimestamp,
  sTimestamp,
} from 'scdate'
import type { STimestamp } from 'scdate'
import { getAvailabilityRangeEnd } from './internal/getAvailabilityRangeEnd.js'
import type { NextAvailabilityRange } from './getNextAvailabilityRangeFromSchedule.js'
import { getNextAvailableFromSchedule } from './getNextAvailableFromSchedule.js'
import { getUnavailableScheduleIndexes } from './getUnavailableScheduleIndexes.js'
import type { Schedule } from './types.js'

/**
 * Result of finding the next availability range across multiple schedules.
 */
export interface NextAvailabilityRangeFromSchedulesResult {
  /**
   * True if every schedule is available at `fromTimestamp` (in which case
   * `range.from` equals `fromTimestamp`).
   */
  available: boolean
  /**
   * The availability range of the intersection of the schedules — containing
   * `fromTimestamp` or the next one to begin — or undefined if the schedules
   * have no common availability within the search window.
   */
  range: NextAvailabilityRange | undefined
  /**
   * Indexes (into the `schedules` argument) of the schedules that are
   * unavailable at `fromTimestamp`. Empty if all schedules are available at
   * `fromTimestamp`. Explains which schedules block availability at the
   * query time.
   */
  unavailableScheduleIndexes: number[]
}

/**
 * Finds the availability range of the intersection of the given schedules —
 * the range containing the given timestamp, or the next one to begin —
 * searching forward up to the specified number of days.
 *
 * Multiple schedules combine by intersection: the combined availability is
 * open only when every schedule is available, starts when the last schedule
 * opens, and ends as soon as any one schedule closes. Order of the schedules
 * does not affect the resulting range. A schedule of `weekly: true` (see
 * `AlwaysAvailableSchedule`) restricts nothing, and an empty array is
 * considered always available.
 *
 * The range start is found by alternating between schedules: each schedule
 * is asked for its next available timestamp starting from the current
 * candidate, cycling until a full pass leaves the candidate unchanged (every
 * schedule is available at that instant) or the search window is exhausted.
 * The range end is the earliest end of any schedule's contiguous
 * availability from that start.
 *
 * To find out which schedules end the availability, call
 * `getUnavailableScheduleIndexes` with `range.to` — it is the first
 * unavailable instant.
 *
 * @param schedules The schedules that must all be available.
 * @param fromTimestamp The starting timestamp to search from.
 * @param maxDaysToSearch Maximum number of days to search forward (measured
 *   from `fromTimestamp`, shared across all schedules).
 * @returns The intersected availability range (or undefined if none found
 *   within the search window), along with the indexes of the schedules
 *   unavailable at `fromTimestamp`.
 *
 * @example
 * // schedules[0]: Mon-Sat 11:00-22:00
 * // schedules[1]: Mon 00:00-00:00 (all day)
 * // Query: Tuesday at 12:00
 * // Returns: {
 * //   available: false,
 * //   range: { from: next Monday 11:00, to: next Monday 22:00 },
 * //   unavailableScheduleIndexes: [1],
 * // }
 */
export const getNextAvailabilityRangeFromSchedules = (
  schedules: Schedule[],
  fromTimestamp: STimestamp | string,
  maxDaysToSearch: number,
): NextAvailabilityRangeFromSchedulesResult => {
  const initialTimestamp = sTimestamp(fromTimestamp)
  const initialDate = getDateFromTimestamp(initialTimestamp)

  const unavailableScheduleIndexes = getUnavailableScheduleIndexes(
    schedules,
    initialTimestamp,
  )
  const available = unavailableScheduleIndexes.length === 0

  let candidate = initialTimestamp
  let moved = true

  // Keep passing the candidate through every schedule until a full pass makes
  // no change (all schedules are available at the candidate).
  while (moved) {
    moved = false

    for (const schedule of schedules) {
      // The search window is shared across schedules: days already consumed
      // by advancing the candidate shrink the remaining window.
      const elapsedDays = getDaysBetweenDates(
        initialDate,
        getDateFromTimestamp(candidate),
      )
      const remainingDays = maxDaysToSearch - elapsedDays

      if (remainingDays <= 0) {
        return { available, range: undefined, unavailableScheduleIndexes }
      }

      const next = getNextAvailableFromSchedule(
        schedule,
        candidate,
        remainingDays,
      )

      if (next === undefined) {
        return { available, range: undefined, unavailableScheduleIndexes }
      }

      if (!isSameTimestamp(next, candidate)) {
        candidate = next
        moved = true
      }
    }
  }

  // The intersected availability ends as soon as any schedule's contiguous
  // availability ends
  let to: STimestamp | undefined

  for (const schedule of schedules) {
    const end = getAvailabilityRangeEnd(schedule, candidate, maxDaysToSearch)

    if (end !== undefined && (!to || isBeforeTimestamp(end, to))) {
      to = end
    }
  }

  return {
    available,
    range: { from: candidate, to },
    unavailableScheduleIndexes,
  }
}
