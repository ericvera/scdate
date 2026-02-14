import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateNoOverlappingTimesInRule } from './validateNoOverlappingTimesInRule.js'

it('should return empty array for non-overlapping times in weekly rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [
          { from: sTime('09:00'), to: sTime('12:00') },
          { from: sTime('13:00'), to: sTime('17:00') },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for overlapping times in weekly rule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [
          { from: sTime('09:00'), to: sTime('14:00') },
          { from: sTime('12:00'), to: sTime('17:00') },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-times-in-rule",
        "location": {
          "ruleIndex": 0,
          "type": "weekly",
        },
        "timeRangeIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})

it('should not error for different weekday rules even if times overlap', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
      {
        weekdays: sWeekdays('S-----S'),
        times: [{ from: sTime('10:00'), to: sTime('16:00') }],
      },
    ],
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for overlapping times in override rule', () => {
  const schedule: Schedule = {
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
            weekdays: sWeekdays('SMTWTFS'),
            times: [
              { from: sTime('10:00'), to: sTime('15:00') },
              { from: sTime('14:00'), to: sTime('20:00') },
            ],
          },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-times-in-rule",
        "location": {
          "overrideIndex": 0,
          "ruleIndex": 0,
          "type": "override",
        },
        "timeRangeIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})

it('should handle cross-midnight overlaps', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        times: [
          { from: sTime('20:00'), to: sTime('02:00') },
          { from: sTime('22:00'), to: sTime('03:00') },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-times-in-rule",
        "location": {
          "ruleIndex": 0,
          "type": "weekly",
        },
        "timeRangeIndexes": [
          0,
          1,
        ],
      },
    ]
  `)
})

it('should return empty array when rule has only one time range', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return no errors when weekly is true', () => {
  const schedule: Schedule = {
    weekly: true,
  }

  const errors = validateNoOverlappingTimesInRule(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})
