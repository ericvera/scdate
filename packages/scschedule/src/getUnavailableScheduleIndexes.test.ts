import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { getUnavailableScheduleIndexes } from './getUnavailableScheduleIndexes.js'
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

it('should return an empty array when all schedules are available', () => {
  // Monday at noon - both schedules available
  const result = getUnavailableScheduleIndexes(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-06T12:00'),
  )

  expect(result).toEqual([])
})

it('should return the index of the single blocking schedule', () => {
  // Tuesday at noon - first schedule available, second is Mondays only
  const result = getUnavailableScheduleIndexes(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
  )

  expect(result).toEqual([1])
})

it('should return every blocking schedule index', () => {
  // Tuesday at 08:00 - before 11:00 and not a Monday
  const result = getUnavailableScheduleIndexes(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-07T08:00'),
  )

  expect(result).toEqual([0, 1])
})

it('should return an empty array for an empty array of schedules', () => {
  expect(
    getUnavailableScheduleIndexes([], sTimestamp('2025-01-06T12:00')),
  ).toEqual([])
})
