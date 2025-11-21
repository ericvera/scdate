import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateNonEmptyTimes } from './validateNonEmptyTimes.js'

it('should return empty array for valid schedule with non-empty times', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  const errors = validateNonEmptyTimes(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for weekly rule with empty times', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [],
      },
    ],
  }

  const errors = validateNonEmptyTimes(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "empty-times",
        "location": {
          "ruleIndex": 0,
          "type": "weekly",
        },
      },
    ]
  `)
})

it('should allow empty rules array in overrides (represents closed)', () => {
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
        // This is valid - represents closed
        rules: [],
      },
    ],
  }

  const errors = validateNonEmptyTimes(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for override rule with empty times', () => {
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
            weekdays: sWeekdays('S-----S'),
            // This is invalid - rule exists but has no times
            times: [],
          },
        ],
      },
    ],
  }

  const errors = validateNonEmptyTimes(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "empty-times",
        "location": {
          "overrideIndex": 0,
          "ruleIndex": 0,
          "type": "override",
        },
      },
    ]
  `)
})

it('should return multiple errors for multiple empty times', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [],
      },
      {
        weekdays: sWeekdays('S-----S'),
        times: [],
      },
    ],
  }

  const errors = validateNonEmptyTimes(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "empty-times",
        "location": {
          "ruleIndex": 0,
          "type": "weekly",
        },
      },
      {
        "issue": "empty-times",
        "location": {
          "ruleIndex": 1,
          "type": "weekly",
        },
      },
    ]
  `)
})
