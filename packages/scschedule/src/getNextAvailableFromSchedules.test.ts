import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { AlwaysAvailableSchedule } from './constants.js'
import { getNextAvailableFromSchedules } from './getNextAvailableFromSchedules.js'
import type { Schedule } from './types.js'

// Mon-Sat 11:00-22:00
const monToSatSchedule: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'),
      from: sTime('11:00'),
      to: sTime('22:00'),
    },
  ],
}

// Mondays only, all day
const mondaysOnlySchedule: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-M-----'),
      from: sTime('00:00'),
      to: sTime('23:59'),
    },
  ],
}

it('should return the same timestamp when all schedules are available', () => {
  // Monday at noon - both schedules available
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T12:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([])
})

it('should find the next time both schedules overlap and report the blocking schedule', () => {
  // Tuesday at noon - first schedule available, second is Mondays only
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
    30,
  )

  // Next Monday when the first schedule's range starts
  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-13T11:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should report all blocking schedules when several are unavailable', () => {
  // Mondays 09:00-12:00
  const morningSchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('-M-----'), from: '09:00', to: '12:00' }],
  }

  // Mondays 11:00-17:00
  const lateMorningSchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('-M-----'), from: '11:00', to: '17:00' }],
  }

  // Monday at 08:00 - before both ranges start
  const result = getNextAvailableFromSchedules(
    [morningSchedule, lateMorningSchedule],
    sTimestamp('2025-01-06T08:00'),
    30,
  )

  // Intersection starts when the later schedule opens
  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T11:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([0, 1])
})

it('should handle a schedule closed for the rest of the day via an override', () => {
  const closedTodaySchedule: Schedule = {
    ...AlwaysAvailableSchedule,
    overrides: [{ from: '2025-01-06', to: '2025-01-06', rules: [] }],
  }

  // Monday at noon - first schedule available, second closed for the day
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, closedTodaySchedule],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  // Tuesday when the first schedule's range starts
  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-07T11:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should handle a schedule that becomes available starting on a future date', () => {
  const availableStartingFriday: Schedule = {
    ...AlwaysAvailableSchedule,
    overrides: [{ from: '2025-01-06', to: '2025-01-09', rules: [] }],
  }

  // Monday at noon - second schedule closed until Friday Jan 10
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, availableStartingFriday],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  // Friday when the first schedule's range starts
  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-10T11:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should support three layered schedules', () => {
  // Mon-Fri 11:00-14:00
  const weekdayMiddaySchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('-MTWTF-'), from: '11:00', to: '14:00' }],
  }

  // Saturday at noon - first schedule available, other two blocked
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, weekdayMiddaySchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-11T12:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-13T11:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([1, 2])
})

it('should return undefined when the schedules never overlap in the window', () => {
  // Sundays only, all day
  const sundaysOnlySchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('S------'), from: '00:00', to: '23:59' }],
  }

  // First schedule is closed on Sundays - no intersection
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, sundaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
    30,
  )

  expect(result.timestamp).toBeUndefined()
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should return undefined when the next overlap is beyond the search window', () => {
  // Tuesday at noon - next Monday is 6 days away, window is 3 days
  const result = getNextAvailableFromSchedules(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
    3,
  )

  expect(result.timestamp).toBeUndefined()
  expect(result.unavailableScheduleIndexes).toEqual([1])
})

it('should detect availability within cross-midnight spillover', () => {
  // Thu-Sat 20:00-02:00 (cross-midnight)
  const lateNightSchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('----TFS'), from: '20:00', to: '02:00' }],
  }

  // Friday at 01:00 - inside Thursday's spillover
  const result = getNextAvailableFromSchedules(
    [lateNightSchedule, AlwaysAvailableSchedule],
    sTimestamp('2025-01-10T01:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-10T01:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([])
})

it('should treat an empty array of schedules as always available', () => {
  const result = getNextAvailableFromSchedules(
    [],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  expect(result.timestamp).toMatchInlineSnapshot(`"2025-01-06T12:00"`)
  expect(result.unavailableScheduleIndexes).toEqual([])
})
