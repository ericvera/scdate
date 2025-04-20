import { toZonedTime } from 'date-fns-tz'

/**
 * @param timeZone For a list of valid time zones run
 *   `Intl.supportedValuesOf('timeZone')` on your environment.
 */
export const getTimeZonedDate = (
  millisecondsInUTC: number,
  timeZone: string,
): Date => {
  if (isNaN(millisecondsInUTC.valueOf())) {
    throw new Error(
      `Invalid date. Date: '${String(millisecondsInUTC.valueOf())}'`,
    )
  }

  const zonedDate = toZonedTime(millisecondsInUTC, timeZone)

  if (isNaN(zonedDate.valueOf())) {
    throw new Error(`Invalid time zone. Time zone: '${timeZone}'`)
  }

  return zonedDate
}
