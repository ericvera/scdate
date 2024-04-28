import { minutesInDay, minutesInHour } from 'date-fns/constants'
import { STime } from './internal/STime'
import {
  getISOHoursFromISOTime,
  getISOMinutesFromISOTime,
  getISOTimeFromDate,
} from './internal/time'
import { getTimeZonedDate } from './internal/zoned'

/**
 * --- Factory ---
 */

/**
 * Returns a new STime instance.
 *
 * @param time And instance of STime or a string in the format 'HH:MM'.
 */
export const sTime = (time: string | STime): STime => {
  if (time instanceof STime) {
    return time
  }

  return new STime(time)
}

/**
 * --- Factory helpers ---
 */

/**
 * Returns a new STime instance with the current time in the given time zone.
 *
 * @param timeZone The time zone to get the current time in. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 */
export const getTimeNow = (timeZone: string): STime => {
  const date = getTimeZonedDate(Date.now(), timeZone)

  return sTime(getISOTimeFromDate(date))
}

/**
 * Returns a new STime instance with the time at midnight (00:00).
 */
export const getTimeAtMidnight = (): STime => sTime('00:00')

/**
 * Returns a new STime instance with the time resulting from adding the given
 * number of minutes to midnight (00:00).
 *
 * @param timeInMinutes The number of minutes to add to midnight.
 */
export const getTimeFromMinutes = (timeInMinutes: number): STime => {
  const midnight = getTimeAtMidnight()

  return addMinutesToTime(midnight, timeInMinutes)
}

/**
 * --- Getters ---
 */

/**
 * Returns the hours from the given time.
 *
 * @param time The time to get the hours from. It can be an STime or a string
 * in the HH:MM format.
 */
export const getHoursFromTime = (time: string | STime): number => {
  const sTimeValue = sTime(time)

  return Number(getISOHoursFromISOTime(sTimeValue.time))
}

/**
 * Returns the hours from given time as a string (1 - 12).
 *
 * @param time The time to get the hours from. It can be an STime or a string
 * in the HH:MM format.
 */
export const get12HoursHoursStringFromTime = (time: string | STime): string => {
  const HoursPMStart = 12
  const sTimeValue = sTime(time)

  const hours = getHoursFromTime(sTimeValue) % HoursPMStart

  return hours === 0 ? '12' : hours.toString()
}

/**
 * Returns the minutes from the given time.
 *
 * @param time The time to get the minutes from. It can be an STime or a string
 * in the HH:MM format.
 */
export const getMinutesFromTime = (time: string | STime): number => {
  const sTimeValue = sTime(time)

  return Number(getISOMinutesFromISOTime(sTimeValue.time))
}

/**
 * Returns the minutes from given time as a string (00-59).
 *
 * @param time The time to get the minutes from. It can be an STime or a string
 * in the HH:MM format.
 */
export const getMinutesStringFromTime = (time: string | STime): string => {
  const sTimeValue = sTime(time)

  return getISOMinutesFromISOTime(sTimeValue.time)
}

/**
 * Returns a string that represents the time in a 12-hour format (HH:MM AM/PM).
 *
 * @param time The time to get the string from. It can be an STime or a string
 * in the HH:MM format.
 */
export const get12HourTimeString = (time: string | STime): string => {
  const sTimeValue = sTime(time)

  return `${get12HoursHoursStringFromTime(sTimeValue)}:${getMinutesStringFromTime(sTimeValue)} ${
    isTimePM(sTimeValue) ? 'PM' : 'AM'
  }`
}

/**
 * Returns the time converted to minutes since midnight.
 *
 * @param time The time to get the minutes from. It can be an STime or a string
 * in the HH:MM format.
 */
export const getTimeInMinutes = (
  time: string | STime,
  midnightIs24 = false,
): number => {
  const sTimeValue = sTime(time)

  const timeInMinutesMidnight0 =
    getHoursFromTime(sTimeValue) * minutesInHour +
    getMinutesFromTime(sTimeValue)

  if (midnightIs24 && timeInMinutesMidnight0 === 0) {
    return minutesInDay
  }

  return timeInMinutesMidnight0
}

/**
 * --- Operations ---
 */

/**
 * Returns a new STime instance with the time resulting from adding the given
 * number of minutes to the given time. The time will wrap around a 24 hour
 * clock.
 *
 * @param time The time to add the minutes to. It can be an STime or a string
 * in the HH:MM format.
 * @param minutes The number of minutes to add.
 */
export const addMinutesToTime = (
  time: string | STime,
  minutes: number,
): STime => {
  const sTimeValue = sTime(time)

  let totalMinutes = (getTimeInMinutes(sTimeValue) + minutes) % minutesInDay

  if (totalMinutes < 0) {
    totalMinutes += minutesInDay
  }

  const newHours = Math.floor(totalMinutes / minutesInHour)
  const newMinutes = totalMinutes % minutesInHour

  return sTime(
    `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`,
  )
}

/**
 * --- Comparisons ---
 */

/**
 * Returns true when the two times are the same and false otherwise.
 *
 * @param time1 The first time to compare. It can be an STime or a string in the
 * HH:MM format.
 * @param time2 The second time to compare. It can be an STime or a string in
 * the HH:MM format.
 */
export const isSameTime = (
  time1: string | STime,
  time2: string | STime,
): boolean => {
  const sTime1 = sTime(time1)
  const sTime2 = sTime(time2)

  return sTime1.time === sTime2.time
}

/**
 * Returns true when first time represents a time that happens after the second
 * time. Returns false otherwise.
 *
 * @param time1 The first time to compare. It can be an STime or a string in the
 * HH:MM format.
 * @param time2 The second time to compare. It can be an STime or a string in
 * the HH:MM format.
 */
export const isAfterTime = (
  time1: string | STime,
  time2: string | STime,
): boolean => {
  const sTime1 = sTime(time1)
  const sTime2 = sTime(time2)

  return sTime1.time > sTime2.time
}

/**
 * Returns true when first time represents a time that happens after or at the
 * same time as the second time. Returns false otherwise.
 *
 * @param time1 The first time to compare. It can be an STime or a string in the
 * HH:MM format.
 * @param time2 The second time to compare. It can be an STime or a string in
 * the HH:MM format.
 */
export const isSameTimeOrAfter = (
  time1: string | STime,
  time2: string | STime,
): boolean => {
  const sTime1 = sTime(time1)
  const sTime2 = sTime(time2)

  return sTime1.time >= sTime2.time
}

/**
 * Returns true when first time represents a time that happens before the
 * second time. Returns false otherwise.
 *
 * @param time1 The first time to compare. It can be an STime or a string in the
 * HH:MM format.
 * @param time2 The second time to compare. It can be an STime or a string in
 * the HH:MM format.
 */
export const isBeforeTime = (
  time1: string | STime,
  time2: string | STime,
): boolean => {
  const sTime1 = sTime(time1)
  const sTime2 = sTime(time2)

  return sTime1.time < sTime2.time
}

/**
 * Returns true when first time represents a time that happens before or at the
 * same time as the second time. Returns false otherwise.
 *
 * @param time1 The first time to compare. It can be an STime or a string in the
 * HH:MM format.
 * @param time2 The second time to compare. It can be an STime or a string in
 * the HH:MM format.
 */
export const isSameTimeOrBefore = (
  time1: string | STime,
  time2: string | STime,
): boolean => {
  const sTime1 = sTime(time1)
  const sTime2 = sTime(time2)

  return sTime1.time <= sTime2.time
}

/**
 * Returns true when the given time is at or after noon (12:00) and false
 * otherwise.
 *
 * @param time The time to check. It can be an STime or a string in the HH:MM
 * format.
 */
export const isTimePM = (time: string | STime): boolean => {
  const sTimeValue = sTime(time)

  const NoonValue = '12:00'

  return sTimeValue.time >= NoonValue
}
