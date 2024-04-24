import { Weekday } from '../constants'
import { DayToWeekday } from './constants'

export const validateWeekdays = (weekdays: string): void => {
  const ValidWeekdays = /^[S-][M-][T-][W-][T-][F-][S-]$/

  if (!ValidWeekdays.test(weekdays)) {
    throw new Error(
      `Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: '${weekdays}'.`,
    )
  }

  return
}

export const getWeekdayStringIndex = (weekday: Weekday): number => {
  const weekdayIndex = DayToWeekday.indexOf(weekday)

  if (weekdayIndex < 0) {
    throw new Error(
      `Invalid weekday '${String(weekday)}'. Expected a single weekday.`,
    )
  }

  return weekdayIndex
}
