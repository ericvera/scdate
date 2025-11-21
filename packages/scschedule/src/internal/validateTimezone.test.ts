import { sTime, sWeekdays } from 'scdate'
import { expect, it } from 'vitest'
import type { Schedule } from '../types.js'
import { validateTimezone } from './validateTimezone.js'

const createSchedule = (timezone: string): Schedule => ({
  timezone,
  weekly: [
    {
      weekdays: sWeekdays('-MTWTF-'),
      times: [{ from: sTime('09:00'), to: sTime('17:00') }],
    },
  ],
})

it('should return empty array for valid timezone', () => {
  const schedule = createSchedule('America/Puerto_Rico')
  const errors = validateTimezone(schedule)

  expect(errors).toMatchInlineSnapshot(`[]`)
})

it('should return error for invalid timezone', () => {
  const schedule = createSchedule('Invalid/Timezone')
  const errors = validateTimezone(schedule)

  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "invalid-timezone",
        "timezone": "Invalid/Timezone",
      },
    ]
  `)
})

it('should return error for empty timezone', () => {
  const schedule = createSchedule('')
  const errors = validateTimezone(schedule)

  expect(errors).toMatchInlineSnapshot(`
    [
      {
        "issue": "invalid-timezone",
        "timezone": "",
      },
    ]
  `)
})

it.each([
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Pacific/Auckland',
  'Australia/Sydney',
])('should return empty array for valid timezone: %s', (timezone) => {
  const schedule = createSchedule(timezone)
  const errors = validateTimezone(schedule)

  expect(errors).toEqual([])
})
