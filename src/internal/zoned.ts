import { UTCDateMini } from '@date-fns/utc'
import { getTimezoneOffset, toZonedTime } from 'date-fns-tz'
import { SDate } from './SDate.js'
import { STimestamp } from './STimestamp.js'
import { getDateAsUTCDateMini } from './date.js'
import { getTimestampAsUTCDateMini } from './timestamp.js'

const getValidatedTimeZoneOffset = (timeZone: string, utcDate: UTCDateMini) => {
  const timeZoneOffset = getTimezoneOffset(timeZone, utcDate)

  if (isNaN(timeZoneOffset)) {
    throw new Error(`Invalid time zone. Time zone: '${timeZone}'`)
  }

  return timeZoneOffset
}

export const getMillisecondsInUTCFromTimestamp = (
  timestamp: STimestamp,
  timeZone: string,
): number => {
  const utcDate = getTimestampAsUTCDateMini(timestamp)

  const timeZoneOffset = getValidatedTimeZoneOffset(timeZone, utcDate)

  return utcDate.getTime() - timeZoneOffset
}

export const getMillisecondsInUTCFromDate = (
  date: SDate,
  timeZone: string,
): number => {
  const utcDate = getDateAsUTCDateMini(date)

  const timeZoneOffset = getValidatedTimeZoneOffset(timeZone, utcDate)

  return utcDate.getTime() - timeZoneOffset
}

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
