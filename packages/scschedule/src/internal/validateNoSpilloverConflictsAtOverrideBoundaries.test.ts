import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateNoSpilloverConflictsAtOverrideBoundaries } from './validateNoSpilloverConflictsAtOverrideBoundaries.js'

const baseSchedule: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [],
}

it('returns empty array when no overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        weekdays: 'SMTWTFS',
        times: [{ from: '20:00', to: sTime('02:00') }],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('returns empty array when override has no spillover conflicts', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [{ from: sTime('09:00'), to: '17:00' }],
      },
    ],
    overrides: [
      {
        from: '2025-12-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '10:00', to: sTime('18:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('allows cross-midnight spillover into closed/empty override day', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Friday cross-midnight
        weekdays: '-----F-',
        times: [{ from: sTime('20:00'), to: '02:00' }],
      },
    ],
    overrides: [
      {
        // Saturday is first day, but closed
        // Saturday
        from: '2025-12-06',
        to: sDate('2025-12-31'),
        // Closed
        rules: [],
      },
    ],
  }

  // No error - spillover into empty day is fine
  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('detects weekly cross-midnight spillover conflict with override first day', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Friday cross-midnight: 20:00-02:00 (spills 00:00-02:00 into Saturday)
        weekdays: sWeekdays('-----F-'),
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
    ],
    overrides: [
      {
        // Saturday
        from: sDate('2025-12-06'),
        to: sDate('2025-12-31'),
        rules: [
          {
            // Saturday 01:00-10:00 overlaps with spillover 00:00-02:00
            weekdays: sWeekdays('------S'),
            times: [{ from: sTime('01:00'), to: sTime('10:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "date": "2025-12-06",
        "issue": "spillover-conflict-into-override-first-day",
        "overrideIndex": 0,
        "overrideRuleIndex": 0,
        "sourceWeeklyRuleIndex": 0,
      },
    ]
  `)
})

it('detects override cross-midnight spillover conflict with next day weekly rule', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Saturday 01:00-10:00
        weekdays: '------S',
        times: [{ from: '01:00', to: sTime('10:00') }],
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-01'),
        // Friday
        to: '2025-12-05',
        rules: [
          {
            // Friday cross-midnight: 20:00-02:00 (spills into Saturday)
            weekdays: sWeekdays('-----F-'),
            times: [{ from: sTime('20:00'), to: '02:00' }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "date": "2025-12-05",
        "issue": "spillover-conflict-override-into-next",
        "nextDayWeeklyRuleIndex": 0,
        "overrideIndex": 0,
        "overrideRuleIndex": 0,
      },
    ]
  `)
})

it('does not flag conflict when spillover does not overlap with next day times', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Saturday starts at 10:00 (no conflict with 00:00-02:00 spillover)
        weekdays: sWeekdays('------S'),
        times: [{ from: '10:00', to: sTime('18:00') }],
      },
    ],
    overrides: [
      {
        from: '2025-12-01',
        // Friday
        to: '2025-12-05',
        rules: [
          {
            // Friday cross-midnight: 20:00-02:00 (spills 00:00-02:00)
            weekdays: '-----F-',
            times: [{ from: sTime('20:00'), to: '02:00' }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('does not flag when weekday pattern prevents spillover', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Only Thursday (Dec 5 is Friday, so no spillover from Thursday)
        weekdays: sWeekdays('----T--'),
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
    ],
    overrides: [
      {
        // Saturday
        from: sDate('2025-12-06'),
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('------S'),
            times: [{ from: sTime('01:00'), to: sTime('10:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('skips last-day validation for indefinite overrides (no last day)', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        weekdays: 'SMTWTFS',
        times: [{ from: sTime('01:00'), to: '10:00' }],
      },
    ],
    overrides: [
      {
        from: '2025-12-01',
        // No 'to' - indefinite override
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '20:00', to: sTime('02:00') }],
          },
        ],
      },
    ],
  }

  // No error - no spillover INTO first day, and we skip checking spillover
  // FROM last day (no last day)
  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('detects spillover into indefinite override first day', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Friday cross-midnight: 22:00-02:00 (spills 00:00-02:00 into Saturday)
        weekdays: '-----F-',
        times: [{ from: sTime('22:00'), to: '02:00' }],
      },
    ],
    overrides: [
      {
        // Saturday, Jan 3, 2026
        from: sDate('2026-01-03'),
        // No 'to' - indefinite override starting Saturday
        rules: [
          {
            // Saturday 00:00-03:00 overlaps with Friday spillover 00:00-02:00
            weekdays: sWeekdays('------S'),
            times: [{ from: sTime('00:00'), to: sTime('03:00') }],
          },
        ],
      },
    ],
  }

  // Should detect spillover INTO indefinite override's first day
  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "date": "2026-01-03",
        "issue": "spillover-conflict-into-override-first-day",
        "overrideIndex": 0,
        "overrideRuleIndex": 0,
        "sourceWeeklyRuleIndex": 0,
      },
    ]
  `)
})

it('detects override spillover into another override', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [],
    overrides: [
      {
        from: sDate('2025-12-01'),
        // Friday
        to: sDate('2025-12-05'),
        rules: [
          {
            // Friday cross-midnight: 20:00-02:00
            weekdays: sWeekdays('-----F-'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
      {
        // Saturday
        from: sDate('2025-12-06'),
        to: sDate('2025-12-31'),
        rules: [
          {
            // Saturday 01:00-10:00 conflicts with spillover
            weekdays: sWeekdays('------S'),
            times: [{ from: sTime('01:00'), to: sTime('10:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  // Detects from both perspectives:
  // 1. First override's last day spilling into next
  //    (spillover-conflict-override-into-next)
  // 2. Second override's first day receiving spillover
  //    (spillover-conflict-into-override-first-day)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "date": "2025-12-05",
        "issue": "spillover-conflict-override-into-next",
        "nextDayOverrideIndex": 1,
        "nextDayOverrideRuleIndex": 0,
        "overrideIndex": 0,
        "overrideRuleIndex": 0,
      },
      {
        "date": "2025-12-06",
        "issue": "spillover-conflict-into-override-first-day",
        "overrideIndex": 1,
        "overrideRuleIndex": 0,
        "sourceOverrideIndex": 0,
        "sourceOverrideRuleIndex": 0,
      },
    ]
  `)
})

it('handles multiple spillover conflicts', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    weekly: [
      {
        // Friday with cross-midnight
        weekdays: sWeekdays('-----F-'),
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
      {
        // Monday with times that conflict with Sunday spillover
        weekdays: sWeekdays('-M-----'),
        times: [{ from: sTime('01:00'), to: sTime('10:00') }],
      },
    ],
    overrides: [
      {
        // Saturday
        from: sDate('2025-12-06'),
        // Sunday
        to: sDate('2025-12-07'),
        rules: [
          {
            // Saturday with times that conflict with Friday spillover
            weekdays: sWeekdays('------S'),
            times: [{ from: sTime('01:00'), to: sTime('10:00') }],
          },
          {
            // Sunday with cross-midnight
            weekdays: sWeekdays('S------'),
            times: [{ from: sTime('20:00'), to: sTime('02:00') }],
          },
        ],
      },
    ],
  }

  const errors = validateNoSpilloverConflictsAtOverrideBoundaries(schedule)
  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "date": "2025-12-06",
        "issue": "spillover-conflict-into-override-first-day",
        "overrideIndex": 0,
        "overrideRuleIndex": 0,
        "sourceWeeklyRuleIndex": 0,
      },
      {
        "date": "2025-12-07",
        "issue": "spillover-conflict-override-into-next",
        "nextDayWeeklyRuleIndex": 1,
        "overrideIndex": 0,
        "overrideRuleIndex": 1,
      },
    ]
  `)
})
