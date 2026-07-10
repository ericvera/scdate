import type { STimestamp } from 'scdate'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule } from './types.js'

/**
 * Returns the indexes of the schedules that are unavailable at the specified
 * timestamp.
 *
 * When multiple schedules are combined by intersection (see
 * `areSchedulesAvailable`), this identifies which schedules block the combined
 * availability at a given time: an empty result means every schedule is
 * available; otherwise each index identifies a blocking schedule.
 *
 * @param schedules The schedules to check availability against.
 * @param timestamp The timestamp to check.
 * @returns Indexes (into `schedules`) of the schedules that are unavailable at
 *   the given timestamp. Empty if all schedules are available.
 *
 * @example
 * // schedules[0]: Mon-Sat 11:00-22:00
 * // schedules[1]: Mon 00:00-23:59
 * // Query: Tuesday at 12:00
 * // Returns: [1]
 */
export const getUnavailableScheduleIndexes = (
  schedules: Schedule[],
  timestamp: STimestamp | string,
): number[] => {
  const indexes: number[] = []

  schedules.forEach((schedule, index) => {
    if (!isScheduleAvailable(schedule, timestamp)) {
      indexes.push(index)
    }
  })

  return indexes
}
