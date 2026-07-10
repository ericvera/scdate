import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { AlwaysAvailableSchedule } from './constants.js'
import { getNextAvailabilityRangeFromSchedules } from './getNextAvailabilityRangeFromSchedules.js'
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

it('should return the current range when all schedules are available', () => {
  // Monday at noon - both schedules available; the first schedule closes
  // first (22:00 vs end of day)
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T12:00",
        "to": "2025-01-06T22:00",
      },
      "unavailableScheduleIndexes": [],
    }
  `)
})

it('should find the next overlap and report the blocking schedule', () => {
  // Tuesday at noon - first schedule available, second is Mondays only
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
    30,
  )

  // Next Monday, open until the first schedule closes
  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-13T11:00",
        "to": "2025-01-13T22:00",
      },
      "unavailableScheduleIndexes": [
        1,
      ],
    }
  `)
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

  // Monday at 08:00 - before both ranges start; the intersection runs from
  // the later start to the earlier end
  const result = getNextAvailabilityRangeFromSchedules(
    [morningSchedule, lateMorningSchedule],
    sTimestamp('2025-01-06T08:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-06T11:00",
        "to": "2025-01-06T12:00",
      },
      "unavailableScheduleIndexes": [
        0,
        1,
      ],
    }
  `)
})

it('should handle a schedule closed for the rest of the day via an override', () => {
  const closedTodaySchedule: Schedule = {
    ...AlwaysAvailableSchedule,
    overrides: [{ from: '2025-01-06', to: '2025-01-06', rules: [] }],
  }

  // Monday at noon - first schedule available, second closed for the day
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, closedTodaySchedule],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  // Tuesday's full open window
  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-07T11:00",
        "to": "2025-01-07T22:00",
      },
      "unavailableScheduleIndexes": [
        1,
      ],
    }
  `)
})

it('should handle a schedule that becomes available starting on a future date', () => {
  const availableStartingFriday: Schedule = {
    ...AlwaysAvailableSchedule,
    overrides: [{ from: '2025-01-06', to: '2025-01-09', rules: [] }],
  }

  // Monday at noon - second schedule closed until Friday Jan 10
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, availableStartingFriday],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-10T11:00",
        "to": "2025-01-10T22:00",
      },
      "unavailableScheduleIndexes": [
        1,
      ],
    }
  `)
})

it('should support three layered schedules', () => {
  // Mon-Fri 11:00-14:00
  const weekdayMiddaySchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('-MTWTF-'), from: '11:00', to: '14:00' }],
  }

  // Saturday at noon - first schedule available, other two blocked; the
  // narrowest schedule bounds the range end
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, weekdayMiddaySchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-11T12:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-13T11:00",
        "to": "2025-01-13T14:00",
      },
      "unavailableScheduleIndexes": [
        1,
        2,
      ],
    }
  `)
})

it('should return an undefined range when the schedules never overlap in the window', () => {
  // Sundays only, all day
  const sundaysOnlySchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('S------'), from: '00:00', to: '00:00' }],
  }

  // First schedule is closed on Sundays - no intersection
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, sundaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": undefined,
      "unavailableScheduleIndexes": [
        1,
      ],
    }
  `)
})

it('should return an undefined range when the next overlap is beyond the search window', () => {
  // Tuesday at noon - next Monday is 6 days away, window is 3 days
  const result = getNextAvailabilityRangeFromSchedules(
    [monToSatSchedule, mondaysOnlySchedule],
    sTimestamp('2025-01-07T12:00'),
    3,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": undefined,
      "unavailableScheduleIndexes": [
        1,
      ],
    }
  `)
})

it('should detect availability within cross-midnight spillover', () => {
  // Thu-Sat 20:00-02:00 (cross-midnight)
  const lateNightSchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('----TFS'), from: '20:00', to: '02:00' }],
  }

  // Friday at 01:00 - inside Thursday's spillover, which ends at 02:00
  const result = getNextAvailabilityRangeFromSchedules(
    [lateNightSchedule, AlwaysAvailableSchedule],
    sTimestamp('2025-01-10T01:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-10T01:00",
        "to": "2025-01-10T02:00",
      },
      "unavailableScheduleIndexes": [],
    }
  `)
})

it('should return an open-ended range when no schedule closes in the window', () => {
  const result = getNextAvailabilityRangeFromSchedules(
    [AlwaysAvailableSchedule, AlwaysAvailableSchedule],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T12:00",
        "to": undefined,
      },
      "unavailableScheduleIndexes": [],
    }
  `)
})

it('should treat an empty array of schedules as always available', () => {
  const result = getNextAvailabilityRangeFromSchedules(
    [],
    sTimestamp('2025-01-06T12:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T12:00",
        "to": undefined,
      },
      "unavailableScheduleIndexes": [],
    }
  `)
})
