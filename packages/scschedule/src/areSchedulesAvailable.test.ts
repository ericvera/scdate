import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { areSchedulesAvailable } from './areSchedulesAvailable.js'
import { AlwaysAvailableSchedule } from './constants.js'
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
      to: sTime('00:00'),
    },
  ],
}

it('should return true when all schedules are available', () => {
  // Monday at noon - both schedules available
  const timestamp = sTimestamp('2025-01-06T12:00')

  expect(
    areSchedulesAvailable([monToSatSchedule, mondaysOnlySchedule], timestamp),
  ).toBe(true)
})

it('should return false when any schedule is unavailable', () => {
  // Tuesday at noon - first schedule available, second is Mondays only
  const timestamp = sTimestamp('2025-01-07T12:00')

  expect(
    areSchedulesAvailable([monToSatSchedule, mondaysOnlySchedule], timestamp),
  ).toBe(false)
})

it('should return false when all schedules are unavailable', () => {
  // Tuesday at 08:00 - before 11:00 and not a Monday
  const timestamp = sTimestamp('2025-01-07T08:00')

  expect(
    areSchedulesAvailable([monToSatSchedule, mondaysOnlySchedule], timestamp),
  ).toBe(false)
})

it('should treat the always available schedule as the identity', () => {
  // Monday at noon - within the restricted schedule's hours
  expect(
    areSchedulesAvailable(
      [monToSatSchedule, AlwaysAvailableSchedule],
      sTimestamp('2025-01-06T12:00'),
    ),
  ).toBe(true)

  // Monday at 08:00 - outside the restricted schedule's hours
  expect(
    areSchedulesAvailable(
      [monToSatSchedule, AlwaysAvailableSchedule],
      sTimestamp('2025-01-06T08:00'),
    ),
  ).toBe(false)
})

it('should return true for an empty array of schedules', () => {
  expect(areSchedulesAvailable([], sTimestamp('2025-01-06T12:00'))).toBe(true)
})
