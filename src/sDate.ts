import { differenceInDays, lastDayOfMonth } from 'date-fns'
import { daysInWeek } from 'date-fns/constants'
import { Weekday } from './constants'
import { SDate } from './internal/SDate'
import { DayToWeekday } from './internal/constants'
import {
  getDateAsUTCDateMini,
  getISODateFromISODate,
  getISODateFromZonedDate,
  getISOMonthFromISODate,
  getISOYearFromISODate,
} from './internal/date'
import { getAtIndex } from './internal/utils'
import { getIndexForWeekday } from './internal/weekdays'
import {
  getMillisecondsInUTCFromDate,
  getTimeZonedDate,
} from './internal/zoned'

export interface SDateShortStringOptions {
  includeWeekday: boolean
  onTodayText: () => string
}

/**
 * --- Factory ---
 */

/**
 * Factory function for creating a new SDate instance or returns the same
 * instance if already an instance of SDate.
 * @param date An instance of SDate that will be returned or a string in the
 *  ISO-8601 format (YYYY-MM-DD).
 */
export const sDate = (date: string | SDate): SDate => {
  if (date instanceof SDate) {
    return date
  }

  return new SDate(date)
}

/**
 * --- Factory helpers ---
 */

/**
 * Returns the current date in the given time zone.
 */
export const getDateToday = (timeZone: string): SDate => {
  const date = getTimeZonedDate(Date.now(), timeZone)

  return sDate(getISODateFromZonedDate(date))
}

/**
 * Get the next date that matches the given weekday after the given date.
 */
export const getNextDateByWeekday = (
  date: string | SDate,
  weekday: Weekday,
): SDate => {
  const sDateValue = sDate(date)
  const weekdayIndex = getIndexForWeekday(weekday)

  const todaysWeekdayIndex = DayToWeekday.indexOf(
    getWeekdayFromDate(sDateValue),
  )

  // Find the adjustment to get the next date that matches `weekday`
  let adjustment = weekdayIndex - todaysWeekdayIndex

  if (adjustment <= 0) {
    adjustment += daysInWeek
  }

  return addDaysToDate(sDateValue, adjustment)
}

/**
 * Get the previous date that matches the given weekday before the given date.
 */
export const getPreviousDateByWeekday = (
  date: string | SDate,
  weekday: Weekday,
) => {
  const sDateValue = sDate(date)
  const weekdayIndex = getIndexForWeekday(weekday)

  const todaysWeekdayIndex = DayToWeekday.indexOf(
    getWeekdayFromDate(sDateValue),
  )

  // Find the adjustment to get the previous date that matches `weekday`
  let adjustment = weekdayIndex - todaysWeekdayIndex

  if (adjustment >= 0) {
    adjustment -= daysInWeek
  }

  return addDaysToDate(sDateValue, adjustment)
}

/**
 * Returns the date for the first day of the month for the given date.
 */
export const getDateForFirstDayOfMonth = (date: string | SDate): SDate => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)
  nativeDate.setDate(1)

  return sDate(getISODateFromZonedDate(nativeDate))
}

/**
 * Returns the date for the last day of the month for the given date.
 */
export const getDateForLastDayOfMonth = (date: string | SDate): SDate => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)
  const lastDay = lastDayOfMonth(nativeDate)

  return sDate(getISODateFromZonedDate(lastDay))
}

/**
 * --- Getters ---
 */

/**
 * Returns the year from the given date.
 */
export const getYearFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)

  return Number(getISOYearFromISODate(sDateValue.date))
}

/**
 * Returns the month from the given date. Return sa 0-index value (i.e. Janary
 * is 0 and December is 11) to match the result from native Date object.
 */
export const getMonthFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)

  return Number(getISOMonthFromISODate(sDateValue.date)) - 1
}

/**
 * Returns the day of the month from the given date.
 */
export const getDateFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)

  return Number(getISODateFromISODate(sDateValue.date))
}

/**
 * Returns the day of the week from the given date.
 */
export const getWeekdayFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)

  return getAtIndex(DayToWeekday, nativeDate.getDay())
}

/**
 * Returns the native Date representation of the given date in the given time
 * zone.
 */
export const getTimeZonedDateFromDate = (
  date: string | SDate,
  timeZone: string,
): Date => {
  const sDateValue = sDate(date)

  const milliseconds = getMillisecondsInUTCFromDate(sDateValue, timeZone)

  const zonedTime = getTimeZonedDate(milliseconds, timeZone)

  return zonedTime
}

/**
 * Get the number of days from the first date to the second date. The value is
 * positive if the first date is before the second date, and negative if the
 * first date is after the second date. This accounts for calendar days and not
 * full 24-hour periods which could be different due to daylight saving time.
 */
export const getDaysBetweenDates = (
  date1: string | SDate,
  date2: string | SDate,
): number => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return differenceInDays(
    getDateAsUTCDateMini(sDate2),
    getDateAsUTCDateMini(sDate1),
  )
}

/**
 * Get the full string representation of the given date in the given locale.
 */
export const getFullDateString = (
  date: string | SDate,
  locale: Intl.LocalesArgument,
) => {
  const sDateValue = sDate(date)
  const utcDate = getDateAsUTCDateMini(sDateValue)

  return utcDate.toLocaleDateString(locale, {
    timeZone: 'UTC',
    dateStyle: 'full',
  })
}

/**
 * Get the short string representation of the given date in the given locale.
 */
export const getShortDateString = (
  date: string | SDate,
  timeZone: string,
  locale: Intl.LocalesArgument,
  options: SDateShortStringOptions,
): string => {
  const sDateValue = sDate(date)

  if (isDateToday(sDateValue, timeZone)) {
    return options.onTodayText()
  }

  const utcDate = getDateAsUTCDateMini(sDateValue)

  return utcDate.toLocaleDateString(locale, {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    weekday: options.includeWeekday ? 'short' : undefined,
    // Include year only if not current
    year: isDateInCurrentYear(sDateValue, timeZone) ? undefined : '2-digit',
  })
}

/**
 * --- Operations ---
 */

/**
 * Returns the date resulting from adding the given number of days to the given
 * date.
 */
export const addDaysToDate = (date: string | SDate, days: number): SDate => {
  const sDateValue = sDate(date)

  const nativeDate = getDateAsUTCDateMini(sDateValue)
  nativeDate.setDate(nativeDate.getDate() + days)

  return sDate(getISODateFromZonedDate(nativeDate))
}

/**
 * Returns the date resulting from adding the given number of months to the
 * given date.
 */
export const addMonthsToDate = (
  date: string | SDate,
  months: number,
): SDate => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)

  nativeDate.setMonth(nativeDate.getMonth() + months)

  return sDate(getISODateFromZonedDate(nativeDate))
}

/**
 * Returns the date resulting from adding the given number of years to the given
 * date.
 */
export const addYearsToDate = (date: string | SDate, years: number): SDate => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)

  nativeDate.setFullYear(nativeDate.getFullYear() + years)

  return sDate(getISODateFromZonedDate(nativeDate))
}

/**
 * --- Comparisons ---
 */

/**
 * Returns whether the two given dates are the same day.
 */
export const isSameDate = (
  date1: string | SDate,
  date2: string | SDate,
): boolean => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return sDate1.date === sDate2.date
}

/**
 * Returns whether the first given date is before the second given date.
 */
export const isBeforeDate = (
  date1: string | SDate,
  date2: string | SDate,
): boolean => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return sDate1.date < sDate2.date
}

/**
 * Returns whether the first given date is the same day or before the second
 * given date.
 */
export const isSameDateOrBefore = (
  date1: string | SDate,
  date2: string | SDate,
): boolean => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return sDate1.date <= sDate2.date
}

/**
 * Returns whether the first given date is after the second given date.
 */
export const isAfterDate = (
  date1: string | SDate,
  date2: string | SDate,
): boolean => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return sDate1.date > sDate2.date
}

/**
 * Returns whether the first given date is the same day or after the second
 * given date.
 */
export const isSameDateOrAfter = (
  date1: string | SDate,
  date2: string | SDate,
) => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return sDate1.date >= sDate2.date
}

/**
 * Returns whether the given date is today.
 */
export const isDateToday = (
  date: string | SDate,
  timeZone: string,
): boolean => {
  const sDateValue = sDate(date)

  return isSameDate(sDateValue, getDateToday(timeZone))
}

/**
 * Returns whether the month on the first date is the same as the month on the
 * second date. It also checks that the year is the same.
 */
export const areDatesInSameMonth = (
  date1: string | SDate,
  date2: string | SDate,
): boolean => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return (
    getISOYearFromISODate(sDate1.date) === getISOYearFromISODate(sDate2.date) &&
    getISOMonthFromISODate(sDate1.date) === getISOMonthFromISODate(sDate2.date)
  )
}

/**
 * Returns whether the given date is in the current month.
 */
export const isDateInCurrentMonth = (
  date: string | SDate,
  timeZone: string,
): boolean => {
  const sDateValue = sDate(date)

  return areDatesInSameMonth(sDateValue, getDateToday(timeZone))
}

/**
 * Returns whether the year on the first date is the same as the year on the
 * second date.
 */
export const areDatesInSameYear = (
  date1: string | SDate,
  date2: string | SDate,
): boolean => {
  const sDate1 = sDate(date1)
  const sDate2 = sDate(date2)

  return (
    getISOYearFromISODate(sDate1.date) === getISOYearFromISODate(sDate2.date)
  )
}

/**
 * Returns whether the given date is in the current year.
 */
export const isDateInCurrentYear = (
  date: string | SDate,
  timeZone: string,
): boolean => {
  const sDateValue = sDate(date)

  return areDatesInSameYear(sDateValue, getDateToday(timeZone))
}
