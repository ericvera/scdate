/**
 * --- Factory ---
 */

import { DayToWeekday, Weekday } from './constants.js'
import { SDate } from './internal/SDate.js'
import { SWeekdays } from './internal/SWeekdays.js'
import { DaysInWeek } from './internal/constants.js'
import { getAtIndex, hasFlag } from './internal/utils.js'
import { getIndexForWeekday } from './internal/weekdays.js'
import {
  addDaysToDate,
  getDaysBetweenDates,
  getWeekdayFromDate,
  isAfterDate,
  isSameDateOrBefore,
  sDate,
} from './sDate.js'

const AllWeekdaysIncludedMask = 'SMTWTFS'
const NotIncludedDay = '-'
const NoWeekdaysIncluded = NotIncludedDay.repeat(AllWeekdaysIncludedMask.length)
const WeekdaysCount = AllWeekdaysIncludedMask.length

/**
 * Returns a new SWeekdays instance.
 *
 * @param weekdays An instance of SWeekdays that will be returned or a string in
 * the SMTWTFS format. Each character in the string represents a weekday
 * starting on Sunday and ending on Saturday using the first letter of the
 * English word for the week day. If the weekday is excluded, the position is
 * filled with a '-' character.
 *
 * @example
 * ```ts
 * sWeekdays('SM----S')
 * // Returns an instance of SWeekdays with the weekdays Sunday, Monday, and
 * // Saturday included while the rest are excluded.
 * ```
 *
 * @example
 * ```ts
 * sWeekdays('SMTWTFS')
 * // Returns an instance of SWeekdays with all weekdays included.
 * ```
 */
export const sWeekdays = (weekdays: string | SWeekdays): SWeekdays => {
  if (weekdays instanceof SWeekdays) {
    return weekdays
  }

  return new SWeekdays(weekdays)
}

/**
 * --- Factory helpers ---
 */

/**
 * Returns a new SWeekdays instance with all provided weekdays included. The
 * provided weekdays can be any combination of the Weekday enum values.
 *
 * @param weekdays A combination of the Weekday enum values.
 *
 * @example
 * ```ts
 * getWeekdaysFromWeekdayFlags(
 *   Weekday.Monday | Weekday.Wednesday | Weekday.Friday
 * )
 * // Returns an instance of SWeekdays with the weekdays Monday,
 * // Wednesday, and Friday included while the rest are excluded.
 * ```
 *
 * @example
 * ```ts
 * getWeekdaysFromWeekdayFlags(Weekday.Tuesday)
 * // Returns an instance of SWeekdays with the weekday Tuesday included while
 * // the rest are excluded.
 * ```
 */
export const getWeekdaysFromWeekdayFlags = (weekdays: Weekday): SWeekdays => {
  const newWeekdays = Array.from(AllWeekdaysIncludedMask)

  for (let i = 0; i < DayToWeekday.length; i++) {
    const weekday = getAtIndex(DayToWeekday, i)

    if (!hasFlag(weekdays, weekday)) {
      newWeekdays[i] = NotIncludedDay
    }
  }

  return sWeekdays(newWeekdays.join(''))
}

/**
 * Returns a new SWeekdays instance with all weekdays included.
 */
export const getWeekdaysWithAllIncluded = (): SWeekdays => {
  return sWeekdays(AllWeekdaysIncludedMask)
}

/**
 * Returns a new SWeekdays instance with no weekdays included.
 */
export const getWeekdaysWithNoneIncluded = (): SWeekdays => {
  return sWeekdays(NoWeekdaysIncluded)
}

/**
 * --- Operations ---
 */

/**
 * Returns the previous weekday (the day before the provided weekday).
 *
 * @param weekday The weekday to get the previous weekday for.
 *
 * @example
 * ```ts
 * getPreviousWeekday(Weekday.Mon)
 * // Returns Weekday.Sun
 * ```
 *
 * @example
 * ```ts
 * getPreviousWeekday(Weekday.Sun)
 * // Returns Weekday.Sat
 * ```
 */
export const getPreviousWeekday = (weekday: Weekday): Weekday => {
  const weekdayIndex = getIndexForWeekday(weekday)
  const previousIndex = (weekdayIndex + DaysInWeek - 1) % DaysInWeek

  return getAtIndex(DayToWeekday, previousIndex)
}

/**
 * Returns the next weekday (the day after the provided weekday).
 *
 * @param weekday The weekday to get the next weekday for.
 *
 * @example
 * ```ts
 * getNextWeekday(Weekday.Mon)
 * // Returns Weekday.Tue
 * ```
 *
 * @example
 * ```ts
 * getNextWeekday(Weekday.Sat)
 * // Returns Weekday.Sun
 * ```
 */
export const getNextWeekday = (weekday: Weekday): Weekday => {
  const weekdayIndex = getIndexForWeekday(weekday)
  const nextIndex = (weekdayIndex + 1) % DaysInWeek

  return getAtIndex(DayToWeekday, nextIndex)
}

/**
 * Returns a new SWeekdays instance with the weekdays shifted forward by one
 * day.
 *
 * @param weekdays The weekdays to shift forward. It can be an SWeekdays or a
 * string in the SMTWTFS format.
 *
 * @example
 * ```ts
 * shiftWeekdaysForward('SM----S')
 * // Returns an instance of SWeekdays with the weekdays shifted forward by one
 * // day. 'SM----S' becomes 'SMT----'.
 * ```
 */
export const shiftWeekdaysForward = (
  weekdays: string | SWeekdays,
): SWeekdays => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const after = Array.from(NoWeekdaysIncluded)

  const DayShift = 1

  for (let i = 0; i < WeekdaysCount; i++) {
    const prevDayIndex = (WeekdaysCount - DayShift + i) % WeekdaysCount

    after[i] =
      sWeekdaysInstance.weekdays[prevDayIndex] === NotIncludedDay
        ? NotIncludedDay
        : getAtIndex(AllWeekdaysIncludedMask, i)
  }

  return sWeekdays(after.join(''))
}

/**
 * Returns a new SWeekdays instance where only the weekdays that are within the
 * provided date range are included.
 *
 * @param weekdays The weekdays to filter. It can be an SWeekdays or a string in
 * the SMTWTFS format.
 * @param fromDate The start date of the range. It can be an SDate or a string
 * in the YYYY-MM-DD format.
 * @param toDate The end date of the range. It can be an SDate or a string in
 * the YYYY-MM-DD format.
 *
 * @example
 * ```ts
 * filterWeekdaysForDates('SMTWTFS', '2020-03-05', '2020-03-05')
 * // Returns an instance of SWeekdays with only Thursday included.
 * ```
 */
export const filterWeekdaysForDates = (
  weekdays: string | SWeekdays,
  fromDate: string | SDate,
  toDate: string | SDate,
): SWeekdays => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const sFromDate = sDate(fromDate)
  const sToDate = sDate(toDate)

  if (isAfterDate(sFromDate, sToDate)) {
    throw new Error('The from date must be before the to date.')
  }

  const diff = getDaysBetweenDates(sFromDate, sToDate)

  // All selected weekdays are already included
  if (diff >= DaysInWeek) {
    return sWeekdaysInstance
  }

  // Less than a week only include the applicable days
  let result = getWeekdaysWithNoneIncluded()
  const DayAfterDelta = 1

  for (
    let date = fromDate;
    isSameDateOrBefore(date, toDate);
    date = addDaysToDate(date, DayAfterDelta)
  ) {
    const weekday = getWeekdayFromDate(date)

    if (doesWeekdaysIncludeWeekday(sWeekdaysInstance, weekday)) {
      result = addWeekdayToWeekdays(result, weekday)
    }
  }

  return result
}

/**
 * Returns a new SWeekdays instance with the provided weekday added to the
 * current set of weekdays.
 *
 * @param weekdays The weekdays to add the weekday to. It can be an SWeekdays or
 * a string in the SMTWTFS format.
 * @param weekdayToAdd The weekday to add.
 */
export const addWeekdayToWeekdays = (
  weekdays: string | SWeekdays,
  weekdayToAdd: Weekday,
): SWeekdays => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const newWeekdays = Array.from(sWeekdaysInstance.weekdays)
  const weekdayIndex = getIndexForWeekday(weekdayToAdd)

  newWeekdays[weekdayIndex] = getAtIndex(AllWeekdaysIncludedMask, weekdayIndex)

  return sWeekdays(newWeekdays.join(''))
}

/**
 * Returns a new SWeekdays instance with the provided weekday removed from the
 * current set of weekdays.
 *
 * @param weekdays The weekdays to remove the weekday from. It can be an
 * SWeekdays or a string in the SMTWTFS format.
 * @param weekdayToRemove The weekday to remove.
 */
export const removeWeekdayFromWeekdays = (
  weekdays: string | SWeekdays,
  weekdayToRemove: Weekday,
): SWeekdays => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const newWeekdays = Array.from(sWeekdaysInstance.weekdays)
  const weekdayIndex = getIndexForWeekday(weekdayToRemove)

  newWeekdays[weekdayIndex] = NotIncludedDay

  return sWeekdays(newWeekdays.join(''))
}

/**
 * Returns a new SWeekdays instance with the provided weekday toggled. If the
 * weekday is currently included, it is removed. If it is excluded, it is
 * added.
 *
 * @param weekdays The weekdays to toggle the weekday in. It can be an
 * SWeekdays or a string in the SMTWTFS format.
 * @param weekdayToToggle The weekday to toggle.
 */
export const toggleWeekdayInWeekdays = (
  weekdays: string | SWeekdays,
  weekdayToToggle: Weekday,
): SWeekdays => {
  if (doesWeekdaysIncludeWeekday(weekdays, weekdayToToggle)) {
    return removeWeekdayFromWeekdays(weekdays, weekdayToToggle)
  }

  return addWeekdayToWeekdays(weekdays, weekdayToToggle)
}

/**
 * --- Comparisons ---
 */

/**
 * Returns true if the provided weekdays include the provided weekday. Returns
 * false otherwise.
 *
 * @param weekdays The weekdays to check. It can be an SWeekdays or a string in
 * the SMTWTFS format.
 * @param weekday The weekday to check.
 */
export const doesWeekdaysIncludeWeekday = (
  weekdays: string | SWeekdays,
  weekday: Weekday,
): boolean => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const weekdayIndex = getIndexForWeekday(weekday)

  return getAtIndex(sWeekdaysInstance.weekdays, weekdayIndex) !== NotIncludedDay
}

/**
 * Returns true if any of the included weekdays in weekdays1 is also included in
 * weekdays2. Returns false otherwise.
 *
 * @param weekdays1 The first set of weekdays to compare. It can be an SWeekdays
 * or a string in the SMTWTFS format.
 * @param weekdays2 The second set of weekdays to compare. It can be an
 * SWeekdays or a string in the SMTWTFS format.
 */
export const doesWeekdaysHaveOverlapWithWeekdays = (
  weekdays1: string | SWeekdays,
  weekdays2: string | SWeekdays,
): boolean => {
  const sWeekdays1 = sWeekdays(weekdays1)
  const sWeekdays2 = sWeekdays(weekdays2)

  for (let i = 0; i < WeekdaysCount; i++) {
    if (
      sWeekdays1.weekdays[i] !== NotIncludedDay &&
      sWeekdays1.weekdays[i] === sWeekdays2.weekdays[i]
    ) {
      return true
    }
  }

  return false
}

/**
 * Returns true if the two weekdays patterns are equal (have the same days
 * included). Returns false otherwise.
 *
 * @param weekdays1 The first weekdays pattern to compare. It can be an
 * SWeekdays or a string in the SMTWTFS format.
 * @param weekdays2 The second weekdays pattern to compare. It can be an
 * SWeekdays or a string in the SMTWTFS format.
 *
 * @example
 * ```ts
 * areWeekdaysEqual('SMTWTFS', 'SMTWTFS')
 * // Returns true
 * ```
 *
 * @example
 * ```ts
 * areWeekdaysEqual('SM----S', '-MTWTF-')
 * // Returns false
 * ```
 */
export const areWeekdaysEqual = (
  weekdays1: string | SWeekdays,
  weekdays2: string | SWeekdays,
): boolean => {
  const sWeekdays1 = sWeekdays(weekdays1)
  const sWeekdays2 = sWeekdays(weekdays2)

  return sWeekdays1.weekdays === sWeekdays2.weekdays
}

/**
 * Returns true if the weekdays pattern has no days selected (i.e., '-------').
 * Returns false otherwise.
 *
 * @param weekdays The weekdays pattern to check. It can be an SWeekdays or a
 * string in the SMTWTFS format.
 *
 * @example
 * ```ts
 * isWeekdaysEmpty('-------')
 * // Returns true
 * ```
 *
 * @example
 * ```ts
 * isWeekdaysEmpty('S------')
 * // Returns false (Sunday is included)
 * ```
 */
export const isWeekdaysEmpty = (weekdays: string | SWeekdays): boolean => {
  return areWeekdaysEqual(weekdays, getWeekdaysWithNoneIncluded())
}
