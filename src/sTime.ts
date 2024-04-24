import { STime } from './internal/STime'
import {
  HoursPerDay,
  MinutesPerDay,
  MinutesPerHour,
} from './internal/constants'
import {
  getISOHoursFromISOTime,
  getISOMinutesFromISOTime,
  getISOTimeFromDate,
} from './internal/time'
import { getZonedDate } from './internal/zoned'

/**
 * --- Factory ---
 */

/**
 * Factory function for creating a new STime instance or returns the same
 * instance if already an instance of STime.
 * @param time An instance of STime that will be returned or a string in the
 *  ISO-8601 format (HH:MM).
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
 * Returns the current time in the given time zone.
 */
export const getTimeNow = (timeZone: string): STime => {
  const date = getZonedDate(new Date(), timeZone)

  return sTime(getISOTimeFromDate(date))
}

/**
 * Returns the time at midnight (00:00).
 */
export const getTimeAtMidnight = (): STime => sTime('00:00')

/**
 * Returns the time resulting from adding the given number of minutes to
 * midnight.
 */
export const getTimeFromMinutes = (timeInMinutes: number): STime => {
  const midnight = getTimeAtMidnight()

  return addMinutesToTime(midnight, timeInMinutes)
}

/**
 * --- Getters ---
 */

/**
 * Returns the hours part of the given time.
 */
export const getHoursFromTime = (time: string | STime): number => {
  const sTimeValue = sTime(time)

  return Number(getISOHoursFromISOTime(sTimeValue.time))
}

/**
 * Returns the hours part of the given time as a string.
 */
export const getHoursStringFromTime = (time: string | STime): string => {
  const HoursPMStart = 12
  const sTimeValue = sTime(time)

  const hours = getHoursFromTime(sTimeValue) % HoursPMStart

  return hours === 0 ? '12' : hours.toString()
}

/**
 * Returns the minutes part of the given time.
 */
export const getMinutesFromTime = (time: string | STime): number => {
  const sTimeValue = sTime(time)

  return Number(getISOMinutesFromISOTime(sTimeValue.time))
}

/**
 * Returns the minutes part of the given time as a string.
 */
export const getMinutesStringFromTime = (time: string | STime): string => {
  const sTimeValue = sTime(time)

  return getISOMinutesFromISOTime(sTimeValue.time)
}

/**
 * Returns the time in the 12-hour format (HH:MM AM/PM).
 */
export const get12HourTimeString = (time: string | STime): string => {
  const sTimeValue = sTime(time)

  return `${getHoursStringFromTime(sTimeValue)}:${getMinutesStringFromTime(sTimeValue)} ${
    isTimePM(sTimeValue) ? 'PM' : 'AM'
  }`
}

/**
 * Returns the time converted to minutes since midnight.
 */
export const getTimeInMinutes = (
  time: string | STime,
  midnightIs24 = false,
): number => {
  const sTimeValue = sTime(time)

  const MidnightInMinutes24Value = HoursPerDay * MinutesPerHour
  const MidnightInMinutes0Value = 0

  const timeInMinutesMidnight0 =
    getHoursFromTime(sTimeValue) * MinutesPerHour +
    getMinutesFromTime(sTimeValue)

  if (midnightIs24 && timeInMinutesMidnight0 === MidnightInMinutes0Value) {
    return MidnightInMinutes24Value
  }

  return timeInMinutesMidnight0
}

/**
 * --- Operations ---
 */

/**
 * Adds the given number of minutes to the given time. The time will wrap around
 * a 24 hour clock.
 */
export const addMinutesToTime = (
  time: string | STime,
  minutes: number,
): STime => {
  const sTimeValue = sTime(time)

  let totalMinutes = (getTimeInMinutes(sTimeValue) + minutes) % MinutesPerDay

  if (totalMinutes < 0) {
    totalMinutes += MinutesPerDay
  }

  const newHours = Math.floor(totalMinutes / MinutesPerHour)
  const newMinutes = totalMinutes % MinutesPerHour

  return sTime(
    `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`,
  )
}

/**
 * --- Comparisons ---
 */

/**
 * Returns whether the two times are the same.
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
 * Returns whether the first time is after the second.
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
 * Returns whether the first time is the same or after the second.
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
 * Returns whether the first time is before the second.
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
 * Returns whether the first time is the same or before the second.
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
 * Returns whether the given time is in the PM.
 */
export const isTimePM = (time: string | STime): boolean => {
  const sTimeValue = sTime(time)

  const NoonValue = '12:00'

  return sTimeValue.time >= NoonValue
}
