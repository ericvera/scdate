import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { isInOvernightSpillover } from './isInOvernightSpillover.js'
import type { Schedule } from './types.js'

it('returns false when previous day has no overnight rules', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
  }

  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-07'), sTime('10:00')),
  ).toBe(false)
})

it('returns true when in spillover from previous day overnight rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  // Friday 01:00 is in Thursday's 20:00-02:00 spillover
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-10'), sTime('01:00')),
  ).toBe(true)
})

it('returns false when after spillover ends', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  // Friday 03:00 is after spillover (02:00)
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-10'), sTime('03:00')),
  ).toBe(false)
})

it('returns false when time is in same-day portion of overnight rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  // Friday 23:00 is same-day portion (not spillover from Thursday)
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-10'), sTime('23:00')),
  ).toBe(false)
})

it('returns true at spillover boundary (inclusive)', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  // Friday 02:00 is the inclusive end of spillover
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-10'), sTime('02:00')),
  ).toBe(true)
})

it('returns false just after spillover boundary', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-10'), sTime('02:01')),
  ).toBe(false)
})

it('returns false when rules are true (always available)', () => {
  const schedule: Schedule = {
    weekly: true,
  }

  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-07'), sTime('01:00')),
  ).toBe(false)
})

it('returns true when previous day weekday is in overnight rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        // Thursday only
        weekdays: sWeekdays('----T--'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  // Friday 01:00 - previous day (Thursday) is in weekdays, spillover applies
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-10'), sTime('01:00')),
  ).toBe(true)
})

it('returns false when previous day weekday not in rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        // Saturday only
        weekdays: sWeekdays('------S'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  // Sunday 01:00 - previous day Saturday is in weekdays, spillover applies
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-05'), sTime('01:00')),
  ).toBe(true)

  // Monday 01:00 - previous day Sunday not in rule (rule is Saturday only)
  expect(
    isInOvernightSpillover(schedule, sDate('2025-01-06'), sTime('01:00')),
  ).toBe(false)
})

it('handles override with overnight rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-24'),
        to: sDate('2025-12-25'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('22:00'),
            to: sTime('02:00'),
          },
        ],
      },
    ],
  }

  // Dec 25 01:00 - spillover from Dec 24 (override)
  expect(
    isInOvernightSpillover(schedule, sDate('2025-12-25'), sTime('01:00')),
  ).toBe(true)
})

it('returns false when override has no overnight rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-24'),
        to: sDate('2025-12-25'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('09:00'),
            to: sTime('17:00'),
          },
        ],
      },
    ],
  }

  expect(
    isInOvernightSpillover(schedule, sDate('2025-12-25'), sTime('10:00')),
  ).toBe(false)
})

it('handles spillover from override last day to next day', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('20:00'),
            to: sTime('02:00'),
          },
        ],
      },
    ],
  }

  // Jan 1 01:00 - spillover from Dec 31 (last day of override)
  expect(
    isInOvernightSpillover(schedule, sDate('2026-01-01'), sTime('01:00')),
  ).toBe(true)
})

it('returns false on Christmas morning - no spillover from closed Christmas Eve', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('20:00'),
            to: sTime('02:00'),
          },
        ],
      },
      {
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        // Christmas Eve closed
        rules: [],
      },
    ],
  }

  // Christmas morning - Dec 24 closed, so no spillover to Dec 25
  expect(
    isInOvernightSpillover(schedule, sDate('2025-12-25'), sTime('01:00')),
  ).toBe(false)
})

it('accepts string date and time', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        from: sTime('20:00'),
        to: sTime('02:00'),
      },
    ],
  }

  expect(isInOvernightSpillover(schedule, '2025-01-10', '01:00')).toBe(true)
  expect(isInOvernightSpillover(schedule, '2025-01-10', '03:00')).toBe(false)
})
