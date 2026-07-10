import type { STimestamp } from 'scdate'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule } from './types.js'

/**
 * Checks if all of the given schedules are available at the specified
 * timestamp (i.e. the intersection of the schedules is available).
 *
 * Multiple schedules combine by intersection: the combined availability is
 * open only when every schedule is available. Order of the schedules does not
 * affect the result. A schedule of `weekly: true` (see
 * `AlwaysAvailableSchedule`) restricts nothing, and an empty array is
 * considered available (there is nothing to restrict availability).
 *
 * To find out which schedules are blocking availability, use
 * `getUnavailableScheduleIndexes` instead.
 *
 * @param schedules The schedules to check availability against.
 * @param timestamp The timestamp to check.
 * @returns True if every schedule is available at the given timestamp.
 */
export const areSchedulesAvailable = (
  schedules: Schedule[],
  timestamp: STimestamp | string,
): boolean =>
  schedules.every((schedule) => isScheduleAvailable(schedule, timestamp))
