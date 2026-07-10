import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { AlwaysAvailableSchedule } from './constants.js'
import { getNextUnavailableFromSchedules } from './getNextUnavailableFromSchedules.js'
import type { Schedule } from './types.js'

const TestTimeZone = 'America/Puerto_Rico'

// Mon-Fri 09:00-17:00
const weekdaySchedule: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      from: sTime('09:00'),
      to: sTime('17:00'),
    },
  ],
}

// Mon-Fri 09:00-12:00 (mornings only)
const morningsOnlySchedule: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      from: sTime('09:00'),
      to: sTime('12:00'),
    },
  ],
}

it('should return the earliest end of availability and the schedule that ends it', () => {
  // Monday at 10:00 - the mornings-only schedule ends at noon, before the
  // other schedule ends at 17:00
  const result = getNextUnavailableFromSchedules(
    [weekdaySchedule, morningsOnlySchedule],
    TestTimeZone,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T12:01"`)
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should return the shorter schedule end when paired with weekly true', () => {
  // Monday at 10:00 - the weekday schedule's range ends first
  const result = getNextUnavailableFromSchedules(
    [weekdaySchedule, AlwaysAvailableSchedule],
    TestTimeZone,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T17:01"`)
  expect(result.unavailableScheduleIndexes).toEqual([0])
})

it('should report all schedules that end availability at the same time', () => {
  // Monday at 10:00 - both schedules end at 17:00
  const result = getNextUnavailableFromSchedules(
    [weekdaySchedule, weekdaySchedule],
    TestTimeZone,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T17:01"`)
  expect(result.unavailableScheduleIndexes).toEqual([0, 1])
})

it('should return the same timestamp when any schedule is already unavailable', () => {
  // Monday at 12:30 - the mornings-only range has ended
  const result = getNextUnavailableFromSchedules(
    [weekdaySchedule, morningsOnlySchedule],
    TestTimeZone,
    sTimestamp('2025-01-06T12:30'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T12:30"`)
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should find an override closure in an always-available schedule', () => {
  const scheduleWithClosure: Schedule = {
    ...AlwaysAvailableSchedule,
    overrides: [{ from: '2025-01-10', to: '2025-01-10', rules: [] }],
  }

  // Monday at 10:00 - both always available except the closure on Jan 10
  const result = getNextUnavailableFromSchedules(
    [AlwaysAvailableSchedule, scheduleWithClosure],
    TestTimeZone,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-10T00:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should return an undefined timestamp when no schedule becomes unavailable in the window', () => {
  const result = getNextUnavailableFromSchedules(
    [AlwaysAvailableSchedule, AlwaysAvailableSchedule],
    TestTimeZone,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result.timestamp).toBeUndefined()
  expect(result.unavailableScheduleIndexes).toEqual([])
})

it('should return an undefined timestamp for an empty array of schedules', () => {
  const result = getNextUnavailableFromSchedules(
    [],
    TestTimeZone,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result.timestamp).toBeUndefined()
  expect(result.unavailableScheduleIndexes).toEqual([])
})
