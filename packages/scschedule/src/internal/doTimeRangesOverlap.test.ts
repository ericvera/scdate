import { sTime } from 'scdate'
import { expect, it } from 'vitest'
import type { TimeRange } from './types.js'
import { doTimeRangesOverlap } from './doTimeRangesOverlap.js'

it('should return false for non-overlapping same-day ranges', () => {
  const range1: TimeRange = { from: sTime('09:00'), to: sTime('12:00') }
  const range2: TimeRange = { from: sTime('14:00'), to: sTime('17:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(false)
})

it('should return true for overlapping same-day ranges', () => {
  const range1: TimeRange = { from: sTime('09:00'), to: sTime('14:00') }
  const range2: TimeRange = { from: sTime('12:00'), to: sTime('17:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(true)
})

it('should return true for identical ranges', () => {
  const range1: TimeRange = { from: sTime('09:00'), to: sTime('17:00') }
  const range2: TimeRange = { from: sTime('09:00'), to: sTime('17:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(true)
})

it('should return true when one range contains another', () => {
  const range1: TimeRange = { from: sTime('09:00'), to: sTime('17:00') }
  const range2: TimeRange = { from: sTime('11:00'), to: sTime('13:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(true)
})

it('should return true for ranges sharing a boundary', () => {
  const range1: TimeRange = { from: sTime('09:00'), to: sTime('12:00') }
  const range2: TimeRange = { from: sTime('12:00'), to: sTime('17:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(true)
})

it('should return false when cross-midnight range does not overlap with same-day early morning range', () => {
  const range1: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const range2: TimeRange = { from: sTime('01:00'), to: sTime('05:00') }
  // range1: Thu 22:00 - Fri 02:00 (cross-midnight)
  // range2: Thu 01:00 - Thu 05:00 (same-day, early morning)
  // These do NOT overlap
  expect(doTimeRangesOverlap(range1, range2)).toBe(false)
})

it('should handle cross-midnight ranges that do not overlap', () => {
  const range1: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const range2: TimeRange = { from: sTime('10:00'), to: sTime('14:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(false)
})

it('should handle two cross-midnight ranges that overlap', () => {
  const range1: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const range2: TimeRange = { from: sTime('23:00'), to: sTime('01:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(true)
})

it('should handle cross-midnight range overlapping with same-day range in evening', () => {
  const range1: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const range2: TimeRange = { from: sTime('20:00'), to: sTime('23:00') }

  expect(doTimeRangesOverlap(range1, range2)).toBe(true)
})

it('should return false when cross-midnight range does not overlap with same-day midnight range', () => {
  const range1: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const range2: TimeRange = { from: sTime('00:00'), to: sTime('03:00') }
  // range1: Thu 22:00 - Fri 02:00 (cross-midnight)
  // range2: Thu 00:00 - Thu 03:00 (same-day, starting at midnight)
  // These do NOT overlap
  expect(doTimeRangesOverlap(range1, range2)).toBe(false)
})

it('should return false when cross-midnight range does not overlap with same-day early morning range', () => {
  const range1: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const range2: TimeRange = { from: sTime('01:00'), to: sTime('03:00') }
  // range1: Thu 22:00 - Fri 02:00 (cross-midnight)
  // range2: Thu 01:00 - Thu 03:00 (same-day, early morning)
  // These do NOT overlap in real time
  expect(doTimeRangesOverlap(range1, range2)).toBe(false)
})
