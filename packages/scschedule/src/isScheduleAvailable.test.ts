import { sDate, sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { isScheduleAvailable } from './isScheduleAvailable.js'
import type { Schedule } from './types.js'

it('should return true when timestamp falls within weekly schedule', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  // Tuesday at 10:00 AM
  const timestamp = sTimestamp('2025-01-07T10:00')
  expect(isScheduleAvailable(schedule, timestamp)).toBe(true)
})

it('should return false when timestamp is outside weekly schedule hours', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [{ from: '09:00', to: '17:00' }],
      },
    ],
  }

  // Tuesday at 8:00 AM (before opening)
  const timestamp = sTimestamp('2025-01-07T08:00')
  expect(isScheduleAvailable(schedule, timestamp)).toBe(false)
})

it('should return false when timestamp is on a non-working weekday', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  // Sunday at 10:00 AM
  const timestamp = sTimestamp('2025-01-05T10:00')
  expect(isScheduleAvailable(schedule, timestamp)).toBe(false)
})

it('should return false during lunch break when multiple time ranges are defined', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [
          { from: '09:00', to: '12:00' },
          { from: '13:00', to: '17:00' },
        ],
      },
    ],
  }

  const lunchTime = sTimestamp('2025-01-07T12:30')
  expect(isScheduleAvailable(schedule, lunchTime)).toBe(false)
})

it('should return true during afternoon hours when multiple time ranges are defined', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [
          { from: '09:00', to: '12:00' },
          { from: '13:00', to: '17:00' },
        ],
      },
    ],
  }

  // Tuesday at 2:00 PM
  const workTime = sTimestamp('2025-01-07T14:00')
  expect(isScheduleAvailable(schedule, workTime)).toBe(true)
})

it('should respect specific date overrides', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        from: '2025-12-25',
        to: '2025-12-25',
        // Closed on Christmas
        rules: [],
      },
    ],
  }

  // Christmas (Thursday) at 10:00 AM - would normally be open
  const christmas = sTimestamp('2025-12-25T10:00')
  expect(isScheduleAvailable(schedule, christmas)).toBe(false)
})

it('should return false before indefinite override starts', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [{ from: '09:00', to: '17:00' }],
      },
    ],
    overrides: [
      {
        from: '2026-01-01',
        // Extended hours indefinitely starting 2026
        rules: [
          {
            weekdays: '-MTWTF-',
            times: [{ from: '08:00', to: '18:00' }],
          },
        ],
      },
    ],
  }

  // Monday at 8:30 AM
  const before = sTimestamp('2025-12-15T08:30')
  expect(isScheduleAvailable(schedule, before)).toBe(false)
})

it('should return true after indefinite override starts', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [{ from: '09:00', to: '17:00' }],
      },
    ],
    overrides: [
      {
        from: '2026-01-01',
        // Extended hours indefinitely starting 2026
        rules: [
          {
            weekdays: '-MTWTF-',
            times: [{ from: '08:00', to: '18:00' }],
          },
        ],
      },
    ],
  }

  // Wednesday at 8:30 AM
  const after = sTimestamp('2026-01-15T08:30')
  expect(isScheduleAvailable(schedule, after)).toBe(true)
})

it('should return true for late night hours in cross-midnight range', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        // Thursday night to Friday morning
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
    ],
  }

  // Thursday at 11:00 PM
  const lateNight = sTimestamp('2025-01-09T23:00')
  expect(isScheduleAvailable(schedule, lateNight)).toBe(true)
})

it('should return true for early morning hours in cross-midnight range', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        // Thursday night to Friday morning
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
    ],
  }

  // Friday at 1:00 AM (still part of Thursday night shift)
  const earlyMorning = sTimestamp('2025-01-10T01:00')
  expect(isScheduleAvailable(schedule, earlyMorning)).toBe(true)
})

it('should return false after cross-midnight range ends', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        // Thursday night to Friday morning
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
    ],
  }

  // Friday at 3:00 AM (after shift ends)
  const tooLate = sTimestamp('2025-01-10T03:00')
  expect(isScheduleAvailable(schedule, tooLate)).toBe(false)
})

it('should return false for empty times array', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [],
      },
    ],
  }

  const timestamp = sTimestamp('2025-01-07T10:00')
  expect(isScheduleAvailable(schedule, timestamp)).toBe(false)
})

it('should return true for Saturday when override includes weekend hours', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        // December weekend hours
        rules: [
          {
            weekdays: sWeekdays('S-----S'),
            times: [{ from: sTime('10:00'), to: sTime('16:00') }],
          },
        ],
      },
    ],
  }

  // Saturday in December at 11:00 AM
  const saturdayInDecember = sTimestamp('2025-12-06T11:00')
  expect(isScheduleAvailable(schedule, saturdayInDecember)).toBe(true)
})

it('should return false for weekday when override only includes weekend hours', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        // December weekend hours
        rules: [
          {
            weekdays: sWeekdays('S-----S'),
            times: [{ from: sTime('10:00'), to: sTime('16:00') }],
          },
        ],
      },
    ],
  }

  // Monday in December at 11:00 AM (not in override's weekdays)
  const mondayInDecember = sTimestamp('2025-12-01T11:00')
  expect(isScheduleAvailable(schedule, mondayInDecember)).toBe(false)
})

it('should return false on Christmas Eve evening when specific date override closes', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // December extended hours with cross-midnight
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
      {
        // Christmas Eve closed (more specific - should override)
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        rules: [],
      },
    ],
  }

  // Christmas Eve evening - should be unavailable (closed)
  expect(isScheduleAvailable(schedule, sTimestamp('2025-12-24T21:00'))).toBe(
    false,
  )
})

it('should return false on Christmas morning with no spillover from closed Christmas Eve', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // December extended hours with cross-midnight
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
      {
        // Christmas Eve closed (more specific - should override)
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        rules: [],
      },
    ],
  }

  // Christmas morning (spillover from Dec 24 would apply if not closed)
  // But Dec 24 is closed, so no spillover
  expect(isScheduleAvailable(schedule, sTimestamp('2025-12-25T01:00'))).toBe(
    false,
  )
})

it('should return true on Dec 23 evening using December extended hours', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // December extended hours with cross-midnight
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
      {
        // Christmas Eve closed (more specific - should override)
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        rules: [],
      },
    ],
  }

  // Dec 23 evening - should use December extended hours
  expect(isScheduleAvailable(schedule, sTimestamp('2025-12-23T21:00'))).toBe(
    true,
  )
})

it('should return true on Dec 24 morning from Dec 23 spillover', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // December extended hours with cross-midnight
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
      {
        // Christmas Eve closed (more specific - should override)
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        rules: [],
      },
    ],
  }

  // Dec 24 morning (spillover from Dec 23)
  expect(isScheduleAvailable(schedule, sTimestamp('2025-12-24T01:00'))).toBe(
    true,
  )
})

it('should return true on Dec 26 evening using December extended hours', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // December extended hours with cross-midnight
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
      {
        // Christmas Eve closed (more specific - should override)
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        rules: [],
      },
    ],
  }

  // Dec 26 evening - should use December extended hours
  expect(isScheduleAvailable(schedule, sTimestamp('2025-12-26T21:00'))).toBe(
    true,
  )
})

it('should handle spillover from override last day to next day when weekdays match', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // Dec 1-31, 2025 with cross-midnight hours
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            // All weekdays included
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
    ],
  }

  // Jan 1, 2026 at 01:00 (spillover from Dec 31, 2025)
  // Dec 31, 2025 is Wednesday, which is in 'SMTWTFS', so spillover applies
  expect(isScheduleAvailable(schedule, sTimestamp('2026-01-01T01:00'))).toBe(
    true,
  )
})

it('should NOT spillover from override last day when weekday pattern does not match', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // Dec 1-31, 2025 with cross-midnight hours
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            // Only Thursday included
            weekdays: sWeekdays('----T--'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
    ],
  }

  // Jan 1, 2026 at 01:00
  // Dec 31, 2025 is Wednesday, which does NOT match Thursday pattern
  // No spillover should apply
  expect(isScheduleAvailable(schedule, sTimestamp('2026-01-01T01:00'))).toBe(
    false,
  )
})

it('should NOT spillover when previous day is outside override range', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        // Dec 1-30, 2025 (ends Dec 30, not Dec 31)
        from: sDate('2025-12-01'),
        to: sDate('2025-12-30'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
    ],
  }

  // Jan 1, 2026 at 01:00
  // Dec 31, 2025 is OUTSIDE the override range (override ends Dec 30)
  // No override spillover should apply (falls back to weekly rules)
  expect(isScheduleAvailable(schedule, sTimestamp('2026-01-01T01:00'))).toBe(
    false,
  )
})
