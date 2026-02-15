import { sDate, sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { getNextAvailableFromSchedule } from './getNextAvailableFromSchedule.js'
import type { Schedule } from './types.js'

it('should return the same timestamp if already available', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
  }

  // Tuesday at 10:00 AM - already available
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T10:00"`)
})

it('should return the next available time on the same day', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: '09:00',
        to: '17:00',
      },
    ],
  }

  // Tuesday at 8:00 AM - before opening
  const timestamp = '2025-01-07T08:00'
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T09:00"`)
})

it('should skip to the next available day when current day is closed', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
  }

  // Sunday at 10:00 AM - closed, should return Monday 9:00 AM
  const timestamp = sTimestamp('2025-01-05T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-06T09:00"`)
})

it('should handle multiple rules and return the next one', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '-MTWTF-',
        from: sTime('09:00'),
        to: '12:00',
      },
      {
        weekdays: '-MTWTF-',
        from: '13:00',
        to: sTime('17:00'),
      },
    ],
  }

  // Tuesday at 12:30 PM - during lunch, should return 1:00 PM
  const timestamp = sTimestamp('2025-01-07T12:30')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T13:00"`)
})

it('should respect date overrides that close on specific dates', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: '2025-12-25',
        to: '2025-12-25',
        // Closed on Christmas
        rules: [],
      },
    ],
  }

  // Christmas (Thursday) at 10:00 AM - should skip to Friday
  const timestamp = '2025-12-25T10:00'
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-12-26T09:00"`)
})

it('should handle indefinite overrides before override starts', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2026-01-01'),
        // Extended hours indefinitely starting 2026
        rules: [
          {
            weekdays: sWeekdays('-MTWTF-'),
            from: sTime('08:00'),
            to: sTime('18:00'),
          },
        ],
      },
    ],
  }

  // Before indefinite override - 8:30 AM should return 9:00 AM
  const before = sTimestamp('2025-12-15T08:30')
  const resultBefore = getNextAvailableFromSchedule(schedule, before, 30)
  expect(resultBefore).toMatchInlineSnapshot(`"2025-12-15T09:00"`)
})

it('should handle indefinite overrides after override starts', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2026-01-01'),
        // Extended hours indefinitely starting 2026
        rules: [
          {
            weekdays: sWeekdays('-MTWTF-'),
            from: sTime('08:00'),
            to: sTime('18:00'),
          },
        ],
      },
    ],
  }

  // After indefinite override starts - 8:30 AM is already available
  const after = sTimestamp('2026-01-15T08:30')
  const resultAfter = getNextAvailableFromSchedule(schedule, after, 30)
  expect(resultAfter).toMatchInlineSnapshot(`"2026-01-15T08:30"`)
})

it('should handle cross-midnight rules', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: '----TFS',
        // Thursday night to Friday morning
        from: '20:00',
        to: '02:00',
      },
    ],
  }

  // Thursday at 10:00 AM - should return Thursday 8:00 PM
  const timestamp = sTimestamp('2025-01-09T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-09T20:00"`)
})

it('should return undefined when no availability within search window', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-------'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2024-01-01'),
        // Closed after 2024-01-01
        rules: [],
      },
    ],
  }

  // No days are ever available
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toBeUndefined()
})

it('should find availability after a long closed period', () => {
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
    overrides: [
      {
        from: sDate('2025-01-01'),
        to: sDate('2025-01-31'),
        // Closed all of January
        rules: [],
      },
    ],
  }

  // January 15th - should skip to February 3rd (Monday)
  const timestamp = sTimestamp('2025-01-15T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-02-03T09:00"`)
})

it('should return the same timestamp immediately when weekly is true', () => {
  const schedule: Schedule = {
    weekly: true,
  }

  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T10:00"`)
})

it('should find next available after override closure when weekly is true', () => {
  const schedule: Schedule = {
    weekly: true,
    overrides: [
      {
        from: sDate('2025-01-07'),
        to: sDate('2025-01-07'),
        rules: [],
      },
    ],
  }

  // During the closure day - should find start of next day
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-08T00:00"`)
})

it('should find next available within override partial hours when weekly is true', () => {
  const schedule: Schedule = {
    weekly: true,
    overrides: [
      {
        from: sDate('2025-01-07'),
        to: sDate('2025-01-07'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('09:00'),
            to: sTime('17:00'),
          },
        ],
      },
    ],
  }

  // Override restricts Jan 7 to 09:00-17:00, at 08:00 should find 09:00
  const timestamp = sTimestamp('2025-01-07T08:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toMatchInlineSnapshot(`"2025-01-07T09:00"`)
})

it('should return undefined when availability is beyond maxDaysToSearch', () => {
  const schedule: Schedule = {
    weekly: [],
    overrides: [
      {
        from: sDate('2025-02-10'),
        to: sDate('2025-02-10'),
        rules: [
          {
            weekdays: sWeekdays('SMTWTFS'),
            from: sTime('09:00'),
            to: sTime('17:00'),
          },
        ],
      },
    ],
  }

  // weekly: [] (never available), override opens Feb 10 which is beyond 30 days
  const timestamp = sTimestamp('2025-01-07T10:00')
  const result = getNextAvailableFromSchedule(schedule, timestamp, 30)
  expect(result).toBeUndefined()
})
