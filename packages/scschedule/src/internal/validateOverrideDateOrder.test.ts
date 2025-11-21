import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateOverrideDateOrder } from './validateOverrideDateOrder.js'

const baseSchedule: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [],
}

it('returns empty array when there are no overrides', () => {
  const errors = validateOverrideDateOrder(baseSchedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('returns empty array when override has valid date order (from before to)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-01-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('-MTWTF-'),
            times: [{ from: sTime('09:00'), to: '17:00' }],
          },
        ],
      },
    ],
  }

  const errors = validateOverrideDateOrder(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('returns empty array when from and to are the same date', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const errors = validateOverrideDateOrder(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('returns empty array for indefinite overrides (no to date)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '09:00', to: sTime('17:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateOverrideDateOrder(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('detects when to date is before from date', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-31'),
        to: '2025-01-01',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('09:00'), to: '17:00' }],
          },
        ],
      },
    ],
  }

  const errors = validateOverrideDateOrder(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-12-31",
        "issue": "invalid-override-date-order",
        "overrideIndex": 0,
        "to": "2025-01-01",
      },
    ]
  `)
})

it('detects multiple invalid date orders', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-12-31',
        to: sDate('2025-01-01'),
        rules: [],
      },
      {
        from: sDate('2025-06-01'),
        to: '2025-06-30',
        rules: [],
      },
      {
        from: '2025-11-30',
        to: sDate('2025-11-01'),
        rules: [],
      },
    ],
  }

  const errors = validateOverrideDateOrder(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-12-31",
        "issue": "invalid-override-date-order",
        "overrideIndex": 0,
        "to": "2025-01-01",
      },
      {
        "from": "2025-11-30",
        "issue": "invalid-override-date-order",
        "overrideIndex": 2,
        "to": "2025-11-01",
      },
    ]
  `)
})
