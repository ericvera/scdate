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

  expect(times).toMatchInlineSnapshot(`
    [
      {
        "from": "09:00",
        "to": "17:00",
      },
    ]
  `)
})

it('returns empty array when weekday is not in pattern', () => {
  const rule: WeeklyScheduleRule = {
    // Monday only
    weekdays: sWeekdays('-M-----'),
    from: '09:00',
    to: sTime('17:00'),
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Tue)

  expect(times).toMatchInlineSnapshot(`[]`)
})

it('returns spillover times from cross-midnight range on previous day', () => {
  const rule: WeeklyScheduleRule = {
    // Saturday only
    weekdays: '------S',
    from: sTime('22:00'),
    to: '02:00',
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Sun)

  expect(times).toMatchInlineSnapshot(`
    [
      {
        "from": "00:00",
        "to": "02:00",
      },
    ]
  `)
})

it('splits cross-midnight ranges correctly', () => {
  const rule: WeeklyScheduleRule = {
    // Friday only
    weekdays: sWeekdays('-----F-'),
    from: '20:00',
    to: sTime('03:00'),
  }

  const fridayTimes = getEffectiveTimesForWeekday(rule, Weekday.Fri)

  expect(fridayTimes).toMatchInlineSnapshot(`
    [
      {
        "from": "20:00",
        "to": "23:59",
      },
    ]
  `)

  const saturdayTimes = getEffectiveTimesForWeekday(rule, Weekday.Sat)

  expect(saturdayTimes).toMatchInlineSnapshot(`
    [
      {
        "from": "00:00",
        "to": "03:00",
      },
    ]
  `)
})
it('handles Sunday to Monday spillover correctly', () => {
  const rule: WeeklyScheduleRule = {
    // Sunday only
    weekdays: sWeekdays('S------'),
    from: sTime('23:00'),
    to: '01:00',
  }

  const times = getEffectiveTimesForWeekday(rule, Weekday.Mon)

  expect(times).toMatchInlineSnapshot(`
    [
      {
        "from": "00:00",
        "to": "01:00",
      },
    ]
  `)
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
  // 1. Direct Sunday time: 22:00-23:59
  // 2. Spillover from Saturday: 00:00-02:00
  expect(times).toMatchInlineSnapshot(`
    [
      {
        "from": "22:00",
        "to": "23:59",
      },
      {
        "from": "00:00",
        "to": "02:00",
      },
    ]
  `)
})
