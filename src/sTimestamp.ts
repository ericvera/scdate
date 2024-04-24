import { toDate } from 'date-fns-tz'
import { SDate } from './internal/SDate'
import { STime } from './internal/STime'
import { STimestamp } from './internal/STimestamp'
import { MillisecondsPerSecond } from './internal/constants'
import {
  getISODateFromISOTimestamp,
  getISOTimeFromISOTimestamp,
  getISOTimestampFromUnzonedDate,
  getISOTimestampFromZonedDate,
  getTimestampAsUTCDateMini,
} from './internal/timestamp'
import { getZonedDate } from './internal/zoned'
import { getShortDateString, sDate } from './sDate'
import { get12HourTimeString, sTime } from './sTime'

export interface STimestampShortStringOptions {
  includeWeekday: boolean
  onTodayAtText: () => string
}

// TODO: Go through all usage of native Date objects and ensure that there are no timezone issues (timeZone is only used if needed)
// TODO: Go through all methods that return a Date and change naming to specigy getNativeDate...
// TODO: Go through all method names to ensure consistency

/**
 * --- Factory ---
 */

/**
 * Factory function for creating a new STimestamp instance or returns the same
 * instance if already an instance of STimestamp.
 * @param timestamp An instance of STimestamp that will be returned or a string
 *  in the ISO-8601 format (YYYY-MM-DDTHH:MM)
 */
export const sTimestamp = (timestamp: string | STimestamp): STimestamp => {
  if (timestamp instanceof STimestamp) {
    return timestamp
  }

  return new STimestamp(timestamp)
}

/**
 * --- Factory helpers ---
 */

/**
 * Returns the current timestamp for the given UTC date in the given time zone.
 */
export const getTimestampFromUTCDate = (
  utcDate: Date | number,
  timeZone: string,
): STimestamp => {
  const date = getZonedDate(utcDate, timeZone)

  return sTimestamp(getISOTimestampFromZonedDate(date))
}

/**
 * Returns the current timestamp for the given time zone.
 */
export const getTimestampNow = (timeZone: string): STimestamp => {
  return getTimestampFromUTCDate(Date.now(), timeZone)
}

/**
 * Returns a timestamp for the given date and time.
 */
export const getTimestampFromDateAndTime = (
  date: string | SDate,
  time: string | STime,
): STimestamp => {
  const sDateValue = sDate(date)
  const sDimeValue = sTime(time)

  return sTimestamp(`${sDateValue.date}T${sDimeValue.time}`)
}

/**
 * --- Getters ---
 */

/**
 * Returns the native Date representation of the timestamp in the given time
 * zone.
 */
export const getTimeZonedDateFromTimestamp = (
  timestamp: string | STimestamp,
  timeZone: string,
): Date => {
  const sTimestampValue = sTimestamp(timestamp)

  const dateFromISO = toDate(sTimestampValue.timestamp, { timeZone })

  if (isNaN(dateFromISO.valueOf())) {
    throw new Error(`Invalid time zone. Time zone: '${timeZone}'`)
  }

  const zonedTime = getZonedDate(dateFromISO, timeZone)

  return zonedTime
}

/**
 * Returns the number of seconds from to the given timestamp. If the timestamp
 * is in the future, the number of seconds will be positive. If the timestamp
 * is in the past, the number of seconds will be negative.
 */
export const getSecondsToTimestamp = (
  timestamp: string | STimestamp,
  timeZone: string,
): number => {
  const sTimestampValue = sTimestamp(timestamp)

  return (
    Math.floor(
      getTimeZonedDateFromTimestamp(sTimestampValue, timeZone).valueOf() -
        getZonedDate(new Date(), timeZone).valueOf(),
    ) / MillisecondsPerSecond
  )
}

/**
 * Returns the date part of the given timestamp.
 */
export const getDateFromTimestamp = (timestamp: string | STimestamp): SDate => {
  const sTimestampValue = sTimestamp(timestamp)

  return sDate(getISODateFromISOTimestamp(sTimestampValue.timestamp))
}

/**
 * Returns the time part of the given timestamp.
 */
export const getTimeFromTimestamp = (timestamp: string | STimestamp): STime => {
  const sTimestampValue = sTimestamp(timestamp)

  return sTime(getISOTimeFromISOTimestamp(sTimestampValue.timestamp))
}

/**
 * Returns a string representation of the timestamp in the short format. The
 * short format is a combination of the short date and the 12-hour time.
 */
export const getShortTimestampString = (
  timestamp: string | STimestamp,
  timeZone: string,
  locale: Intl.LocalesArgument,
  options: STimestampShortStringOptions,
): string => {
  const sTimestampValue = sTimestamp(timestamp)
  const date = getDateFromTimestamp(sTimestampValue)
  const time = getTimeFromTimestamp(sTimestampValue)

  const dateText = getShortDateString(date, timeZone, locale, {
    includeWeekday: options.includeWeekday,
    onTodayText: options.onTodayAtText,
  })
  const timeText = get12HourTimeString(time)

  return `${dateText} ${timeText}`
}

/**
 * --- Operations ---
 */

/**
 * Returns a new timestamp resulting from adding the given number of days to
 * the given timestamp.
 */
export const addDaysToTimestamp = (
  timestamp: string | STimestamp,
  days: number,
): STimestamp => {
  const sTimestampValue = sTimestamp(timestamp)
  const nativeDate = getTimestampAsUTCDateMini(sTimestampValue)

  nativeDate.setDate(nativeDate.getDate() + days)

  return sTimestamp(getISOTimestampFromUnzonedDate(nativeDate))
}

/**
 * Returns a new timestamp resulting from adding the given number of minutes to
 * the given timestamp. Time zone is taken into account which addresses the
 * issue of daylight saving time.
 */
export const addMinutesToTimestamp = (
  timestamp: string | STimestamp,
  minutes: number,
  timeZone: string,
): STimestamp => {
  const sTimestampValue = sTimestamp(timestamp)
  const zonedDate = getTimeZonedDateFromTimestamp(sTimestampValue, timeZone)

  zonedDate.setMinutes(zonedDate.getMinutes() + minutes)

  return sTimestamp(getISOTimestampFromZonedDate(zonedDate))
}

/**
 * --- Comparisons ---
 */

/**
 * Returns true if the two timestamps are the same.
 */
export const isSameTimestamp = (
  timestamp1: string | STimestamp,
  timestamp2: string | STimestamp,
): boolean => {
  const sTimestamp1 = sTimestamp(timestamp1)
  const sTimestamp2 = sTimestamp(timestamp2)

  return sTimestamp1.timestamp === sTimestamp2.timestamp
}

/**
 * Returns true if the first timestamp is before the second timestamp.
 */
export const isBeforeTimestamp = (
  timestamp1: string | STimestamp,
  timestamp2: string | STimestamp,
): boolean => {
  const sTimestamp1 = sTimestamp(timestamp1)
  const sTimestamp2 = sTimestamp(timestamp2)

  return sTimestamp1.timestamp < sTimestamp2.timestamp
}

/**
 * Returns true if the first timestamp is the same or before the second
 * timestamp.
 */
export const isSameTimestampOrBefore = (
  timestamp1: string | STimestamp,
  timestamp2: string | STimestamp,
): boolean => {
  const sTimestamp1 = sTimestamp(timestamp1)
  const sTimestamp2 = sTimestamp(timestamp2)

  return sTimestamp1.timestamp <= sTimestamp2.timestamp
}

/**
 * Returns true if the first timestamp is after the second timestamp.
 */
export const isAfterTimestamp = (
  timestamp1: string | STimestamp,
  timestamp2: string | STimestamp,
): boolean => {
  const sTimestamp1 = sTimestamp(timestamp1)
  const sTimestamp2 = sTimestamp(timestamp2)

  return sTimestamp1.timestamp > sTimestamp2.timestamp
}

/**
 * Returns true if the first timestamp is the same or after the second
 */
export const isSameTimestampOrAfter = (
  timestamp1: string | STimestamp,
  timestamp2: string | STimestamp,
): boolean => {
  const sTimestamp1 = sTimestamp(timestamp1)
  const sTimestamp2 = sTimestamp(timestamp2)

  return sTimestamp1.timestamp >= sTimestamp2.timestamp
}
