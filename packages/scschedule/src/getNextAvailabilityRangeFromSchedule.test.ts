import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import { AlwaysAvailableSchedule, NeverAvailableSchedule } from './constants.js'
import { getNextAvailabilityRangeFromSchedule } from './getNextAvailabilityRangeFromSchedule.js'
import type { Schedule } from './types.js'

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

it('should return the containing range when already available', () => {
  // Tuesday at 10:00
  const result = getNextAvailabilityRangeFromSchedule(
    weekdaySchedule,
    sTimestamp('2025-01-07T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-07T10:00",
        "to": "2025-01-07T17:00",
      },
    }
  `)
})

it('should return the next range on the same day when before opening', () => {
  // Tuesday at 08:00
  const result = getNextAvailabilityRangeFromSchedule(
    weekdaySchedule,
    sTimestamp('2025-01-07T08:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-07T09:00",
        "to": "2025-01-07T17:00",
      },
    }
  `)
})

it('should return the next range on a later day when currently closed', () => {
  // Saturday at 10:00
  const result = getNextAvailabilityRangeFromSchedule(
    weekdaySchedule,
    sTimestamp('2025-01-11T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-13T09:00",
        "to": "2025-01-13T17:00",
      },
    }
  `)
})

it('should chain adjacent ranges into one contiguous period', () => {
  // Split shift with touching boundaries: 09:00-12:00 and 12:00-17:00
  const splitShiftSchedule: Schedule = {
    weekly: [
      { weekdays: sWeekdays('-M-----'), from: '09:00', to: '12:00' },
      { weekdays: sWeekdays('-M-----'), from: '12:00', to: '17:00' },
    ],
  }

  // Monday at 10:00 - the two ranges form one contiguous period
  const result = getNextAvailabilityRangeFromSchedule(
    splitShiftSchedule,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T10:00",
        "to": "2025-01-06T17:00",
      },
    }
  `)
})

it('should not chain ranges separated by a gap', () => {
  // Split shift with a lunch gap: 09:00-12:00 and 13:00-17:00
  const gappedSchedule: Schedule = {
    weekly: [
      { weekdays: sWeekdays('-M-----'), from: '09:00', to: '12:00' },
      { weekdays: sWeekdays('-M-----'), from: '13:00', to: '17:00' },
    ],
  }

  // Monday at 10:00 - range ends at the lunch gap
  const result = getNextAvailabilityRangeFromSchedule(
    gappedSchedule,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T10:00",
        "to": "2025-01-06T12:00",
      },
    }
  `)
})

it('should handle cross-midnight ranges including spillover', () => {
  // Thu-Sat 22:00-02:00
  const lateNightSchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('----TFS'), from: '22:00', to: '02:00' }],
  }

  // Friday at 01:00 - inside Thursday's spillover
  const result = getNextAvailabilityRangeFromSchedule(
    lateNightSchedule,
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
    }
  `)
})

it('should end at midnight for ranges with a to of 00:00', () => {
  // Mondays 22:00-00:00 (until end of day, no spillover)
  const untilMidnightSchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('-M-----'), from: '22:00', to: '00:00' }],
  }

  // Monday at 23:00
  const result = getNextAvailabilityRangeFromSchedule(
    untilMidnightSchedule,
    sTimestamp('2025-01-06T23:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T23:00",
        "to": "2025-01-07T00:00",
      },
    }
  `)
})

it('should return a full-day range for a 00:00-00:00 rule', () => {
  // Mondays all day
  const mondaysOnlySchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('-M-----'), from: '00:00', to: '00:00' }],
  }

  // Sunday at 10:00
  const result = getNextAvailabilityRangeFromSchedule(
    mondaysOnlySchedule,
    sTimestamp('2025-01-05T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-06T00:00",
        "to": "2025-01-07T00:00",
      },
    }
  `)
})

it('should return an open-ended range for an always-available schedule', () => {
  const result = getNextAvailabilityRangeFromSchedule(
    AlwaysAvailableSchedule,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T10:00",
        "to": undefined,
      },
    }
  `)
})

it('should end at midnight of an override closure day', () => {
  const scheduleWithClosure: Schedule = {
    ...AlwaysAvailableSchedule,
    overrides: [{ from: '2025-01-10', to: '2025-01-10', rules: [] }],
  }

  // Monday at 10:00 - always available until the Jan 10 closure
  const result = getNextAvailabilityRangeFromSchedule(
    scheduleWithClosure,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": true,
      "range": {
        "from": "2025-01-06T10:00",
        "to": "2025-01-10T00:00",
      },
    }
  `)
})

it('should find a range opened by an override on a closed-by-default schedule', () => {
  const popUpSchedule: Schedule = {
    ...NeverAvailableSchedule,
    overrides: [
      {
        from: '2025-01-07',
        to: '2025-01-07',
        rules: [{ weekdays: sWeekdays('SMTWTFS'), from: '10:00', to: '14:00' }],
      },
    ],
  }

  // Monday at 09:00
  const result = getNextAvailabilityRangeFromSchedule(
    popUpSchedule,
    sTimestamp('2025-01-06T09:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": {
        "from": "2025-01-07T10:00",
        "to": "2025-01-07T14:00",
      },
    }
  `)
})

it('should return an undefined range when there is no availability in the window', () => {
  // Sundays only, queried from a Monday with a 3-day window
  const sundaysOnlySchedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('S------'), from: '00:00', to: '00:00' }],
  }

  // Monday at 10:00
  const result = getNextAvailabilityRangeFromSchedule(
    sundaysOnlySchedule,
    sTimestamp('2025-01-06T10:00'),
    3,
  )

  expect(result).toMatchInlineSnapshot(`
    {
      "available": false,
      "range": undefined,
    }
  `)
})
