import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateOverrideWeekdaysMatchDates } from './validateOverrideWeekdaysMatchDates.js'

const baseSchedule: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      from: sTime('09:00'),
      to: sTime('17:00'),
    },
  ],
}

it('should return empty array when there are no overrides', () => {
  const errors = validateOverrideWeekdaysMatchDates(baseSchedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return empty array when override weekdays match the dates', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: sDate('2025-12-11'),
        to: sDate('2025-12-12'),
        rules: [
          {
            // Thursday and Friday match!
            weekdays: sWeekdays('----TF-'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error when override weekdays do not match any dates in range', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: sDate('2025-12-11'),
        to: sDate('2025-12-12'),
        rules: [
          {
            // Saturday/Sunday - no match!
            weekdays: sWeekdays('S-----S'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "dateRange": {
          "from": "2025-12-11",
          "to": "2025-12-12",
        },
        "issue": "override-weekdays-mismatch",
        "overrideIndex": 0,
        "ruleIndex": 0,
        "weekdays": "S-----S",
      },
    ]
  `)
})

it('should allow partial weekday match (at least one day matches)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 9-13, 2025 (Tue-Sat)
        from: sDate('2025-12-09'),
        to: sDate('2025-12-13'),
        rules: [
          {
            // Only Thursday - matches one day in the range
            weekdays: sWeekdays('----T--'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should skip indefinite overrides (no to date)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2026-01-01'),
        // No 'to' date - indefinite, so weekdays will eventually match
        rules: [
          {
            // Only Sunday
            weekdays: sWeekdays('S------'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should skip overrides with empty rules (intentionally closed)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        // Intentionally closed - no need to check weekdays
        rules: [],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for single-day override with wrong weekday', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 25, 2025 is a Thursday
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [
          {
            // Saturday/Sunday - Thursday doesn't match
            weekdays: sWeekdays('S-----S'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "dateRange": {
          "from": "2025-12-25",
          "to": "2025-12-25",
        },
        "issue": "override-weekdays-mismatch",
        "overrideIndex": 0,
        "ruleIndex": 0,
        "weekdays": "S-----S",
      },
    ]
  `)
})

it('should return multiple errors for multiple mismatched rules', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: sDate('2025-12-11'),
        to: sDate('2025-12-12'),
        rules: [
          {
            // Only Sunday - no match
            weekdays: sWeekdays('S------'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
          {
            // Only Saturday - no match
            weekdays: sWeekdays('------S'),
            from: sTime('15:00'),
            to: sTime('18:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "dateRange": {
          "from": "2025-12-11",
          "to": "2025-12-12",
        },
        "issue": "override-weekdays-mismatch",
        "overrideIndex": 0,
        "ruleIndex": 0,
        "weekdays": "S------",
      },
      {
        "dateRange": {
          "from": "2025-12-11",
          "to": "2025-12-12",
        },
        "issue": "override-weekdays-mismatch",
        "overrideIndex": 0,
        "ruleIndex": 1,
        "weekdays": "------S",
      },
    ]
  `)
})

it('should handle week-long override spanning all weekdays', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 7-13, 2025 (Sun-Sat) - full week
        from: sDate('2025-12-07'),
        to: sDate('2025-12-13'),
        rules: [
          {
            // All days - definitely matches
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('10:00'),
            to: sTime('14:00'),
          },
        ],
      },
    ],
  }

  const errors = validateOverrideWeekdaysMatchDates(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})
