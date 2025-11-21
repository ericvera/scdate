import { expect, it } from 'vitest'
import { isValidTimezone } from './isValidTimezone.js'

it.each([
  'America/Puerto_Rico',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
])('should return true for valid timezone: %s', (timezone) => {
  expect(isValidTimezone(timezone)).toBe(true)
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
])('should return false for invalid timezone: %s', (timezone) => {
  expect(isValidTimezone(timezone)).toBe(false)
})
