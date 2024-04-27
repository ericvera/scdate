/**
 * --- Factory ---
 */

import { daysInWeek } from 'date-fns/constants'
import { Weekday } from './constants'
import { SDate } from './internal/SDate'
import { SWeekdays } from './internal/SWeekdays'
import { DayToWeekday } from './internal/constants'
import { getAtIndex, hasFlag } from './internal/utils'
import { getIndexForWeekday } from './internal/weekdays'
import {
  addDaysToDate,
  getDaysBetweenDates,
  getWeekdayFromDate,
  isAfterDate,
  isSameDateOrBefore,
  sDate,
} from './sDate'

const AllWeekdaysIncludedMask = 'SMTWTFS'
const NotIncludedDay = '-'
const NoWeekdaysIncluded = NotIncludedDay.repeat(AllWeekdaysIncludedMask.length)
const WeekdaysCount = AllWeekdaysIncludedMask.length

/**
 * Factory function for creating a new SWeekdays instance or returns the
 * instance if already an instance of SWeekdays.
 * @param weekdays An instance of SWeekdays that will be returned or a string
 *  in the format 'SMTWTFS'. Each in the string represents a weekday starting
 *  on Sunday and ending on Saturday using the first letter of the english word
 *  for the week day. If the weekday is excluded, the position is filled with a
 *  '-' character. E.g. in 'SM----S', the weekdays Sunday, Monday, and Saturday
 *  are included while the rest are excluded.
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
 * provided weekdays can be any combination of the Weekday enum values. e.g.
 * `Weekday.Monday | Weekday.Wednesday | Weekday.Friday`.
 */
export const getWeekdaysFromWeekdayFlags = (weekdays: Weekday): SWeekdays => {
  const newWeekdays = [...AllWeekdaysIncludedMask]

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
 * Returns a new SWeekdays instance with the weekdays shifted forward by one
 * day. e.g. 'SM----S' becomes 'SMT----'.
 */
export const shiftWeekdaysForward = (
  weekdays: string | SWeekdays,
): SWeekdays => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const after = [...NoWeekdaysIncluded]

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
 * Returns a new SWeekdays where only the weekdays that are both included in the
 * provided weekdays that are within the date range are included.
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
  if (diff >= daysInWeek) {
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
 */
export const addWeekdayToWeekdays = (
  weekdays: string | SWeekdays,
  weekdayToAdd: Weekday,
): SWeekdays => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const newWeekdays = [...sWeekdaysInstance.weekdays]
  const weekdayIndex = getIndexForWeekday(weekdayToAdd)

  newWeekdays[weekdayIndex] = getAtIndex(AllWeekdaysIncludedMask, weekdayIndex)

  return sWeekdays(newWeekdays.join(''))
}

/**
 * --- Comparisons ---
 */

/**
 * Returns true if the provided weekdays include the provided weekday.
 */
export const doesWeekdaysIncludeWeekday = (
  weekdays: string | SWeekdays,
  weekday: Weekday,
) => {
  const sWeekdaysInstance = sWeekdays(weekdays)
  const weekdayIndex = getIndexForWeekday(weekday)

  return getAtIndex(sWeekdaysInstance.weekdays, weekdayIndex) !== NotIncludedDay
}

/**
 * Returns true if any of the included weekdays in weekdays1 is also included in
 * weekdays2.
 */
export const doesWeekdaysHaveOverlapWithWeekdays = (
  weekdays1: string | SWeekdays,
  weekdays2: string | SWeekdays,
) => {
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
