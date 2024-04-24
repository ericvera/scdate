import { Weekday } from '../constants'

export const DaysPerWeek = 7
export const HoursPerDay = 24
export const MinutesPerHour = 60
export const MillisecondsPerSecond = 1000
export const MinutesPerDay = HoursPerDay * MinutesPerHour

export const DayToWeekday: Weekday[] = [
  Weekday.Sun,
  Weekday.Mon,
  Weekday.Tue,
  Weekday.Wed,
  Weekday.Thu,
  Weekday.Fri,
  Weekday.Sat,
]
