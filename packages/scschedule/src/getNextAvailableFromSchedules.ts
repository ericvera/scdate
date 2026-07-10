import {
  getDateFromTimestamp,
  getDaysBetweenDates,
  isSameTimestamp,
  sTimestamp,
  type STimestamp,
} from 'scdate'
import { getNextAvailableFromSchedule } from './getNextAvailableFromSchedule.js'
import { getUnavailableScheduleIndexes } from './getUnavailableScheduleIndexes.js'
import type { Schedule } from './types.js'

/**
 * Result of finding the next available timestamp across multiple schedules.
 */
export interface NextAvailableFromSchedulesResult {
  /**
   * The next timestamp at which every schedule is available, or undefined if
   * none was found within the search window.
   */
  timestamp: STimestamp | undefined
  /**
   * Indexes (into the `schedules` argument) of the schedules that are
   * unavailable at `fromTimestamp`. Empty if all schedules are available at
   * `fromTimestamp` (in which case `timestamp` equals `fromTimestamp`).
   * Explains which schedules block availability at the query time.
   */
  unavailableScheduleIndexes: number[]
}

/**
 * Finds the next timestamp at which all of the given schedules are available
 * (i.e. the next available timestamp of the intersection of the schedules),
 * starting from the specified timestamp.
 *
 * Multiple schedules combine by intersection: the combined availability is
 * open only when every schedule is available. Order of the schedules does not
 * affect the resulting timestamp. A schedule of `weekly: true` (see
 * `AlwaysAvailableSchedule`) restricts nothing, and an empty array is
 * considered always available.
 *
 * The algorithm alternates between schedules: it asks the first schedule for
 * its next available timestamp, feeds the result to the next schedule, and so
 * on, cycling until a full pass leaves the candidate unchanged (every schedule
 * is available at that instant) or the search window is exhausted. Each pass
 * either terminates or advances the candidate to a later range start, so the
 * search converges. Cross-midnight spillover is handled by the underlying
 * single-schedule search.
 *
 * @param schedules The schedules that must all be available.
 * @param fromTimestamp The starting timestamp to search from.
 * @param maxDaysToSearch Maximum number of days to search forward (measured
 *   from `fromTimestamp`, shared across all schedules).
 * @returns The next timestamp at which every schedule is available (or
 *   undefined if none found within the search window), along with the indexes
 *   of the schedules unavailable at `fromTimestamp`.
 *
 * @example
 * // schedules[0]: Mon-Sat 11:00-22:00
 * // schedules[1]: Mon 00:00-23:59
 * // Query: Tuesday at 12:00
 * // Returns: { timestamp: next Monday at 11:00,
 * //   unavailableScheduleIndexes: [1] }
 *
 * @example
 * // schedules[0]: Mon-Fri 09:00-17:00
 * // schedules[1]: Mon-Fri 10:00-18:00
 * // Query: Monday at 08:00
 * // Returns: { timestamp: Monday at 10:00,
 * //   unavailableScheduleIndexes: [0, 1] }
 */
export const getNextAvailableFromSchedules = (
  schedules: Schedule[],
  fromTimestamp: STimestamp | string,
  maxDaysToSearch: number,
): NextAvailableFromSchedulesResult => {
  const initialTimestamp = sTimestamp(fromTimestamp)
  const initialDate = getDateFromTimestamp(initialTimestamp)

  const unavailableScheduleIndexes = getUnavailableScheduleIndexes(
    schedules,
    initialTimestamp,
  )

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
        return { timestamp: undefined, unavailableScheduleIndexes }
      }

      const next = getNextAvailableFromSchedule(
        schedule,
        candidate,
        remainingDays,
      )

      if (next === undefined) {
        return { timestamp: undefined, unavailableScheduleIndexes }
      }

      if (!isSameTimestamp(next, candidate)) {
        candidate = next
        moved = true
      }
    }
  }

  return { timestamp: candidate, unavailableScheduleIndexes }
}
