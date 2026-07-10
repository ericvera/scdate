import { sTime } from 'scdate'
import { expect, it } from 'vitest'
import type { TimeRange } from './types.js'
import { isTimeInTimeRange } from './isTimeInTimeRange.js'

it('should return true for time within same-day range', () => {
  const range: TimeRange = { from: sTime('09:00'), to: sTime('17:00') }

  expect(isTimeInTimeRange('12:00', range, true)).toBe(true)
})

it('should return false for time before same-day range', () => {
  const range: TimeRange = { from: '09:00', to: '17:00' }

  expect(isTimeInTimeRange('08:00', range, true)).toBe(false)
})

it('should return false for time after same-day range', () => {
  const range: TimeRange = { from: '09:00', to: '17:00' }

  expect(isTimeInTimeRange('18:00', range, true)).toBe(false)
})

it('should return true for time at start boundary', () => {
  const range: TimeRange = { from: '09:00', to: sTime('17:00') }

  expect(isTimeInTimeRange(sTime('09:00'), range, true)).toBe(true)
})

it('should return false for time at end boundary (exclusive)', () => {
  const range: TimeRange = { from: '09:00', to: sTime('17:00') }

  expect(isTimeInTimeRange(sTime('17:00'), range, true)).toBe(false)
})

it('should return true for the last minute before the end boundary', () => {
  const range: TimeRange = { from: '09:00', to: sTime('17:00') }

  expect(isTimeInTimeRange(sTime('16:59'), range, true)).toBe(true)
})

it('should treat a to of 00:00 as end of day without spillover', () => {
  const range: TimeRange = { from: '22:00', to: sTime('00:00') }

  expect(isTimeInTimeRange(sTime('23:59'), range, true)).toBe(true)
  expect(isTimeInTimeRange(sTime('00:00'), range, false)).toBe(false)
})

it('should treat from equal to to as a full 24 hours', () => {
  const range: TimeRange = { from: '09:00', to: sTime('09:00') }

  // Same-day portion: 09:00 to end of day
  expect(isTimeInTimeRange(sTime('09:00'), range, true)).toBe(true)
  expect(isTimeInTimeRange(sTime('23:59'), range, true)).toBe(true)
  expect(isTimeInTimeRange(sTime('08:59'), range, true)).toBe(false)

  // Next-day portion: midnight up to (but not including) 09:00
  expect(isTimeInTimeRange(sTime('00:00'), range, false)).toBe(true)
  expect(isTimeInTimeRange(sTime('08:59'), range, false)).toBe(true)
  expect(isTimeInTimeRange(sTime('09:00'), range, false)).toBe(false)
})

it('should treat 00:00-00:00 as a full day without spillover', () => {
  const range: TimeRange = { from: '00:00', to: sTime('00:00') }

  expect(isTimeInTimeRange(sTime('00:00'), range, true)).toBe(true)
  expect(isTimeInTimeRange(sTime('23:59'), range, true)).toBe(true)
  expect(isTimeInTimeRange(sTime('12:00'), range, false)).toBe(false)
})

it('should return true for time in middle of cross-midnight range same-day portion', () => {
  const range: TimeRange = { from: '22:00', to: sTime('02:00') }

  expect(isTimeInTimeRange(sTime('23:00'), range, true)).toBe(true)
})

it('should return true for time at start of cross-midnight range same-day portion', () => {
  const range: TimeRange = { from: '22:00', to: sTime('02:00') }

  expect(isTimeInTimeRange('22:00', range, true)).toBe(true)
})

it('should return false for time before cross-midnight range same-day portion', () => {
  const range: TimeRange = { from: '22:00', to: sTime('02:00') }

  expect(isTimeInTimeRange(sTime('21:00'), range, true)).toBe(false)
})

it('should return true for time in middle of cross-midnight range next-day portion', () => {
  const range: TimeRange = { from: sTime('22:00'), to: '02:00' }

  expect(isTimeInTimeRange('01:00', range, false)).toBe(true)
})

it('should return true for time at start of cross-midnight range next-day portion', () => {
  const range: TimeRange = { from: sTime('22:00'), to: '02:00' }

  expect(isTimeInTimeRange(sTime('00:00'), range, false)).toBe(true)
})

it('should return false for time at end of cross-midnight range next-day portion (exclusive)', () => {
  const range: TimeRange = { from: sTime('22:00'), to: '02:00' }

  expect(isTimeInTimeRange('02:00', range, false)).toBe(false)
})

it('should return true for the last minute of cross-midnight range next-day portion', () => {
  const range: TimeRange = { from: sTime('22:00'), to: '02:00' }

  expect(isTimeInTimeRange('01:59', range, false)).toBe(true)
})

it('should return false for time after cross-midnight range next-day portion', () => {
  const range: TimeRange = { from: sTime('22:00'), to: '02:00' }

  expect(isTimeInTimeRange(sTime('03:00'), range, false)).toBe(false)
})

it('should return false when checking next day portion for same-day range', () => {
  const range: TimeRange = { from: '09:00', to: '17:00' }

  expect(isTimeInTimeRange(sTime('12:00'), range, false)).toBe(false)
})

it('should return false when checking same day portion for next-day spillover time', () => {
  const range: TimeRange = { from: sTime('22:00'), to: '02:00' }

  expect(isTimeInTimeRange(sTime('01:00'), range, true)).toBe(false)
})
