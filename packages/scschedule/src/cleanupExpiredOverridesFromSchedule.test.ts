import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { cleanupExpiredOverridesFromSchedule } from './cleanupExpiredOverridesFromSchedule.js'
import type { Schedule } from './types.js'

const baseSchedule: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      from: sTime('09:00'),
      to: sTime('17:00'),
    },
  ],
}

it('should return schedule as-is when there are no overrides', () => {
  const result = cleanupExpiredOverridesFromSchedule(baseSchedule, '2025-12-31')
  expect(result).toMatchInlineSnapshot(`
      {
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})

it('should remove overrides that ended before the given date', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-11-01',
        to: sDate('2025-11-30'),
        rules: [],
      },
      {
        from: sDate('2025-12-01'),
        to: '2025-12-31',
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(schedule, '2025-12-01')
  expect(result).toMatchInlineSnapshot(`
      {
        "overrides": [
          {
            "from": "2025-12-01",
            "rules": [],
            "to": "2025-12-31",
          },
        ],
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})

it('should keep overrides that end on the given date', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-12-01',
        to: '2025-12-31',
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(
    schedule,
    sDate('2025-12-31'),
  )
  expect(result).toMatchInlineSnapshot(`
      {
        "overrides": [
          {
            "from": "2025-12-01",
            "rules": [],
            "to": "2025-12-31",
          },
        ],
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})

it('should keep active overrides (cleanup date within override period)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-31'),
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(schedule, '2025-12-15')
  expect(result).toMatchInlineSnapshot(`
      {
        "overrides": [
          {
            "from": "2025-12-01",
            "rules": [],
            "to": "2025-12-31",
          },
        ],
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})

it('should keep indefinite overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-11-01',
        to: sDate('2025-11-30'),
        rules: [],
      },
      {
        from: sDate('2025-12-01'),
        // No 'to' - indefinite
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(schedule, '2025-12-01')
  expect(result).toMatchInlineSnapshot(`
      {
        "overrides": [
          {
            "from": "2025-12-01",
            "rules": [],
          },
        ],
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})

it('should remove overrides property when all overrides are removed', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-11-01',
        to: '2025-11-30',
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(
    schedule,
    sDate('2025-12-01'),
  )
  expect(result).toMatchInlineSnapshot(`
      {
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})

it('should return a new Schedule instance', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: '2025-12-31',
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(schedule, '2025-12-15')
  expect(result).not.toBe(schedule)
})

it('should handle multiple expired and active overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-01-01',
        to: sDate('2025-01-31'),
        rules: [],
      },
      {
        from: sDate('2025-02-01'),
        to: '2025-02-28',
        rules: [],
      },
      {
        from: '2025-03-01',
        to: sDate('2025-03-31'),
        rules: [],
      },
      {
        from: sDate('2025-04-01'),
        to: '2025-04-30',
        rules: [],
      },
    ],
  }

  const result = cleanupExpiredOverridesFromSchedule(schedule, '2025-03-01')
  expect(result).toMatchInlineSnapshot(`
      {
        "overrides": [
          {
            "from": "2025-03-01",
            "rules": [],
            "to": "2025-03-31",
          },
          {
            "from": "2025-04-01",
            "rules": [],
            "to": "2025-04-30",
          },
        ],
        "weekly": [
          {
            "from": "09:00",
            "to": "17:00",
            "weekdays": "-MTWTF-",
          },
        ],
      }
    `)
})
