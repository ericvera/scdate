import { sTime, sWeekdays, Weekday } from 'scdate'
import { expect, it } from 'vitest'
import type { WeeklyScheduleRule } from '../types.js'
import { doRulesOverlap } from './doRulesOverlap.js'

it('returns undefined when rules have no overlapping weekdays', () => {
  const rule1: WeeklyScheduleRule = {
    // Mon-Fri
    weekdays: '-MTWTF-',
    from: sTime('09:00'),
    to: '17:00',
  }

  const rule2: WeeklyScheduleRule = {
    // Sat-Sun
    weekdays: sWeekdays('S-----S'),
    from: '09:00',
    to: sTime('17:00'),
  }

  expect(doRulesOverlap(rule1, rule2)).toBeUndefined()
})

it('returns undefined when rules have overlapping weekdays but different times', () => {
  const rule1: WeeklyScheduleRule = {
    weekdays: 'SMTWTFS',
    from: '09:00',
    to: sTime('12:00'),
  }

  const rule2: WeeklyScheduleRule = {
    weekdays: sWeekdays('SMTWTFS'),
    from: sTime('13:00'),
    to: '17:00',
  }

  expect(doRulesOverlap(rule1, rule2)).toBeUndefined()
})

it('detects overlap when rules have same weekdays and overlapping times', () => {
  const rule1: WeeklyScheduleRule = {
    // Monday
    weekdays: '-M-----',
    from: '09:00',
    to: sTime('17:00'),
  }

  const rule2: WeeklyScheduleRule = {
    // Monday
    weekdays: sWeekdays('-M-----'),
    from: sTime('14:00'),
    to: '18:00',
  }

  // Monday
  expect(doRulesOverlap(rule1, rule2)).toBe(Weekday.Mon)
})

it('detects overlap from cross-midnight spillover', () => {
  const rule1: WeeklyScheduleRule = {
    // Saturday only, but crosses midnight into Sunday
    weekdays: '------S',
    from: sTime('22:00'),
    to: '02:00',
  }

  const rule2: WeeklyScheduleRule = {
    // Sunday only
    weekdays: sWeekdays('S------'),
    from: '01:00',
    to: sTime('10:00'),
  }

  // Overlap occurs on Sunday from 01:00-02:00
  expect(doRulesOverlap(rule1, rule2)).toBe(Weekday.Sun)
})

it('returns first weekday where overlap occurs', () => {
  const rule1: WeeklyScheduleRule = {
    // All days
    weekdays: sWeekdays('SMTWTFS'),
    from: sTime('09:00'),
    to: sTime('17:00'),
  }

  const rule2: WeeklyScheduleRule = {
    // All days
    weekdays: sWeekdays('SMTWTFS'),
    from: sTime('14:00'),
    to: sTime('18:00'),
  }

  // Should return Sunday as it's the first day
  expect(doRulesOverlap(rule1, rule2)).toBe(Weekday.Sun)
})

it('detects partial weekday overlap with time conflicts', () => {
  const rule1: WeeklyScheduleRule = {
    // Mon-Wed
    weekdays: '-MTW---',
    from: '10:00',
    to: sTime('18:00'),
  }

  const rule2: WeeklyScheduleRule = {
    // Wed-Fri
    weekdays: sWeekdays('---WTF-'),
    from: sTime('12:00'),
    to: '20:00',
  }

  // Wednesday is the overlapping day
  expect(doRulesOverlap(rule1, rule2)).toBe(Weekday.Wed)
})

it('returns undefined for adjacent cross-midnight ranges that do not overlap', () => {
  const rule1: WeeklyScheduleRule = {
    // Friday
    weekdays: sWeekdays('-----F-'),
    from: sTime('22:00'),
    to: sTime('02:00'),
  }

  const rule2: WeeklyScheduleRule = {
    // Saturday
    weekdays: sWeekdays('------S'),
    from: sTime('10:00'),
    to: sTime('18:00'),
  }

  // Friday 22:00-23:59, Saturday 00:00-02:00 (spillover)
  // Saturday 10:00-18:00 (direct)
  // Saturday times don't overlap: 00:00-02:00 vs 10:00-18:00
  expect(doRulesOverlap(rule1, rule2)).toBeUndefined()
})

it('returns undefined when one rule has empty weekdays', () => {
  const rule1: WeeklyScheduleRule = {
    weekdays: '-MTW---',
    from: sTime('09:00'),
    to: sTime('17:00'),
  }

  const rule2: WeeklyScheduleRule = {
    // Empty weekdays (no days enabled)
    weekdays: sWeekdays('-------'),
    from: sTime('10:00'),
    to: sTime('18:00'),
  }

  expect(doRulesOverlap(rule1, rule2)).toBeUndefined()
})

it('detects cross-midnight spillover with consecutive weekdays enabled', () => {
  const rule1: WeeklyScheduleRule = {
    // Both Friday and Saturday enabled
    weekdays: '-----FS',
    from: sTime('22:00'),
    to: sTime('02:00'),
  }

  const rule2: WeeklyScheduleRule = {
    // Saturday only
    weekdays: sWeekdays('------S'),
    from: sTime('01:00'),
    to: sTime('10:00'),
  }

  // Overlap occurs on Saturday from spillover
  expect(doRulesOverlap(rule1, rule2)).toBe(Weekday.Sat)
})
