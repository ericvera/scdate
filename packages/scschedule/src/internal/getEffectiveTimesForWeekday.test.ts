import { sTime, sWeekdays, Weekday } from 'scdate'
import { expect, it } from 'vitest'
import type { WeeklyScheduleRule } from '../types.js'
import { getEffectiveTimesForWeekday } from './getEffectiveTimesForWeekday.js'

it('returns direct times when weekday is in pattern', () => {
  const rule: WeeklyScheduleRule = {
    // Monday
    weekdays: '-M-----',
    from: sTime('09:00'),
    to: '17:00',
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Mon)

  // 09:00-17:00 in minutes since midnight (to exclusive)
  expect(times).toEqual([{ from: 540, to: 1020 }])
})

it('returns empty array when weekday is not in pattern', () => {
  const rule: WeeklyScheduleRule = {
    // Monday only
    weekdays: sWeekdays('-M-----'),
    from: '09:00',
    to: sTime('17:00'),
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Tue)

  expect(times).toEqual([])
})

it('returns spillover times from cross-midnight range on previous day', () => {
  const rule: WeeklyScheduleRule = {
    // Saturday only
    weekdays: '------S',
    from: sTime('22:00'),
    to: '02:00',
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Sun)

  // Spillover 00:00-02:00 (to exclusive)
  expect(times).toEqual([{ from: 0, to: 120 }])
})

it('splits cross-midnight ranges correctly', () => {
  const rule: WeeklyScheduleRule = {
    // Friday only
    weekdays: sWeekdays('-----F-'),
    from: '20:00',
    to: sTime('03:00'),
  }

  const fridayTimes = getEffectiveTimesForWeekday(rule, Weekday.Fri)

  // 20:00 to end of day
  expect(fridayTimes).toEqual([{ from: 1200, to: 1440 }])

  const saturdayTimes = getEffectiveTimesForWeekday(rule, Weekday.Sat)

  // Midnight to 03:00 (exclusive)
  expect(saturdayTimes).toEqual([{ from: 0, to: 180 }])
})

it('handles Sunday to Monday spillover correctly', () => {
  const rule: WeeklyScheduleRule = {
    // Sunday only
    weekdays: sWeekdays('S------'),
    from: sTime('23:00'),
    to: '01:00',
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Mon)

  // Spillover 00:00-01:00 (to exclusive)
  expect(times).toEqual([{ from: 0, to: 60 }])
})

it('returns both direct and spillover times when applicable', () => {
  const rule: WeeklyScheduleRule = {
    // Saturday and Sunday
    weekdays: 'S-----S',
    from: '22:00',
    to: sTime('02:00'),
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Sun)

  // Should get both:
  // 1. Direct Sunday time: 22:00 to end of day
  // 2. Spillover from Saturday: 00:00-02:00
  expect(times).toEqual([
    { from: 1320, to: 1440 },
    { from: 0, to: 120 },
  ])
})

it('does not produce spillover for ranges ending at midnight', () => {
  const rule: WeeklyScheduleRule = {
    // Saturday only
    weekdays: sWeekdays('------S'),
    from: '22:00',
    to: sTime('00:00'),
  }

  const saturdayTimes = getEffectiveTimesForWeekday(rule, Weekday.Sat)

  // 22:00 to end of day, no next-day portion
  expect(saturdayTimes).toEqual([{ from: 1320, to: 1440 }])

  const sundayTimes = getEffectiveTimesForWeekday(rule, Weekday.Sun)

  expect(sundayTimes).toEqual([])
})
