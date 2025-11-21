import { UTCDateMini } from '@date-fns/utc'
import { getTimezoneOffset } from 'date-fns-tz'
import { DayToWeekday, Weekday } from './constants.js'
import { SDate } from './internal/SDate.js'
import { DaysInWeek, MillisecondsInDay } from './internal/constants.js'
import {
  getDateAsUTCDateMini,
  getISODateFromISODate,
  getISODateFromZonedDate,
  getISOMonthFromISODate,
  getISOYearFromISODate,
} from './internal/date.js'
import { getAtIndex } from './internal/utils.js'
import { getIndexForWeekday } from './internal/weekdays.js'
import { getTimeZonedDate } from './internal/zoned.js'

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
    adjustment += DaysInWeek
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
    adjustment -= DaysInWeek
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
  nativeDate.setFullYear(nativeDate.getFullYear(), nativeDate.getMonth() + 1, 0)
  nativeDate.setHours(0, 0, 0, 0)

  return sDate(getISODateFromZonedDate(nativeDate))
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
 * Returns the number of milliseconds since the Unix epoch (January 1,
 * 1970, 00:00:00 UTC) for the given date in the specified time zone.
 *
 * @param date The date to convert to UTC milliseconds. It can be an
 * SDate or a string in the YYYY-MM-DD format.
 * @param timeZone The time zone to use when converting the date. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
 */
export const getUTCMillisecondsFromDate = (
  date: string | SDate,
  timeZone: string,
): number => {
  const sDateValue = sDate(date)
  const utcDate = getDateAsUTCDateMini(sDateValue)

  const timeZoneOffset = getTimezoneOffset(timeZone, utcDate)
  if (isNaN(timeZoneOffset)) {
    throw new Error(`Invalid time zone. Time zone: '${timeZone}'`)
  }

  return utcDate.getTime() - timeZoneOffset
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

  const milliseconds = getUTCMillisecondsFromDate(sDateValue, timeZone)

  const zonedTime = getTimeZonedDate(milliseconds, timeZone)

  return zonedTime
}

/**
 * Returns the number of days between the first date to the second date. The
 * value is positive if the first date is before the second date, and negative
 * if the first date is after the second date. This accounts for calendar days
 * and not full 24-hour periods which could be different due to daylight saving
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

  const ms1 = getDateAsUTCDateMini(sDate1).getTime()
  const ms2 = getDateAsUTCDateMini(sDate2).getTime()

  return Math.round((ms2 - ms1) / MillisecondsInDay)
}

/**
 * Returns a string representation that includes all of the date components of
 * the given date formatted according to the given locale.
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
 * When the original date's day exceeds the number of days in the
 * target month, the function will automatically clamp to the last day of
 * the target month rather than rolling over to the next month. For
 * example, adding 1 month to January 31 will result in February 28/29
 * (depending on leap year), not March 3.
 *
 * @param date The date to add months to. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param months The number of months to add to the date.
 * @param options Additional options for controlling the behavior of the
 * function.
 * @param options.capToCommonDate When true, if the original date is the
 * 29th, 30th, or 31st, the result will be capped to the 28th of the
 * month (the last date common to all months) rather than the last day of
 * the target month.
 * This ensures consistent date handling across all months.
 *
 * @example
 * ```ts
 * addMonthsToDate('2023-01-31', 1)
 * //=> '2023-02-28' (February has fewer days than January)
 * ```
 *
 * @example
 * ```ts
 * addMonthsToDate('2023-01-31', 3)
 * //=> '2023-04-30' (April has 30 days)
 * ```
 *
 * @example
 * ```ts
 * addMonthsToDate('2024-01-31', 1)
 * //=> '2024-02-29' (February in leap year)
 * ```
 *
 * @example
 * ```ts
 * addMonthsToDate('2023-01-31', 3, { capToCommonDate: true })
 * //=> '2023-04-28' (capped to the 28th regardless of month length)
 * ```
 */
export const addMonthsToDate = (
  date: string | SDate,
  months: number,
  options?: {
    capToCommonDate?: boolean
  },
): SDate => {
  const sDateValue = sDate(date)
  const nativeDate = getDateAsUTCDateMini(sDateValue)

  const currentDay = nativeDate.getDate()
  const currentMonth = nativeDate.getMonth()

  // First set day to 1 to avoid month overflow
  nativeDate.setDate(1)

  // Then set the new month
  nativeDate.setMonth(currentMonth + months)

  // If capToCommonDate is true and the original day is greater than
  // 28, cap to 28
  if (options?.capToCommonDate && currentDay > 28) {
    nativeDate.setDate(28)
  } else {
    // Get the last day of the target month
    const lastDayOfMonth = new UTCDateMini(
      nativeDate.getFullYear(),
      nativeDate.getMonth() + 1,
      0,
    ).getDate()

    // Set the day, clamping to the last day of the month if necessary
    nativeDate.setDate(Math.min(currentDay, lastDayOfMonth))
  }

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
 * Returns true when the two given dates represent the same day and false
 * otherwise.
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
 * Returns true when the first date represents a date before the second date and
 * false otherwise.
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
 * Returns true when the first date represents a date that happens on the
 * same date or before the second date and false otherwise.
 *
 * @param date1 The first date to compare. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a
 * string in the YYYY-MM-DD format.
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
 * Returns true when the first date represents a date that happens after
 * the second date and false otherwise.
 *
 * @param date1 The first date to compare. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a
 * string in the YYYY-MM-DD format.
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
 * Returns true when the first date represents a date that happens on the
 * same date or after the second date and false otherwise.
 *
 * @param date1 The first date to compare. It can be an SDate or a
 * string in the YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a
 * string in the YYYY-MM-DD format.
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
 * Returns true when the date is today and false otherwise.
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
 * Returns true when the month on the first date is the same as the month on the
 * second date. It also checks that the year is the same. Returns false
 * otherwise.
 *
 * @param date1 The first date to compare. It can be an SDate or a string in the
 * YYYY-MM-DD format.
 * @param date2 The second date to compare. It can be an SDate or a string in
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
 * Returns true when the date represents a date in the current month and year.
 * Returns false otherwise.
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
 * Returns true when the year of the first date is the same as the year on the
 * second date. Returns false otherwise.
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
 * Returns true when the year component of the date matches the current year in
 * the given time zone. Returns false otherwise.
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
