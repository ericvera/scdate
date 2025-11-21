import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateNoOverlappingOverrides } from './validateNoOverlappingOverrides.js'

const baseSchedule: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      times: [{ from: sTime('09:00'), to: sTime('17:00') }],
    },
  ],
}

it('should return empty array when there are no overrides', () => {
  const errors = validateNoOverlappingOverrides(baseSchedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return empty array when there is only one override', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return empty array for non-overlapping overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-10'),
        rules: [],
      },
      {
        from: sDate('2025-12-15'),
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for overlapping overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-20'),
        rules: [],
      },
      {
        from: sDate('2025-12-15'),
        to: sDate('2025-12-31'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-specific-overrides",
        "overrideIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})

it('should return error for duplicate overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [],
      },
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: sTime('16:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "duplicate-overrides",
        "overrideIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})

it('should return error for adjacent overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-15'),
        rules: [],
      },
      {
        from: sDate('2025-12-15'),
        to: sDate('2025-12-31'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-specific-overrides",
        "overrideIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})

it('should not error for indefinite overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [],
      },
      {
        from: sDate('2026-01-01'),
        // no 'to' - indefinite
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return multiple errors for multiple overlapping pairs', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-20'),
        rules: [],
      },
      {
        from: sDate('2025-12-15'),
        to: sDate('2025-12-25'),
        rules: [],
      },
      {
        from: sDate('2025-12-20'),
        to: sDate('2025-12-31'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-specific-overrides",
        "overrideIndexes": [
          0,
          1,
        ],
      },
      {
        "issue": "overlapping-specific-overrides",
        "overrideIndexes": [
          0,
          2,
        ],
      },
      {
        "issue": "overlapping-specific-overrides",
        "overrideIndexes": [
          1,
          2,
        ],
      },
    ]
  `)
})

it('should allow fully contained override (hierarchical)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December month-long extended hours
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('08:00'), to: sTime('22:00') }],
          },
        ],
      },
      {
        // Christmas Day closed (fully contained within December)
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should allow multiple nested overrides within a broader one', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('08:00'), to: sTime('22:00') }],
          },
        ],
      },
      {
        // Christmas Eve half day
        from: sDate('2025-12-24'),
        to: sDate('2025-12-24'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('08:00'), to: sTime('13:00') }],
          },
        ],
      },
      {
        // Christmas Day closed
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [],
      },
      {
        // New Year's Day closed
        from: sDate('2025-12-31'),
        to: sDate('2025-12-31'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should allow nested override at exact boundary dates', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('08:00'), to: sTime('22:00') }],
          },
        ],
      },
      {
        // First day of December has special hours (at boundary)
        from: sDate('2025-12-01'),
        to: sDate('2025-12-01'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: sTime('20:00') }],
          },
        ],
      },
      {
        // Last day of December is closed (at boundary)
        from: sDate('2025-12-31'),
        to: sDate('2025-12-31'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should still error on partial overlaps (not fully contained)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-20'),
        rules: [],
      },
      {
        // Overlaps but not fully contained (extends beyond Dec 20)
        from: sDate('2025-12-15'),
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const errors = validateNoOverlappingOverrides(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-specific-overrides",
        "overrideIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})
