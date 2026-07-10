import { sTime, sTimestamp, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { getAvailabilityRangeEnd } from './getAvailabilityRangeEnd.js'

it('returns the end of the containing range', () => {
  // Mon-Fri 09:00-17:00
  const schedule: Schedule = {
    weekly: [
      {
        weekdays: sWeekdays('-MTWTF-'),
        from: sTime('09:00'),
        to: sTime('17:00'),
      },
    ],
  }

  // Tuesday at 10:00
  const result = getAvailabilityRangeEnd(
    schedule,
    sTimestamp('2025-01-07T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`"2025-01-07T17:00"`)
})

it('stops at a gap between ranges', () => {
  const schedule: Schedule = {
    weekly: [
      { weekdays: sWeekdays('-M-----'), from: '09:00', to: '12:00' },
      { weekdays: sWeekdays('-M-----'), from: '13:00', to: '17:00' },
    ],
  }

  // Monday at 10:00 - availability ends at the lunch gap
  const result = getAvailabilityRangeEnd(
    schedule,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`"2025-01-06T12:00"`)
})

it('chains adjacent ranges into one contiguous period', () => {
  const schedule: Schedule = {
    weekly: [
      { weekdays: sWeekdays('-M-----'), from: '09:00', to: '12:00' },
      { weekdays: sWeekdays('-M-----'), from: '12:00', to: '17:00' },
    ],
  }

  // Monday at 10:00 - the shared 12:00 boundary does not end availability
  const result = getAvailabilityRangeEnd(
    schedule,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`"2025-01-06T17:00"`)
})

it('chains availability across days via cross-midnight ranges', () => {
  // Thursday 20:00-02:00 chains into Friday 02:00-10:00
  const schedule: Schedule = {
    weekly: [
      { weekdays: sWeekdays('----T--'), from: '20:00', to: '02:00' },
      { weekdays: sWeekdays('-----F-'), from: '02:00', to: '10:00' },
    ],
  }

  // Thursday at 21:00
  const result = getAvailabilityRangeEnd(
    schedule,
    sTimestamp('2025-01-09T21:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`"2025-01-10T10:00"`)
})

it('ends spillover at the previous day rule boundary', () => {
  // Thu-Sat 22:00-02:00
  const schedule: Schedule = {
    weekly: [{ weekdays: sWeekdays('----TFS'), from: '22:00', to: '02:00' }],
  }

  // Friday at 01:00 - inside Thursday's spillover
  const result = getAvailabilityRangeEnd(
    schedule,
    sTimestamp('2025-01-10T01:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`"2025-01-10T02:00"`)
})

it('ends at midnight of an override closure day for weekly true', () => {
  const schedule: Schedule = {
    weekly: true,
    overrides: [{ from: '2025-01-10', to: '2025-01-10', rules: [] }],
  }

  // Monday at 10:00
  const result = getAvailabilityRangeEnd(
    schedule,
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toMatchInlineSnapshot(`"2025-01-10T00:00"`)
})

it('returns undefined when availability does not end within the window', () => {
  const result = getAvailabilityRangeEnd(
    { weekly: true },
    sTimestamp('2025-01-06T10:00'),
    30,
  )

  expect(result).toBeUndefined()
})
