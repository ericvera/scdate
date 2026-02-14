import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { normalizeScheduleForValidation } from './normalizeScheduleForValidation.js'

const baseSchedule: Schedule = {
  weekly: [
    {
      weekdays: '-MTWTF-',
      times: [{ from: '09:00', to: '17:00' }],
    },
  ],
}

it('returns schedule as-is when there are no overrides', () => {
  const normalized = normalizeScheduleForValidation(baseSchedule)
  expect(normalized).toMatchInlineSnapshot(`
    {
      "weekly": [
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
    }
  `)
})

it('preserves indefinite overrides without filtering weekdays', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        from: '2026-01-01',
        // No 'to' date - indefinite
        rules: [
          {
            weekdays: sWeekdays('S-----S'),
            times: [{ from: sTime('10:00'), to: '14:00' }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2026-01-01",
          "rules": [
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "14:00",
                },
              ],
              "weekdays": "S-----S",
            },
          ],
        },
      ],
      "weekly": [
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
    }
  `)
})

it('filters weekdays for specific override to match actual dates in range', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: '2025-12-11',
        to: sDate('2025-12-12'),
        rules: [
          {
            // All weekdays - should be filtered to Thu-Fri only
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: '14:00' }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect the weekdays to be filtered to only include Thursday and Friday
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-11",
          "rules": [
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "14:00",
                },
              ],
              "weekdays": "----TF-",
            },
          ],
          "to": "2025-12-12",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('filters weekdays to empty when none match the date range', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: sDate('2025-12-11'),
        to: '2025-12-12',
        rules: [
          {
            // Only Sat-Sun - no match with Thu-Fri
            weekdays: 'S-----S',
            times: [{ from: '10:00', to: sTime('14:00') }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect the weekdays to be filtered to only include Saturday and Sunday
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-11",
          "rules": [
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "14:00",
                },
              ],
              "weekdays": "-------",
            },
          ],
          "to": "2025-12-12",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('handles single-day override correctly', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 25, 2025 is a Thursday
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        rules: [
          {
            // All weekdays - should be filtered to only Thursday
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: '18:00' }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect the weekdays to be filtered to only include Thursday
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-25",
          "rules": [
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "18:00",
                },
              ],
              "weekdays": "----T--",
            },
          ],
          "to": "2025-12-25",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('filters multiple rules within same override independently', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: '2025-12-11',
        to: '2025-12-12',
        rules: [
          {
            // All days - should become Thu-Fri
            weekdays: 'SMTWTFS',
            times: [{ from: sTime('09:00'), to: '17:00' }],
          },
          {
            // Mon-Wed - should become empty (no match)
            weekdays: sWeekdays('-MTW---'),
            times: [{ from: '10:00', to: sTime('14:00') }],
          },
          {
            // Thu-Sat - should become Thu-Fri (Sat filtered out)
            weekdays: sWeekdays('----TFS'),
            times: [{ from: sTime('12:00'), to: '20:00' }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect the weekdays to be filtered to only include Thursday, Friday, and
  // Sunday
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-11",
          "rules": [
            {
              "times": [
                {
                  "from": "09:00",
                  "to": "17:00",
                },
              ],
              "weekdays": "----TF-",
            },
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "14:00",
                },
              ],
              "weekdays": "-------",
            },
            {
              "times": [
                {
                  "from": "12:00",
                  "to": "20:00",
                },
              ],
              "weekdays": "----TF-",
            },
          ],
          "to": "2025-12-12",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('handles multiple overrides independently', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 11-12, 2025 (Thursday-Friday)
        from: sDate('2025-12-11'),
        to: '2025-12-12',
        rules: [
          {
            weekdays: 'SMTWTFS',
            times: [{ from: '09:00', to: sTime('17:00') }],
          },
        ],
      },
      {
        // January 1, 2026 (Thursday)
        from: '2026-01-01',
        to: sDate('2026-01-01'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: '14:00' }],
          },
        ],
      },
      {
        // Indefinite - should not be filtered
        from: sDate('2026-06-01'),
        rules: [
          {
            weekdays: 'S-----S',
            times: [{ from: '12:00', to: sTime('18:00') }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // First override: Thu-Fri
  // Second override: Thu only
  // Third override: indefinite, preserved (Saturday-Sunday)
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-11",
          "rules": [
            {
              "times": [
                {
                  "from": "09:00",
                  "to": "17:00",
                },
              ],
              "weekdays": "----TF-",
            },
          ],
          "to": "2025-12-12",
        },
        {
          "from": "2026-01-01",
          "rules": [
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "14:00",
                },
              ],
              "weekdays": "----T--",
            },
          ],
          "to": "2026-01-01",
        },
        {
          "from": "2026-06-01",
          "rules": [
            {
              "times": [
                {
                  "from": "12:00",
                  "to": "18:00",
                },
              ],
              "weekdays": "S-----S",
            },
          ],
        },
      ],
      "weekly": [
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
    }
  `)
})

it('preserves empty rules arrays in overrides', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // Closed on Christmas
        from: sDate('2025-12-25'),
        to: '2025-12-25',
        rules: [],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect the just preserve empty rules array
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-25",
          "rules": [],
          "to": "2025-12-25",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('handles week-long override spanning all weekdays', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 7-13, 2025 (Sun-Sat) - full week
        from: '2025-12-07',
        to: sDate('2025-12-13'),
        rules: [
          {
            // All days - should remain all days
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('08:00'), to: '22:00' }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect to include all weekdays
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-07",
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
          "to": "2025-12-13",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('filters partial weekday matches correctly', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 1-5, 2025 (Mon-Fri)
        from: sDate('2025-12-01'),
        to: '2025-12-05',
        rules: [
          {
            // Wed-Sun - should become Wed-Fri (Sat-Sun filtered out)
            weekdays: '---WTFS',
            times: [{ from: '09:00', to: sTime('17:00') }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Expect to include Wed-Fri
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-01",
          "rules": [
            {
              "times": [
                {
                  "from": "09:00",
                  "to": "17:00",
                },
              ],
              "weekdays": "---WTF-",
            },
          ],
          "to": "2025-12-05",
        },
      ],
      "weekly": [
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
    }
  `)
})

it('handles cross-month override correctly', () => {
  const schedule: Schedule = {
    ...baseSchedule,
    overrides: [
      {
        // December 29, 2025 - January 2, 2026 (Mon-Fri)
        from: '2025-12-29',
        to: sDate('2026-01-02'),
        rules: [
          {
            // All weekdays
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('10:00'), to: '18:00' }],
          },
        ],
      },
    ],
  }

  const normalized = normalizeScheduleForValidation(schedule)
  // Should include Mon-Fri (Dec 29-31, Jan 1-2)
  expect(normalized).toMatchInlineSnapshot(`
    {
      "overrides": [
        {
          "from": "2025-12-29",
          "rules": [
            {
              "times": [
                {
                  "from": "10:00",
                  "to": "18:00",
                },
              ],
              "weekdays": "-MTWTF-",
            },
          ],
          "to": "2026-01-02",
        },
      ],
      "weekly": [
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
    }
  `)
})
