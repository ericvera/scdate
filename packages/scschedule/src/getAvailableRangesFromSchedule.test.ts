import { sDate, sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { getAvailableRangesFromSchedule } from './getAvailableRangesFromSchedule.js'
import type { Schedule } from './types.js'

it('should return single range for continuous availability', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  // Monday to Friday (5 business days)
  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-01-06'),
    sDate('2025-01-10'),
  )

  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-01-06T09:00",
        "to": "2025-01-06T17:00",
      },
      {
        "from": "2025-01-07T09:00",
        "to": "2025-01-07T17:00",
      },
      {
        "from": "2025-01-08T09:00",
        "to": "2025-01-08T17:00",
      },
      {
        "from": "2025-01-09T09:00",
        "to": "2025-01-09T17:00",
      },
      {
        "from": "2025-01-10T09:00",
        "to": "2025-01-10T17:00",
      },
    ]
  `)
})

it('should skip unavailable days', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [{ from: '09:00', to: '17:00' }],
      },
    ],
  }

  // Saturday to Tuesday (includes weekend, using strings)
  const ranges = getAvailableRangesFromSchedule(
    schedule,
    '2025-01-11',
    '2025-01-14',
  )

  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-01-13T09:00",
        "to": "2025-01-13T17:00",
      },
      {
        "from": "2025-01-14T09:00",
        "to": "2025-01-14T17:00",
      },
    ]
  `)
})

it('should handle multiple time ranges per day', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
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

  // Single Monday
  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-01-06'),
    sDate('2025-01-06'),
  )

  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-01-06T09:00",
        "to": "2025-01-06T12:00",
      },
      {
        "from": "2025-01-06T13:00",
        "to": "2025-01-06T17:00",
      },
    ]
  `)
})

it('should return empty array when no availability', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-------'),
        times: [],
      },
    ],
  }

  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-01-06'),
    sDate('2025-01-10'),
  )

  expect(ranges).toMatchInlineSnapshot(`[]`)
})

it('should handle date overrides', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('SMTWTFS'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
    overrides: [
      {
        from: sDate('2025-12-25'),
        to: sDate('2025-12-25'),
        // Closed on Christmas
        rules: [],
      },
    ],
  }

  // December 24-26 (includes Christmas)
  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-12-24'),
    sDate('2025-12-26'),
  )

  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-12-24T09:00",
        "to": "2025-12-24T17:00",
      },
      {
        "from": "2025-12-26T09:00",
        "to": "2025-12-26T17:00",
      },
    ]
  `)
})

it('should handle cross-midnight time ranges', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('----TFS'),
        // Thursday night to Friday morning
        times: [{ from: sTime('20:00'), to: sTime('02:00') }],
      },
    ],
  }

  // Thursday to Saturday
  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-01-09'),
    sDate('2025-01-11'),
  )

  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-01-09T20:00",
        "to": "2025-01-10T02:00",
      },
      {
        "from": "2025-01-10T20:00",
        "to": "2025-01-11T02:00",
      },
      {
        "from": "2025-01-11T20:00",
        "to": "2025-01-12T02:00",
      },
    ]
  `)
})

it('should handle single day range', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-01-06'),
    sDate('2025-01-06'),
  )

  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-01-06T09:00",
        "to": "2025-01-06T17:00",
      },
    ]
  `)
})

it('should handle overrides with different hours', () => {
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
        // December has different hours
        rules: [
          {
            weekdays: sWeekdays('-MTWTF-'),
            times: [{ from: sTime('10:00'), to: sTime('16:00') }],
          },
          {
            weekdays: sWeekdays('S-----S'),
            times: [{ from: sTime('12:00'), to: sTime('15:00') }],
          },
        ],
      },
    ],
  }

  // First week of December (includes weekend)
  const ranges = getAvailableRangesFromSchedule(
    schedule,
    sDate('2025-12-01'),
    sDate('2025-12-07'),
  )

  // 6 & 7 are Sat/Sun
  expect(ranges).toMatchInlineSnapshot(`
    [
      {
        "from": "2025-12-01T10:00",
        "to": "2025-12-01T16:00",
      },
      {
        "from": "2025-12-02T10:00",
        "to": "2025-12-02T16:00",
      },
      {
        "from": "2025-12-03T10:00",
        "to": "2025-12-03T16:00",
      },
      {
        "from": "2025-12-04T10:00",
        "to": "2025-12-04T16:00",
      },
      {
        "from": "2025-12-05T10:00",
        "to": "2025-12-05T16:00",
      },
      {
        "from": "2025-12-06T12:00",
        "to": "2025-12-06T15:00",
      },
      {
        "from": "2025-12-07T12:00",
        "to": "2025-12-07T15:00",
      },
    ]
  `)
})
