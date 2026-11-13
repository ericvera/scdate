import { expect, it } from 'vitest'
import { isValidTimeZone } from './isValidTimeZone.js'

it.each([
  'America/Puerto_Rico',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
  // UTC, old aliases and lowercase names are absent from
  // Intl.supportedValuesOf('timeZone') but accepted by Intl.DateTimeFormat
  'UTC',
  'Etc/UTC',
  'GMT',
  'US/Eastern',
  'Asia/Kolkata',
  'america/puerto_rico',
  'EST',
  'PST',
])('should return true for valid time zone: %s', (timeZone) => {
  expect(isValidTimeZone(timeZone)).toBe(true)
})

it.each([
  'Invalid/Timezone',
  'America/Not_A_Place',
  'Random String',
  '',
  'Invalid/Zone',
])('should return false for invalid time zone: %s', (timeZone) => {
  expect(isValidTimeZone(timeZone)).toBe(false)
})

it('should return false for a non-string', () => {
  expect(isValidTimeZone(undefined as unknown as string)).toBe(false)
})
