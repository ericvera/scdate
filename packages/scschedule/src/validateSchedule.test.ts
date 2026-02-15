import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from './types.js'
import { validateSchedule } from './validateSchedule.js'

it('should return valid for a correct schedule', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '-MTWTFS',
        from: sTime('11:00'),
        to: '22:00',
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
      {
        "errors": [],
        "valid": true,
      }
    `)
})

it('should allow multiple indefinite overrides', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '-MTWTF-',
        from: '09:00',
        to: '17:00',
      },
    ],
    overrides: [
      {
        from: '2026-01-01',
        rules: [],
      },
      {
        from: '2027-01-01',
        rules: [],
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
      {
        "errors": [],
        "valid": true,
      }
    `)
})

it('should detect overlapping specific overrides', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: '17:00',
      },
    ],
    overrides: [
      {
        from: '2025-12-01',
        to: sDate('2025-12-20'),
        rules: [],
      },
      {
        from: sDate('2025-12-15'),
        to: '2025-12-31',
        rules: [],
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
      {
        "errors": [
          {
            "issue": "overlapping-specific-overrides",
            "overrideIndexes": [
              0,
              1,
            ],
          },
        ],
        "valid": false,
      }
    `)
})

it('should detect invalid scdate formats', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: 'INVALID',
        from: '09:00',
        to: sTime('17:00'),
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
      {
        "errors": [
          {
            "expectedFormat": "SMTWTFS",
            "field": "weekly[0].weekdays",
            "issue": "invalid-scdate-format",
            "value": "INVALID",
          },
        ],
        "valid": false,
      }
    `)
})

it('should return all structural errors when multiple issues exist', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: 'INVALID',
        from: '09:00',
        to: 'BADTIME',
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
    {
      "errors": [
        {
          "expectedFormat": "SMTWTFS",
          "field": "weekly[0].weekdays",
          "issue": "invalid-scdate-format",
          "value": "INVALID",
        },
        {
          "expectedFormat": "HH:MM",
          "field": "weekly[0].to",
          "issue": "invalid-scdate-format",
          "value": "BADTIME",
        },
      ],
      "valid": false,
    }
  `)
})

it('should validate complex valid schedule with overrides', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '-MTWTF-',
        from: sTime('11:00'),
        to: '14:00',
      },
      {
        weekdays: '-MTWTF-',
        from: '17:00',
        to: sTime('22:00'),
      },
      {
        weekdays: sWeekdays('S-----S'),
        from: '12:00',
        to: sTime('20:00'),
      },
    ],
    overrides: [
      {
        from: '2025-11-27',
        to: sDate('2025-11-27'),
        rules: [],
      },
      {
        from: sDate('2025-12-01'),
        to: '2025-12-31',
        rules: [
          {
            weekdays: 'S-----S',
            from: sTime('08:00'),
            to: '23:00',
          },
        ],
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
      {
        "errors": [],
        "valid": true,
      }
    `)
})

it('should validate schedule with hierarchical overrides (December + Christmas)', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '-MTWTF-',
        from: sTime('09:00'),
        to: '17:00',
      },
    ],
    overrides: [
      {
        // December extended hours
        from: '2025-12-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            from: '08:00',
            to: sTime('22:00'),
          },
        ],
      },
      {
        // Christmas Day closed (nested within December)
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
    {
      "errors": [],
      "valid": true,
    }
  `)
})

it('should validate split shift schedule (non-overlapping rules for same weekdays)', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '-MTWTF-',
        from: sTime('09:00'),
        to: '12:00',
      },
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: '13:00',
        to: sTime('17:00'),
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
    {
      "errors": [],
      "valid": true,
    }
  `)
})

it('should detect overlapping split shift rules', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: '14:00',
      },
      {
        weekdays: '-MTWTF-',
        from: '13:00',
        to: sTime('17:00'),
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
    {
      "errors": [
        {
          "issue": "overlapping-rules-in-weekly",
          "ruleIndexes": [
            0,
            1,
          ],
          "weekday": 2,
        },
      ],
      "valid": false,
    }
  `)
})

it('should validate weekly:true with overrides', () => {
  const schedule: Schedule = {
    weekly: true,
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
    {
      "errors": [],
      "valid": true,
    }
  `)
})

it('should detect invalid override date order (to before from)', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: '09:00',
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-31'),
        to: '2025-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            from: sTime('10:00'),
            to: '18:00',
          },
        ],
      },
    ],
  }

  const result = validateSchedule(schedule)
  expect(result).toMatchInlineSnapshot(`
    {
      "errors": [
        {
          "from": "2025-12-31",
          "issue": "invalid-override-date-order",
          "overrideIndex": 0,
          "to": "2025-01-01",
        },
      ],
      "valid": false,
    }
  `)
})
