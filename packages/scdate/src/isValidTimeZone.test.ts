import { expect, it } from 'vitest'
import { isValidTimeZone } from './isValidTimeZone.js'

it.each([
  'America/Puerto_Rico',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
])('should return true for valid time zone: %s', (timeZone) => {
  expect(isValidTimeZone(timeZone)).toBe(true)
})

it.each([
  'Invalid/Timezone',
  'America/Not_A_Place',
  'Random String',
  '',
  // Abbreviations aren't valid IANA identifiers
  'EST',
  'PST',
  'UTC',
])('should return false for invalid time zone: %s', (timeZone) => {
  expect(isValidTimeZone(timeZone)).toBe(false)
})
