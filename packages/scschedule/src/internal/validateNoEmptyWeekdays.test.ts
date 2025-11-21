import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateNoEmptyWeekdays } from './validateNoEmptyWeekdays.js'

const baseSchedule: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      times: [{ from: sTime('09:00'), to: sTime('17:00') }],
    },
  ],
}

it('should return empty array for valid weekdays', () => {
  const errors = validateNoEmptyWeekdays(baseSchedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for empty weekdays in weekly rule', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // No days selected
        weekdays: '-------',
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  const errors = validateNoEmptyWeekdays(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "empty-weekdays",
        "location": {
          "ruleIndex": 0,
          "type": "weekly",
        },
      },
    ]
  `)
})

it('should return error for empty weekdays in override rule', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [
          {
            // No days selected
            weekdays: '-------',
            times: [{ from: sTime('10:00'), to: sTime('14:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoEmptyWeekdays(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "empty-weekdays",
        "location": {
          "overrideIndex": 0,
          "ruleIndex": 0,
          "type": "override",
        },
      },
    ]
  `)
})

it('should return multiple errors for multiple empty weekdays', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        // Empty
        weekdays: '-------',
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
      {
        // Valid
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('10:00'), to: sTime('16:00') }],
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [
          {
            // Empty
            weekdays: '-------',
            times: [{ from: sTime('10:00'), to: sTime('14:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoEmptyWeekdays(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "empty-weekdays",
        "location": {
          "ruleIndex": 0,
          "type": "weekly",
        },
      },
      {
        "issue": "empty-weekdays",
        "location": {
          "overrideIndex": 0,
          "ruleIndex": 0,
          "type": "override",
        },
      },
    ]
  `)
})

it('should handle schedules with no overrides', () => {
  const errors = validateNoEmptyWeekdays(baseSchedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should accept weekdays with at least one day selected', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        // Only Sunday
        weekdays: sWeekdays('S------'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
      {
        // Only Saturday
        weekdays: sWeekdays('------S'),
        times: [{ from: sTime('10:00'), to: sTime('16:00') }],
      },
    ],
  }

  const errors = validateNoEmptyWeekdays(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})
