import { millisecondsInMinute, millisecondsInSecond } from 'date-fns/constants'
import { SDate } from './internal/SDate'
import { STime } from './internal/STime'
import { STimestamp } from './internal/STimestamp'
import {
  getISODateFromISOTimestamp,
  getISOTimeFromISOTimestamp,
  getISOTimestampFromZonedDate,
  getTimestampAsUTCDateMini,
} from './internal/timestamp'
import {
  getMillisecondsInUTCFromTimestamp,
  getTimeZonedDate,
} from './internal/zoned'
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
export const getTimestampFromUTCMilliseconds = (
  utcDateInMilliseconds: number,
  timeZone: string,
): STimestamp => {
  const date = getTimeZonedDate(utcDateInMilliseconds, timeZone)

  return sTimestamp(getISOTimestampFromZonedDate(date))
}

/**
 * Returns the current timestamp for the given time zone.
 */
export const getTimestampNow = (timeZone: string): STimestamp => {
  return getTimestampFromUTCMilliseconds(Date.now(), timeZone)
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

  const dateInUTCMilliseconds = getMillisecondsInUTCFromTimestamp(
    sTimestampValue,
    timeZone,
  )

  return getTimeZonedDate(dateInUTCMilliseconds, timeZone)
}

/**
 * Returns the number of seconds from now to the given timestamp. If the
 * timestamp is in the future, the number of seconds will be positive. If the
 * timestamp is in the past, the number of seconds will be negative.
 *
 * Daylight Saving Notes:
 *
 * The following notes uses America/New_York as the time zone to explain how
 * Daylight Savings is handled, but it works the same across time zones on their
 * respective Daylight schedules as defined by Intl API.
 *
 * Notice that when looking at a watch (that adjusts for Daylight Saving
 * automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
 * the time moves forward one hour) the times between 02:00 and 02:59 never happen
 * as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the day the
 * time zone goes back to Standard Time), the times between 01:00 and 01:59
 * happen twice as the first time the watch hits 02:00 it goes back to 01:00.
 *
 * To account for time zone changes, this method converts the timestamp to UTC
 * milliseconds (for both the current time and the expected timestamp) before
 * calculating the difference in seconds. This works as expected for all times,
 * but the expectation for the transition times (those that don't happen on a
 * watch that automatically adjusts or that happen twice) it can work in
 * unexpected ways.
 *
 * For example, trying to calculate the number of seconds to 2024-03-10T02:00
 * (the start of Daylight Saving Time) at 2024-03-10T01:59 (still in Standard
 * Time) will result in -3540 seconds (59 minutes in the past). A similar
 * situation happens when the time zone transitions from Daylight Saving Time to
 * Standard Time as can be derived from the table below.
 *
 * In 'America/New_York'
 *
 * | Transition to Eastern Daylight Time (EDT) in 2024 ----------------------------------------|
 * | America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT) | 2024-03-10T03:00(EST) |
 * | UTC              | 2024-03-10T06:59      | 2024-03-10T06:00       | 2024-03-10T07:00      |
 *
 * | Transition to Eastern Standard Time (EST) in 2024 ----------------------------------------|
 * | America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST)  | 2024-11-03T03:00(EST) |
 * | UTC              | 2024-11-03T05:59      | 2024-11-03T07:00       | 2024-11-03T08:00      |
 *
 */
export const getSecondsToTimestamp = (
  timestamp: string | STimestamp,
  timeZone: string,
): number => {
  const sTimestampValue = sTimestamp(timestamp)

  const millisecondsNow = Date.now()
  const millisecondsAtTimestamp = getMillisecondsInUTCFromTimestamp(
    sTimestampValue,
    timeZone,
  )

  return Math.floor(
    (millisecondsAtTimestamp - millisecondsNow) / millisecondsInSecond,
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
 * Returns a new timestamp resulting from adding the given number of calendar
 * days (rather than 24-horu days) to the given timestamp. Becaues it adds
 * calendar days rather than 24-hour days, this operation is not affected by
 * time zones.
 */
export const addDaysToTimestamp = (
  timestamp: string | STimestamp,
  days: number,
): STimestamp => {
  const sTimestampValue = sTimestamp(timestamp)
  const nativeDate = getTimestampAsUTCDateMini(sTimestampValue)

  nativeDate.setDate(nativeDate.getDate() + days)

  return sTimestamp(getISOTimestampFromZonedDate(nativeDate))
}

/**
 * Returns a new timestamp resulting from adding the given number of minutes to
 * the given timestamp. Time is converted from the given time zone to UTC before
 * the minutes are added, and then converted back to the specified time zone.
 * This results in the resulting time being adjusted for daylight saving time
 * changes. (e.g. Adding 60 minutes to 2024-03-10T01:59 in America/New_York will
 * result in 2024-03-10T03:59 as time move forward one hour for daylight saving
 * time at 2024-03-10T02:00.)
 */
export const addMinutesToTimestamp = (
  timestamp: string | STimestamp,
  minutes: number,
  timeZone: string,
): STimestamp => {
  const sTimestampValue = sTimestamp(timestamp)

  const newMillisecondsInUTC =
    getMillisecondsInUTCFromTimestamp(sTimestampValue, timeZone) +
    minutes * millisecondsInMinute

  const newTimestamp = getTimestampFromUTCMilliseconds(
    newMillisecondsInUTC,
    timeZone,
  )

  return newTimestamp
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
