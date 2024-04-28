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
 * Returns a new SDate instance.
 *
 * @param date An instance of SDate or a string in the YYYY-MM-DD format.
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
 * Returns a new SDate instance with the current date in the given time zone.
 *
 * @param timeZone The time zone to get the current date for. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 */
export const getDateToday = (timeZone: string): SDate => {
  const date = getTimeZonedDate(Date.now(), timeZone)

  return sDate(getISODateFromZonedDate(date))
}

/**
 * Returns a new SDate instance set to the next date after the provided date
 * that match the given weekday.
 *
 * @param date The date to start from (not included). It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param weekday The weekday to find the next date for.
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
 * Returns a new SDate instance set to date that is before the provided date and
 * matches the given weekday.
 *
 * @param date The date to start from (not included).
 * @param weekday The weekday to find the previous date for. It can be an SDate
 * or a string in the YYYY-MM-DD format.
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
 * Returns a new SDate instance set to the first day of the month for the
 * provided date.
 *
 * @param date The date to get the first day of the month for. It can be an
 * SDate or a string in the YYYY-MM-DD format.
 */
export const getDateForFirstDayOfMonth = (date: string | SDate): SDate => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)
  nativeDate.setDate(1)

  return sDate(getISODateFromZonedDate(nativeDate))
}

/**
 * Returns a new SDate instance set to the last day of the month for the
 * provided date.
 *
 * @param date The date to get the last day of the month for. It can be an SDate
 * or a string in the YYYY-MM-DD format.
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
 *
 * @param date The date to get the year from. It can be an SDate or a string in
 * the YYYY-MM-DD format.
 */
export const getYearFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)

  return Number(getISOYearFromISODate(sDateValue.date))
}

/**
 * Returns the month from the given date. Returns a 0-index value (i.e. Janary
 * is 0 and December is 11) to match the result from native Date object.
 *
 * @param date The date to get the month from. It can be an SDate or a string in
 * the YYYY-MM-DD format.
 */
export const getMonthFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)

  return Number(getISOMonthFromISODate(sDateValue.date)) - 1
}

/**
 * Returns the day of the month from the given date.
 *
 * @param date The date to get the day from. It can be an SDate or a string in
 * the YYYY-MM-DD format.
 */
export const getDateFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)

  return Number(getISODateFromISODate(sDateValue.date))
}

/**
 * Returns the day of the week from the given date (Sunday to Saturday / 0 to
 * 6).
 *
 * @param date The date to get the weekday from. It can be an SDate or a string
 * in the YYYY-MM-DD format.
 */
export const getWeekdayFromDate = (date: string | SDate): number => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)

  return getAtIndex(DayToWeekday, nativeDate.getDay())
}

/**
 * Returns a native Date adjusted so that the local time of that date matches
 * the local time at the specified time zone.
 *
 * @param date The date to get the time zoned date from. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param timeZone The time zone to adjust the date to. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
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
 * Get the number of days between the first date to the second date. The value
 * is positive if the first date is before the second date, and negative if the
 * first date is after the second date. This accounts for calendar days and not
 * full 24-hour periods which could be different due to daylight saving
 * adjustments.
 *
 * @param date1 The first date to get the days between. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param date2 The second date to get the days between. It can be an SDate or a
 * string in the YYYY-MM-DD format.
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
 *
 * @param date The date to get the full string representation for. It can be an
 * SDate or a string in the YYYY-MM-DD format.
 * @param locale The locale to use for the string representation.
 *
 * @example
 * ```ts
 * getFullDateString('2021-02-05', 'es')
 * //=> 'viernes, 5 de febrero de 2021'
 * ```
 *
 * @example
 * ```ts
 * getFullDateString('2021-02-05', 'en')
 * //=> 'Friday, February 5, 2021'
 * ```
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
 *
 * @param date The date to get the short string representation for. It can be an
 * SDate or a string in the YYYY-MM-DD format.
 * @param timeZone The time zone used to determine if in the current year. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 * @param locale The locale to use for the string representation.
 * @param options The options to customize the short string representation.
 *
 * @example
 * ```ts
 * getShortDateString('2021-02-05', TestLocalTimeZone, 'en', {
 *   onTodayText,
 *   includeWeekday: false,
 * }),
 * //=> 'Feb 5' (year is not shown when in the current year)
 * ```
 *
 * @example
 * ```ts
 * getShortDateString('2021-02-05', TestLocalTimeZone, 'es', {
 *   onTodayText,
 *   includeWeekday: true,
 * })
 * //=> 'vie, 5 feb 21' (year when not in current year)
 * ```
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
 * Returns a new SDates instance with the date resulting from adding the given
 * number of days to the given date. Because it adds calendar days rather than
 * 24-hour days, this operation is not affected by time zones.
 *
 * @param date The date to add days to. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param days The number of days to add to the date.
 */
export const addDaysToDate = (date: string | SDate, days: number): SDate => {
  const sDateValue = sDate(date)

  const nativeDate = getDateAsUTCDateMini(sDateValue)
  nativeDate.setDate(nativeDate.getDate() + days)

  return sDate(getISODateFromZonedDate(nativeDate))
}

/**
 * Returns a new SDate instance with the date resulting from adding the given
 * number of months to the given date. Because it just adds to the month
 * component of the date, this operation is not affected by time zones.
 *
 * @param date The date to add months to. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param months The number of months to add to the date.
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
 * Returns a new SDate instance with the date resulting from adding the given
 * number of years to the given date. Because this only adds to the year
 * component of the date, this method is not affected by leap years.
 *
 * @param date The date to add years to. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param years The number of years to add to the date.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in
 * the YYYY-MM-DD format.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in
 * the YYYY-MM-DD format.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in the
 * the YYYY-MM-DD format.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in the
 * the YYYY-MM-DD format.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in the
 * the YYYY-MM-DD format.
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
 *
 * @param date The date to check if it is today. It can be an SDate or a string
 * in the YYYY-MM-DD format.
 * @param timeZone The time zone to check if the date is today. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in the
 * the YYYY-MM-DD format.
 *
 * @example
 * ```ts
 * areDatesInSameMonth('2021-02-05', '2021-02-15')
 * //=> true
 * ```
 *
 * @example
 * ```ts
 * areDatesInSameMonth('2022-02-05', '2023-02-15')
 * //=> false (different years)
 * ```
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
 *
 * @param date The date to check if it is in the current month. It can be an
 * SDate or a string in the YYYY-MM-DD format.
 * @param timeZone The time zone to check if the date is in the current month.
 * See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
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
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in
 * the YYYY-MM-DD format.
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
 *
 * @param date The date to check if it is in the current year. It can be an
 * SDate or a string in the YYYY-MM-DD format.
 * @param timeZone The time zone to check if the date is in the current year.
 * See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 */
export const isDateInCurrentYear = (
  date: string | SDate,
  timeZone: string,
): boolean => {
  const sDateValue = sDate(date)

  return areDatesInSameYear(sDateValue, getDateToday(timeZone))
}
