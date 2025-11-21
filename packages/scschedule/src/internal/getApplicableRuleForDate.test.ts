import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { getApplicableRuleForDate } from './getApplicableRuleForDate.js'

const baseSchedule: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      times: [{ from: sTime('09:00'), to: sTime('17:00') }],
    },
  ],
}

it('should return weekly rules when no overrides exist', () => {
  const result = getApplicableRuleForDate(baseSchedule, sDate('2025-11-17'))
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "17:00",
            },
          ],
          "weekdays": "-MTWTF-",
        },
      ],
      "source": {
        "type": "weekly",
      },
    }
  `)
})

it('should return weekly rules when date is outside all override ranges', () => {
  const scheduleWithOverrides: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-12-25',
        to: sDate('2025-12-26'),
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithOverrides,
    sDate('2025-11-17'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "17:00",
            },
          ],
          "weekdays": "-MTWTF-",
        },
      ],
      "source": {
        "type": "weekly",
      },
    }
  `)
})

it('should return specific override rules when date is in range', () => {
  const scheduleWithOverrides: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-12-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: sTime('20:00') }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithOverrides,
    sDate('2025-12-15'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "10:00",
              "to": "20:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return override rules on start boundary date', () => {
  const scheduleWithOverrides: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2025-12-01'),
        to: '2025-12-31',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '10:00', to: sTime('20:00') }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithOverrides, '2025-12-01')
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "10:00",
              "to": "20:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return override rules on end boundary date', () => {
  const scheduleWithOverrides: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2025-12-01',
        to: '2025-12-31',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: '20:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithOverrides,
    sDate('2025-12-31'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "10:00",
              "to": "20:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return indefinite override rules on start date', () => {
  const scheduleWithIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithIndefinite,
    sDate('2026-01-01'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return indefinite override rules months after start date', () => {
  const scheduleWithIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2026-01-01'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '08:00', to: sTime('22:00') }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithIndefinite, '2026-06-15')
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return indefinite override rules years after start date', () => {
  const scheduleWithIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: sTime('22:00') }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithIndefinite,
    sDate('2027-12-31'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return weekly rules before any overrides start', () => {
  const scheduleWithBoth: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // Indefinite
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '08:00', to: '22:00' }],
          },
        ],
      },
      {
        // Specific override for Christmas
        from: '2026-12-25',
        to: '2026-12-25',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '12:00', to: '16:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithBoth, sDate('2025-12-15'))
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "17:00",
            },
          ],
          "weekdays": "-MTWTF-",
        },
      ],
      "source": {
        "type": "weekly",
      },
    }
  `)
})

it('should return indefinite override rules between indefinite start and specific override', () => {
  const scheduleWithBoth: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // Indefinite
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '08:00', to: '22:00' }],
          },
        ],
      },
      {
        // Specific override for Christmas
        from: '2026-12-25',
        to: '2026-12-25',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '12:00', to: '16:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithBoth, sDate('2026-06-15'))
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should prioritize specific override over indefinite override on specific date', () => {
  const scheduleWithBoth: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // Indefinite
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '08:00', to: '22:00' }],
          },
        ],
      },
      {
        // Specific override for Christmas
        from: '2026-12-25',
        to: '2026-12-25',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '12:00', to: '16:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithBoth, '2026-12-25')
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "12:00",
              "to": "16:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 1,
        "type": "override",
      },
    }
  `)
})

it('should return indefinite override rules after specific override ends', () => {
  const scheduleWithBoth: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // Indefinite
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '08:00', to: '22:00' }],
          },
        ],
      },
      {
        // Specific override for Christmas
        from: '2026-12-25',
        to: '2026-12-25',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '12:00', to: '16:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithBoth, sDate('2026-12-26'))
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should return weekly rules when date is before indefinite override', () => {
  const scheduleWithIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithIndefinite,
    sDate('2025-12-31'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "17:00",
            },
          ],
          "weekdays": "-MTWTF-",
        },
      ],
      "source": {
        "type": "weekly",
      },
    }
  `)
})

it('should select most specific override on Christmas when multiple apply', () => {
  const scheduleWithHierarchy: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: '2025-12-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - more specific)
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithHierarchy,
    sDate('2025-12-25'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [],
      "source": {
        "overrideIndex": 1,
        "type": "override",
      },
    }
  `)
})

it('should select broader override on day before specific override', () => {
  const scheduleWithHierarchy: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: sDate('2025-12-01'),
        to: '2025-12-31',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '08:00', to: sTime('22:00') }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - more specific)
        from: '2025-12-25',
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithHierarchy, '2025-12-24')
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should select broader override on day after specific override', () => {
  const scheduleWithHierarchy: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: '2025-12-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: sTime('22:00') }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - more specific)
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithHierarchy,
    sDate('2025-12-26'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should select December rules before Christmas week in multi-level overrides', () => {
  const scheduleWithMultiLevel: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: '2025-12-01',
        to: '2025-12-31',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
      {
        // Christmas week reduced hours (7 days)
        from: sDate('2025-12-22'),
        to: '2025-12-28',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '09:00', to: sTime('18:00') }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - most specific)
        from: '2025-12-25',
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithMultiLevel,
    sDate('2025-12-15'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should select Christmas week rules on day before Christmas in multi-level overrides', () => {
  const scheduleWithMultiLevel: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
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
        // Christmas week reduced hours (7 days)
        from: '2025-12-22',
        to: sDate('2025-12-28'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('09:00'), to: '18:00' }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - most specific)
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithMultiLevel, '2025-12-24')
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "18:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 1,
        "type": "override",
      },
    }
  `)
})

it('should select Christmas week rules on day after Christmas in multi-level overrides', () => {
  const scheduleWithMultiLevel: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: '2025-12-01',
        to: '2025-12-31',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '08:00', to: '22:00' }],
          },
        ],
      },
      {
        // Christmas week reduced hours (7 days)
        from: sDate('2025-12-22'),
        to: sDate('2025-12-28'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('09:00'), to: sTime('18:00') }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - most specific)
        from: '2025-12-25',
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithMultiLevel,
    sDate('2025-12-26'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "18:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 1,
        "type": "override",
      },
    }
  `)
})

it('should select most specific Christmas Day rules in multi-level overrides', () => {
  const scheduleWithMultiLevel: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: sDate('2025-12-01'),
        to: '2025-12-31',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '08:00', to: sTime('22:00') }],
          },
        ],
      },
      {
        // Christmas week reduced hours (7 days)
        from: '2025-12-22',
        to: sDate('2025-12-28'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('09:00'), to: '18:00' }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - most specific)
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(scheduleWithMultiLevel, '2025-12-25')
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [],
      "source": {
        "overrideIndex": 2,
        "type": "override",
      },
    }
  `)
})

it('should select December rules after Christmas week in multi-level overrides', () => {
  const scheduleWithMultiLevel: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December extended hours (31 days)
        from: '2025-12-01',
        to: sDate('2025-12-31'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: sTime('22:00') }],
          },
        ],
      },
      {
        // Christmas week reduced hours (7 days)
        from: sDate('2025-12-22'),
        to: '2025-12-28',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '09:00', to: '18:00' }],
          },
        ],
      },
      {
        // Christmas Day closed (1 day - most specific)
        from: '2025-12-25',
        to: sDate('2025-12-25'),
        rules: [],
      },
    ],
  }

  const result = getApplicableRuleForDate(
    scheduleWithMultiLevel,
    sDate('2025-12-30'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should select weekly when none of the indefinite overrides apply', () => {
  const scheduleWithMultipleIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
      {
        from: sDate('2027-06-01'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '07:00', to: sTime('23:00') }],
          },
        ],
      },
    ],
  }

  // Before any indefinite overrides - should use weekly
  const result = getApplicableRuleForDate(
    scheduleWithMultipleIndefinite,
    '2025-12-31',
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "09:00",
              "to": "17:00",
            },
          ],
          "weekdays": "-MTWTF-",
        },
      ],
      "source": {
        "type": "weekly",
      },
    }
  `)
})

it('should use first indefinite override before second starts', () => {
  const scheduleWithMultipleIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
      {
        from: sDate('2027-06-01'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '07:00', to: sTime('23:00') }],
          },
        ],
      },
    ],
  }

  // Between first and second indefinite override - should use first
  const result = getApplicableRuleForDate(
    scheduleWithMultipleIndefinite,
    sDate('2027-01-15'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "08:00",
              "to": "22:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 0,
        "type": "override",
      },
    }
  `)
})

it('should use most recent indefinite override after it starts', () => {
  const scheduleWithMultipleIndefinite: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
      {
        from: sDate('2027-06-01'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: '07:00', to: sTime('23:00') }],
          },
        ],
      },
    ],
  }

  // After second indefinite override - should use second (most recent)
  const result = getApplicableRuleForDate(
    scheduleWithMultipleIndefinite,
    '2028-12-31',
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [
        {
          "times": [
            {
              "from": "07:00",
              "to": "23:00",
            },
          ],
          "weekdays": "SMTWTFS",
        },
      ],
      "source": {
        "overrideIndex": 1,
        "type": "override",
      },
    }
  `)
})

it('should prioritize specific override over any indefinite overrides', () => {
  const scheduleWithBothTypes: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: sDate('2026-01-01'),
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '08:00', to: sTime('22:00') }],
          },
        ],
      },
      {
        from: '2027-06-01',
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('07:00'), to: '23:00' }],
          },
        ],
      },
      {
        from: '2028-12-25',
        to: sDate('2028-12-25'),
        rules: [],
      },
    ],
  }

  // Specific override should take precedence even when multiple indefinite
  // overrides exist
  const result = getApplicableRuleForDate(
    scheduleWithBothTypes,
    sDate('2028-12-25'),
  )
  expect(result).toMatchInlineSnapshot(`
    {
      "rules": [],
      "source": {
        "overrideIndex": 2,
        "type": "override",
      },
    }
  `)
})
