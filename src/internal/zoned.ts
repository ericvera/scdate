import { toZonedTime } from 'date-fns-tz'

/**
 * @param timeZone For a list of valid time zones run
 *   `Intl.supportedValuesOf('timeZone')` on your environment.
 */
export const getZonedDate = (date: Date | number, timeZone: string): Date => {
  if (isNaN(date.valueOf())) {
    throw new Error(`Invalid date. Date: '${String(date.valueOf())}'`)
  }

  const zonedDate = toZonedTime(date, timeZone)

  if (isNaN(zonedDate.valueOf())) {
    throw new Error(`Invalid time zone. Time zone: '${timeZone}'`)
  }

  return zonedDate
}
