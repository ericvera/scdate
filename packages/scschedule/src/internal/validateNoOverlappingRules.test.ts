import { sDate, sTime, sWeekdays, Weekday } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateNoOverlappingRules } from './validateNoOverlappingRules.js'

const baseSchedule: Schedule = {
  weekly: [],
}

it('returns empty array when there are no weekly rules', () => {
  const errors = validateNoOverlappingRules(baseSchedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('returns empty array when weekly rules do not overlap', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Mon-Fri
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
      {
        // Sat-Sun
        weekdays: sWeekdays('S-----S'),
        times: [{ from: sTime('10:00'), to: sTime('18:00') }],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('detects overlapping weekly rules', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Mon-Fri
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
      {
        // Wed-Fri (overlaps with first rule)
        weekdays: sWeekdays('---WTF-'),
        times: [{ from: sTime('14:00'), to: sTime('18:00') }],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-rules-in-weekly",
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Wed)},
      },
    ]
  `)
})

it('detects cross-midnight overlap in weekly rules', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Saturday, crosses into Sunday
        weekdays: sWeekdays('------S'),
        times: [{ from: sTime('22:00'), to: sTime('02:00') }],
      },
      {
        // Sunday
        weekdays: sWeekdays('S------'),
        times: [{ from: sTime('01:00'), to: sTime('10:00') }],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-rules-in-weekly",
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Sun)},
      },
    ]
  `)
})

it('returns empty array when override rules do not overlap', () => {
  const schedule: Schedule = {
    ...baseSchedule,
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
            // Mon-Fri
            weekdays: sWeekdays('-MTWTF-'),
            times: [{ from: sTime('08:00'), to: sTime('12:00') }],
          },
          {
            // Sat-Sun
            weekdays: sWeekdays('S-----S'),
            times: [{ from: sTime('10:00'), to: sTime('18:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('detects overlapping rules within an override', () => {
  const schedule: Schedule = {
    ...baseSchedule,
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
            // All days
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('09:00'), to: sTime('17:00') }],
          },
          {
            // All days, overlapping times
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('14:00'), to: sTime('18:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-rules-in-override",
        "overrideIndex": 0,
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Sun)},
      },
    ]
  `)
})

it('detects cross-midnight overlap in override rules', () => {
  const schedule: Schedule = {
    ...baseSchedule,
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
            // Friday, crosses into Saturday
            weekdays: sWeekdays('-----F-'),
            times: [{ from: sTime('20:00'), to: sTime('03:00') }],
          },
          {
            // Saturday
            weekdays: sWeekdays('------S'),
            times: [{ from: sTime('01:00'), to: sTime('10:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-rules-in-override",
        "overrideIndex": 0,
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Sat)},
      },
    ]
  `)
})

it('detects multiple overlaps across different overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        weekdays: sWeekdays('-M-----'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
      {
        // Overlaps with first rule
        weekdays: sWeekdays('-M-----'),
        times: [{ from: sTime('14:00'), to: sTime('18:00') }],
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: sDate('2025-12-15'),
        rules: [
          {
            weekdays: sWeekdays('--T----'),
            times: [{ from: sTime('10:00'), to: sTime('14:00') }],
          },
          {
            // Overlaps with first rule
            weekdays: sWeekdays('--T----'),
            times: [{ from: sTime('12:00'), to: sTime('16:00') }],
          },
        ],
      },
      {
        from: sDate('2025-12-16'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('---W---'),
            times: [{ from: sTime('08:00'), to: sTime('12:00') }],
          },
          {
            // Overlaps with first rule
            weekdays: sWeekdays('---W---'),
            times: [{ from: sTime('11:00'), to: sTime('15:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-rules-in-weekly",
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Mon)},
      },
      {
        "issue": "overlapping-rules-in-override",
        "overrideIndex": 0,
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Tue)},
      },
      {
        "issue": "overlapping-rules-in-override",
        "overrideIndex": 1,
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Wed)},
      },
    ]
  `)
})

it('does not report overlap when weekdays do not occur in override date range', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [],
    overrides: [
      {
        // Dec 1-3, 2025 is Mon-Wed only
        from: '2025-12-01',
        to: '2025-12-03',
        rules: [
          {
            // Normalized to Mon-Wed only
            weekdays: '-MTW---',
            times: [{ from: '09:00', to: '17:00' }],
          },
          {
            // Normalized - Sat-Sun don't occur in Mon-Wed, becomes empty
            weekdays: sWeekdays('-------'),
            times: [{ from: sTime('10:00'), to: sTime('18:00') }],
          },
        ],
      },
    ],
  }

  // Should NOT report overlap because rule2 has no weekdays
  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('reports overlap only on weekdays that occur in override date range', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [],
    overrides: [
      {
        // Dec 1-3, 2025 is Mon-Wed
        from: sDate('2025-12-01'),
        to: sDate('2025-12-03'),
        rules: [
          {
            // Normalized to Mon-Wed only
            weekdays: sWeekdays('-MTW---'),
            times: [{ from: '09:00', to: '17:00' }],
          },
          {
            // Normalized - Monday remains, Saturday filtered out
            weekdays: '-M-----',
            times: [{ from: sTime('10:00'), to: sTime('18:00') }],
          },
        ],
      },
    ],
  }

  // Should report overlap only on Monday
  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "overlapping-rules-in-override",
        "overrideIndex": 0,
        "ruleIndexes": [
          0,
          1,
        ],
        "weekday": ${String(Weekday.Mon)},
      },
    ]
  `)
})

it('handles single-day override correctly', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [],
    overrides: [
      {
        // Dec 1, 2025 is Monday only
        from: '2025-12-01',
        to: '2025-12-01',
        rules: [
          {
            // Normalized to Monday only
            weekdays: '-M-----',
            times: [{ from: sTime('09:00'), to: sTime('17:00') }],
          },
          {
            // Normalized - Tue-Thu don't occur, becomes empty
            weekdays: sWeekdays('-------'),
            times: [{ from: '10:00', to: '18:00' }],
          },
        ],
      },
    ],
  }

  // Should NOT report overlap because rule2 has no weekdays
  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return no errors when weekly is true', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: true,
  }

  const errors = validateNoOverlappingRules(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})
