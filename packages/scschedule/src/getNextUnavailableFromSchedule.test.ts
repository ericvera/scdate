import { sDate, sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { getNextUnavailableFromSchedule } from './getNextUnavailableFromSchedule.js'
import type { Schedule } from './types.js'

it('should return the same timestamp if already unavailable', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  // Tuesday at 8:00 AM - before opening, already unavailable
  const timestamp = sTimestamp('2025-01-07T08:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T08:00"`)
})

it('should return the next unavailable time on the same day', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: '-MTWTF-',
        times: [{ from: '09:00', to: '17:00' }],
      },
    ],
  }

  // Tuesday at 10:00 AM - during business hours
  // Should return 5:01 PM (first minute after closing)
  const timestamp = '2025-01-07T10:00'
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T17:01"`)
})

it('should find unavailability between time ranges', () => {
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

  // Tuesday at 10:00 AM - should return 12:01 PM (lunch break)
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T12:01"`)
})

it('should find the next unavailable day when currently available', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  // Friday at 4:00 PM - should return Friday 5:01 PM
  const timestamp = sTimestamp('2025-01-10T16:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-10T17:01"`)
})

it('should handle schedules with near 24/7 availability', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: 'SMTWTFS',
        times: [{ from: '00:00', to: sTime('23:58') }],
      },
    ],
  }

  // Nearly always available - should find unavailability at 23:59
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T23:59"`)
})

it('should handle schedule that results in next unavailable being the next day', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: 'SMTWTFS',
        times: [{ from: '02:00', to: sTime('23:59') }],
      },
    ],
  }

  // Should find unavailability at 00:00 of the next day
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-08T00:00"`)
})

it('should handle overrides that create unavailability', () => {
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

  // December 24th at 10:00 AM - should return December 24th 5:01 PM
  // (before the Christmas closure)
  const timestamp = sTimestamp('2025-12-24T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-12-24T17:01"`)
})

it('should handle cross-midnight unavailability', () => {
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

  // Thursday at 11:00 PM - available
  // Should return Friday 2:01 AM (after shift ends)
  const timestamp = sTimestamp('2025-01-09T23:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-10T02:01"`)
})

it('should return unavailable weekday', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        times: [{ from: sTime('09:00'), to: sTime('17:00') }],
      },
    ],
  }

  // Friday at 4:00 PM - should return Friday 5:01 PM,
  // NOT Saturday (which is also unavailable)
  const timestamp = sTimestamp('2025-01-10T16:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-10T17:01"`)
})

it('should handle indefinite overrides', () => {
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
        from: sDate('2026-01-01'),
        // Closed indefinitely starting 2026
        rules: [],
      },
    ],
  }

  // December 31st, 2025 at 10:00 AM - should return 5:01 PM same day
  const timestamp = sTimestamp('2025-12-31T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-12-31T17:01"`)
})

it('should return undefined when weekly is true and no overrides', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: true,
  }

  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toBeUndefined()
})

it('should find override closure when weekly is true', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: true,
    overrides: [
      {
        from: sDate('2025-01-10'),
        to: sDate('2025-01-10'),
        rules: [],
      },
    ],
  }

  // Available now, override closure starts on Jan 10
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-10T00:00"`)
})

it('should find unavailability in override with partial rules when weekly is true', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: true,
    overrides: [
      {
        from: sDate('2025-01-10'),
        to: sDate('2025-01-10'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            times: [{ from: sTime('00:00'), to: sTime('17:00') }],
          },
        ],
      },
    ],
  }

  // weekly: true, override on Jan 10 restricts to 00:00-17:00
  // Should find 17:01, not skip the day because 00:00 is available
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-10T17:01"`)
})

it('should return undefined when override is beyond maxDaysToSearch', () => {
  const schedule: Schedule = {
    timezone: 'America/Puerto_Rico',
    weekly: true,
    overrides: [
      {
        from: sDate('2025-02-10'),
        to: sDate('2025-02-10'),
        rules: [],
      },
    ],
  }

  // Override is 34 days away, but maxDaysToSearch is 30
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextUnavailableFromSchedule(schedule, timestamp, 30)
  expect(result).toBeUndefined()
})
