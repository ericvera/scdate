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

// TODO: Ensure timeZone related tests are properly documented
// TODO: Add tests for timeZone addMinuteToTimestamp

/**
 * --- Factory ---
 */

/**
 * Returns a new STimestamp instance.
 *
 * @param timestamp An instance of STimestamp or a string in the
 * YYYY-MM-DDTHH:MM format.
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
 * Returns a new STimestamp instance set to the date and time that results from
 * converting the given number of milliseconds since the Unix epoch to the given
 * time zone.
 *
 * @param utcDateInMilliseconds The number of milliseconds since the Unix epoch.
 * @param timeZone The time zone to use when creating the timestamp. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 */
export const getTimestampFromUTCMilliseconds = (
  utcDateInMilliseconds: number,
  timeZone: string,
): STimestamp => {
  const date = getTimeZonedDate(utcDateInMilliseconds, timeZone)

  return sTimestamp(getISOTimestampFromZonedDate(date))
}

/**
 * Returns a new STimestamp instance set to the current date and time in the
 * given time zone.
 *
 * @param timeZone The time zone to use when creating the timestamp. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 */
export const getTimestampNow = (timeZone: string): STimestamp => {
  return getTimestampFromUTCMilliseconds(Date.now(), timeZone)
}

/**
 * Returns a new STimestamp instance set to the date and time that results from
 * combining the given date and time.
 *
 * @param date The date to use when creating the timestamp. It can be an SDate
 * or a string in the YYYY-MM-DD format.
 * @param time The time to use when creating the timestamp. It can be an STime
 * or a string in the HH:MM format.
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
 * Returns a native Date adjusted so that the local time of that date matches
 * the local timestamp at the specified time zone.
 *
 * @param date The date to get the time zoned date from. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param timeZone The time zone to adjust the date to. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
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
 * The following notes use `America/New_York` as the time zone to explain how
 * Daylight Savings is handled, but it works the same across time zones on their
 * respective Daylight Saving schedules as defined by Intl API.
 *
 * Notice that when looking at a watch (that adjusts for Daylight Saving
 * automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
 * the time moves forward one hour) the times between 02:00 and 02:59 never
 * happen as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the
 * day the time zone goes back to Standard Time), the times between 01:00 and
 * 01:59 happen twice as the first time the watch hits 02:00 it goes back to
 * 01:00.
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
 * Transition to Eastern Daylight Time (EDT) in 2024
 * | Time Zone        | T1                    | T2                     | T3                    |
 * |------------------|-----------------------|------------------------|-----------------------|
 * | America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT)  | 2024-03-10T03:00(EST) |
 * | UTC              | 2024-03-10T06:59      | 2024-03-10T06:00       | 2024-03-10T07:00      |
 *
 * Transition to Eastern Standard Time (EST) in 2024
 * | Time Zone        | T1                    | T2                     | T3                    |
 * |------------------|-----------------------|------------------------|-----------------------|
 * | America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST)  | 2024-11-03T03:00(EST) |
 * | UTC              | 2024-11-03T05:59      | 2024-11-03T07:00       | 2024-11-03T08:00      |
 *
 * @param timestamp The timestamp to get the seconds to. It can be an STimestamp
 * or a string in the YYYY-MM-DDTHH:MM format.
 * @param timeZone The time zone to use when creating the timestamp. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
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
 * Returns a new SDate instance set to the date part of the given timestamp.
 *
 * @param timestamp The timestamp to get the date from. It can be an STimestamp
 * or a string in the YYYY-MM-DDTHH:MM format.
 */
export const getDateFromTimestamp = (timestamp: string | STimestamp): SDate => {
  const sTimestampValue = sTimestamp(timestamp)

  return sDate(getISODateFromISOTimestamp(sTimestampValue.timestamp))
}

/**
 * Returns a new STime instance set to the time part of the given timestamp.
 *
 * @param timestamp The timestamp to get the time from. It can be an STimestamp
 * or a string in the YYYY-MM-DDTHH:MM format.
 */
export const getTimeFromTimestamp = (timestamp: string | STimestamp): STime => {
  const sTimestampValue = sTimestamp(timestamp)

  return sTime(getISOTimeFromISOTimestamp(sTimestampValue.timestamp))
}

/**
 * Returns a string representation that includes a minimum set of components
 * from the given timestamp. This is a combination of the the results of
 * the `getShortDateString` method, and `get12HourTimeString`.
 *
 * @param timestamp The timestamp to get the short string from. It can be an
 * STimestamp or a string in the YYYY-MM-DDTHH:MM format.
 * @param timeZone The time zone to use when creating the short string. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 * @param locale The locale to use for the string representation.
 * @param options An object with options for the short string representation.
 *
 * @example
 * ```ts
 * // Example when the timestamp is today
 * getShortTimestampString('2021-08-10T08:00', 'America/Puerto_Rico', 'en', {
 *   includeWeekday: true,
 *   onTodayAtText: () => 'Today at',
 * })
 * //=> 'Today at 8:00 AM'
 * ```
 *
 * @example
 * ```ts
 * // Example when the timestamp is not today
 * getShortTimestampString('2022-09-11T08:00', 'America/Puerto_Rico', 'es', {
 *   includeWeekday: true,
 *   onTodayAtText: () => 'Hoy a las',
 * })
 * //=> 'dom, 11 sept 22 8:00 AM'
 * ```
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
 * Returns a new STimestamp instance resulting from adding the given number of
 * calendar days to the given timestamp. Because it adds calendar days rather
 * than 24-hour days, this operation is not affected by time zones.
 *
 * @param timestamp The timestamp to add days to. It can be an STimestamp or a
 * string in the YYYY-MM-DDTHH:MM format.
 * @param days The number of days to add to the timestamp.
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
 * Returns a new STimestamp instance resulting from adding the given number of
 * minutes to the given timestamp.
 *
 * Daylight Saving Time Notes:
 *
 * The following notes use `America/New_York` as the time zone to explain how
 * Daylight Savings is handled, but it works the same across time zones on their
 * respective Daylight Saving schedules as defined by Intl API.
 *
 * Notice that when looking at a watch (that adjusts for Daylight Saving
 * automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
 * the time moves forward one hour) the times between 02:00 and 02:59 never
 * happen as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the
 * day the time zone goes back to Standard Time), the times between 01:00 and
 * 01:59 happen twice as the first time the watch hits 02:00 it goes back to
 * 01:00.
 *
 * To account for time zone changes, this method converts the timestamp to UTC
 * milliseconds before adding the specified minutes. This works as expected for
 * all times, but the expectation for the transition times (those that don't
 * happen on a watch that automatically adjusts or that happen twice) it can
 * work in unexpected ways.
 *
 * Time is converted from the given time zone to
 * UTC before the minutes are added, and then converted back to the specified
 * time zone. This results in the resulting time being adjusted for daylight saving time
 * changes. (e.g. Adding 60 minutes to 2024-03-10T01:59 in America/New_York will
 * result in 2024-03-10T03:59 as time move forward one hour for daylight saving
 * time at 2024-03-10T02:00.)
 *
 * For example, adding one minute to 2024-03-10T01:59 will result in
 * 2024-03-10T03:00 as expected. However, trying to add one minute to
 * 2024-03-10T02:00 (a time that technically does not exist on a watch that
 * automatically adjusts for Daylight Saving) will result in 2024-03-10T01:01.
 * This is because 2024-03-10T02:00 is converted to 2024-03-10T06:00 UTC (due
 * to timezone offset being -4 starting from 02:00 local time) and one minute
 * later would be 2024-03-10T06:01 UTC  which would be 2024-03-10T01:01 in
 * `America/New_York`. A similar situation happens when the time zone
 * transitions from Daylight Saving Time to Standard Time as can be derived from
 * the table below.
 *
 * In 'America/New_York'
 *
 * Transition to Eastern Daylight Time (EDT) in 2024
 * | Time Zone        | T1                    | T2                     | T3                    |
 * |------------------|-----------------------|------------------------|-----------------------|
 * | America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT)  | 2024-03-10T03:00(EST) |
 * | UTC              | 2024-03-10T06:59      | 2024-03-10T06:00       | 2024-03-10T07:00      |
 *
 * Transition to Eastern Standard Time (EST) in 2024
 * | Time Zone        | T1                    | T2                     | T3                    |
 * |------------------|-----------------------|------------------------|-----------------------|
 * | America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST)  | 2024-11-03T03:00(EST) |
 * | UTC              | 2024-11-03T05:59      | 2024-11-03T07:00       | 2024-11-03T08:00      |
 *
 * @param timestamp The timestamp to add minutes to. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 * @param minutes The number of minutes to add to the timestamp.
 * @param timeZone The time zone to use when creating the timestamp. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
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
 * Returns true if the two timestamps represent the same date and time. Returns
 * false otherwise.
 *
 * @param timestamp1 The first timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 * @param timestamp2 The second timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
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
 * Returns true if the first timestamp represents a date and time that happens
 * before the second timestamp. Returns false otherwise.
 *
 * @param timestamp1 The first timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 * @param timestamp2 The second timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
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
 * Returns true if the first timestamp represents a date and time that happens
 * on or before the second timestamp. Returns false otherwise.
 *
 * @param timestamp1 The first timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 * @param timestamp2 The second timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
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
 * Returns true if the first timestamp represents a date and time that happens
 * after the second timestamp. Returns false otherwise.
 *
 * @param timestamp1 The first timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 * @param timestamp2 The second timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
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
 * Returns true if the first timestamp represents a date and time that happens
 * on or after the second timestamp. Returns false otherwise.
 *
 * @param timestamp1 The first timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 * @param timestamp2 The second timestamp to compare. It can be an STimestamp or
 * a string in the YYYY-MM-DDTHH:MM format.
 */
export const isSameTimestampOrAfter = (
  timestamp1: string | STimestamp,
  timestamp2: string | STimestamp,
): boolean => {
  const sTimestamp1 = sTimestamp(timestamp1)
  const sTimestamp2 = sTimestamp(timestamp2)

  return sTimestamp1.timestamp >= sTimestamp2.timestamp
}
