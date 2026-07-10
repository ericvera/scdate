import { isBeforeTimestamp, sTimestamp, type STimestamp } from 'scdate'
import { getNextUnavailableFromSchedule } from './getNextUnavailableFromSchedule.js'
import { getUnavailableScheduleIndexes } from './getUnavailableScheduleIndexes.js'
import type { Schedule } from './types.js'

/**
 * Result of finding the next unavailable timestamp across multiple schedules.
 */
export interface NextUnavailableFromSchedulesResult {
  /**
   * The next timestamp at which at least one schedule is unavailable, or
   * undefined if no unavailability was found within the search window.
   */
  timestamp: STimestamp | undefined
  /**
   * Indexes (into the `schedules` argument) of the schedules that are
   * unavailable at the returned `timestamp` — the schedules that end the
   * combined availability. Empty if `timestamp` is undefined.
   */
  unavailableScheduleIndexes: number[]
}

/**
 * Finds the next timestamp at which any of the given schedules is unavailable
 * (i.e. the next unavailable timestamp of the intersection of the schedules),
 * starting from the specified timestamp.
 *
 * Multiple schedules combine by intersection: the combined availability is
 * open only when every schedule is available, so it ends as soon as any one
 * schedule becomes unavailable. This is the minimum of each schedule's next
 * unavailable timestamp. If any schedule is already unavailable at
 * `fromTimestamp`, `fromTimestamp` is returned. An empty array is considered
 * always available and returns an undefined timestamp.
 *
 * Pairs with `getNextAvailableFromSchedules` to answer "available Monday from
 * 09:00 until noon". The returned indexes identify which schedules end the
 * availability.
 *
 * @param schedules The schedules that must all be available.
 * @param timeZone IANA time zone identifier for timestamp arithmetic.
 * @param fromTimestamp The starting timestamp to search from.
 * @param maxDaysToSearch Maximum number of days to search forward.
 * @returns The next timestamp at which at least one schedule is unavailable
 *   (or undefined if none found within the search window), along with the
 *   indexes of the schedules unavailable at that timestamp.
 *
 * @example
 * // schedules[0]: Mon-Fri 09:00-17:00
 * // schedules[1]: Mon-Fri 09:00-12:00
 * // Query: Monday at 10:00
 * // Returns: { timestamp: Monday at 12:01,
 * //   unavailableScheduleIndexes: [1] }
 */
export const getNextUnavailableFromSchedules = (
  schedules: Schedule[],
  timeZone: string,
  fromTimestamp: STimestamp | string,
  maxDaysToSearch: number,
): NextUnavailableFromSchedulesResult => {
  const initialTimestamp = sTimestamp(fromTimestamp)

  let earliest: STimestamp | undefined

  for (const schedule of schedules) {
    const next = getNextUnavailableFromSchedule(
      schedule,
      timeZone,
      initialTimestamp,
      maxDaysToSearch,
    )

    if (
      next !== undefined &&
      (!earliest || isBeforeTimestamp(next, earliest))
    ) {
      earliest = next
    }
  }

  return {
    timestamp: earliest,
    unavailableScheduleIndexes: earliest
      ? getUnavailableScheduleIndexes(schedules, earliest)
      : [],
  }
}
