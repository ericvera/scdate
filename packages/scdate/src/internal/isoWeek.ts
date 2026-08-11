import { UTCDate, UTCDateMini } from '@date-fns/utc'
import { DaysInWeek, MillisecondsInDay } from './constants.js'

// Position of Thursday in a Monday-based week (Monday = 0)
const ThursdayIndex = 3

/**
 * Returns the Monday-based weekday index (0 = Monday ... 6 = Sunday) for the
 * given date.
 */
export const getMondayBasedWeekdayIndex = (date: UTCDate): number =>
  (date.getDay() + (DaysInWeek - 1)) % DaysInWeek

/**
 * Returns a new UTCDate set to the Thursday of the ISO week that contains the
 * given date.
 */
export const getISOWeekThursday = (date: UTCDate): UTCDate => {
  const thursday = new UTCDateMini(date.getTime())

  thursday.setDate(
    thursday.getDate() + ThursdayIndex - getMondayBasedWeekdayIndex(thursday),
  )

  return thursday
}

/**
 * Returns the ISO week-numbering year for the given date (the calendar year of
 * the ISO week's Thursday).
 */
export const getISOWeekYearForUTCDate = (date: UTCDate): number =>
  getISOWeekThursday(date).getFullYear()

/**
 * Returns the ISO week number (1 to 52 or 53) for the given date.
 */
export const getISOWeekForUTCDate = (date: UTCDate): number => {
  const thursday = getISOWeekThursday(date)

  // Clone + setFullYear avoids the numeric Date constructors, which map years
  // 0-99 to 1900-1999
  const january1 = new UTCDateMini(thursday.getTime())
  january1.setFullYear(thursday.getFullYear(), 0, 1)

  const days = Math.round(
    (thursday.getTime() - january1.getTime()) / MillisecondsInDay,
  )

  return Math.floor(days / DaysInWeek) + 1
}

/**
 * Returns the number of ISO weeks (52 or 53) in the given ISO week-numbering
 * year. Pure arithmetic so it works for any integer year.
 */
export const getWeeksInISOWeekYear = (weekYear: number): number => {
  // Weekday of December 31 of the given year (0 = Sunday ... 6 = Saturday)
  const lastDayWeekday = (year: number): number => {
    const shifted =
      year +
      Math.floor(year / 4) -
      Math.floor(year / 100) +
      Math.floor(year / 400)

    return ((shifted % DaysInWeek) + DaysInWeek) % DaysInWeek
  }

  // A year has 53 ISO weeks when it ends on a Thursday or when the previous
  // year ends on a Wednesday (i.e. the year starts on a Thursday)
  const Thursday = 4
  const Wednesday = 3

  return lastDayWeekday(weekYear) === Thursday ||
    lastDayWeekday(weekYear - 1) === Wednesday
    ? 53
    : 52
}

/**
 * Validates the arguments for getDateForFirstDayOfISOWeek. Throws when either
 * value is not an integer or when the week is outside the valid range for the
 * given ISO week-numbering year.
 */
export const validateISOWeekYearAndWeek = (
  weekYear: number,
  week: number,
): void => {
  if (!Number.isInteger(weekYear)) {
    throw new Error(
      `Invalid ISO week year. Expected an integer. Current value: '${weekYear.toString()}'.`,
    )
  }

  if (!Number.isInteger(week)) {
    throw new Error(
      `Invalid ISO week. Expected an integer. Current value: '${week.toString()}'.`,
    )
  }

  const weeksInYear = getWeeksInISOWeekYear(weekYear)

  if (week < 1 || week > weeksInYear) {
    throw new Error(
      `Invalid ISO week. Expected a value from 1 to ${weeksInYear.toString()}. Current value: '${week.toString()}'.`,
    )
  }
}
