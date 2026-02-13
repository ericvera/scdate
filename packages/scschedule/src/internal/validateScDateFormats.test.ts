import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateScDateFormats } from './validateScDateFormats.js'

it('should return empty array for valid schedule formats', () => {
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
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should accept both typed and string formats', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        // String format weekdays
        weekdays: '-MTWTF-',
        times: [
          // Mixed: typed from, string to
          { from: sTime('09:00'), to: '17:00' },
          // Mixed: string from, typed to
          { from: '13:00', to: sTime('14:00') },
        ],
      },
      {
        // Typed format weekdays
        weekdays: sWeekdays('S-----S'),
        // String format times
        times: [{ from: '10:00', to: '16:00' }],
      },
    ],
    overrides: [
      {
        // String format from
        from: '2025-12-25',
        // Typed format to
        to: sDate('2025-12-25'),
        rules: [
          {
            // Typed format weekdays
            weekdays: sWeekdays('SMTWTFS'),
            // Mixed: string from, typed to
            times: [{ from: '08:00', to: sTime('20:00') }],
          },
        ],
      },
      {
        // Typed format from
        from: sDate('2025-01-01'),
        // String format to
        to: '2025-01-01',
        rules: [],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for invalid SWeekdays format in weekly rule', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: 'INVALID',
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "expectedFormat": "SMTWTFS",
        "field": "weekly[0].weekdays",
        "issue": "invalid-scdate-format",
        "value": "INVALID",
      },
    ]
  `)
})

it('should return error for invalid STime format', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: '25:00', to: sTime('17:00') }],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "expectedFormat": "HH:MM",
        "field": "weekly[0].times[0].from",
        "issue": "invalid-scdate-format",
        "value": "25:00",
      },
    ]
  `)
})

it('should return error for invalid SDate format in override', () => {
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
        // Invalid date
        from: '2025-13-45',
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "expectedFormat": "YYYY-MM-DD",
        "field": "overrides[0].from",
        "issue": "invalid-scdate-format",
        "value": "2025-13-45",
      },
    ]
  `)
})

it('should validate formats in override rules', () => {
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
        rules: [
          {
            weekdays: 'INVALID_WEEKDAYS',
            times: [{ from: sTime('10:00'), to: sTime('20:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "expectedFormat": "SMTWTFS",
        "field": "overrides[0].rules[0].weekdays",
        "issue": "invalid-scdate-format",
        "value": "INVALID_WEEKDAYS",
      },
    ]
  `)
})

it('should provide detailed field paths in errors', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: 'INVALID', to: sTime('17:00') }],
      },
    ],
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "expectedFormat": "HH:MM",
        "field": "weekly[0].times[0].from",
        "issue": "invalid-scdate-format",
        "value": "INVALID",
      },
    ]
  `)
})

it('should return no errors when weekly is true', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: true,
  }

  const errors = validateScDateFormats(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})
