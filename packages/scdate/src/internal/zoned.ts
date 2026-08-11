import { toZonedTime } from 'date-fns-tz'
import { MillisecondsInDay } from './constants.js'

const HoursInDay = 24

const dateTimeFormatByTimeZone = new Map<string, Intl.DateTimeFormat>()

const getDateTimeFormat = (timeZone: string): Intl.DateTimeFormat => {
  const cached = dateTimeFormatByTimeZone.get(timeZone)

  if (cached !== undefined) {
    return cached
  }

  let dateTimeFormat: Intl.DateTimeFormat

  try {
    dateTimeFormat = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    throw new Error(`Invalid time zone. Time zone: '${timeZone}'`)
  }

  dateTimeFormatByTimeZone.set(timeZone, dateTimeFormat)

  return dateTimeFormat
}

const getPartValue = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number => {
  const part = parts.find((currentPart) => currentPart.type === type)

  if (part === undefined) {
    throw new Error(`Missing '${type}' in the formatted date parts.`)
  }

  return Number(part.value)
}

/**
 * Returns the offset from UTC (positive east of UTC) in milliseconds that the
 * given time zone is at the given real instant.
 */
const getTimeZoneOffsetAtInstant = (
  timeZone: string,
  instantMilliseconds: number,
): number => {
  const parts = getDateTimeFormat(timeZone).formatToParts(
    new Date(instantMilliseconds),
  )

  const asUTC = new Date(0)

  // setUTCFullYear (rather than Date.UTC) is required because Date.UTC maps
  // years 0-99 to 1900-1999 and this path can see them ('0050-06-15' is a
  // valid date).
  asUTC.setUTCFullYear(
    getPartValue(parts, 'year'),
    getPartValue(parts, 'month') - 1,
    getPartValue(parts, 'day'),
  )
  asUTC.setUTCHours(
    getPartValue(parts, 'hour') % HoursInDay,
    getPartValue(parts, 'minute'),
    getPartValue(parts, 'second'),
    0,
  )

  return asUTC.getTime() - instantMilliseconds
}

/**
 * Resolves a wall clock (epoch milliseconds that encode the wall clock as if it
 * were UTC) against the given time zone and returns the matching instant.
 *
 * The zone's offsets one day before and one day after the wall clock bracket
 * every offset that clock could have had, so they are the only candidates. A
 * candidate is valid when it reproduces the wall clock. Exactly one valid
 * candidate is the ordinary case. Two valid candidates means the wall clock
 * repeats (daylight saving fall back) and the larger offset is the earlier
 * occurrence. No valid candidate means the wall clock does not exist (spring
 * forward); the smaller (pre-gap) offset is used, which shifts the wall clock
 * forward by the length of the gap to the first existing instant at or after
 * it (matching Temporal's `disambiguation: 'compatible'`).
 *
 * Every offset here comes from formatting a real instant, so the result never
 * depends on the host's `TZ`.
 */
export const getUTCMillisecondsFromWallClock = (
  wallClockMilliseconds: number,
  timeZone: string,
): number => {
  const offsetBefore = getTimeZoneOffsetAtInstant(
    timeZone,
    wallClockMilliseconds - MillisecondsInDay,
  )
  const offsetAfter = getTimeZoneOffsetAtInstant(
    timeZone,
    wallClockMilliseconds + MillisecondsInDay,
  )

  const candidates =
    offsetBefore === offsetAfter ? [offsetBefore] : [offsetBefore, offsetAfter]

  const valid = candidates.filter(
    (candidate) =>
      getTimeZoneOffsetAtInstant(
        timeZone,
        wallClockMilliseconds - candidate,
      ) === candidate,
  )

  const chosen = valid.length > 0 ? Math.max(...valid) : Math.min(...candidates)

  return wallClockMilliseconds - chosen
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
