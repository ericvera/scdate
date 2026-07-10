import { expect, it } from 'vitest'
import { doMinuteIntervalsOverlap } from './doMinuteIntervalsOverlap.js'

it('returns true for overlapping intervals', () => {
  expect(
    doMinuteIntervalsOverlap({ from: 540, to: 1020 }, { from: 600, to: 1080 }),
  ).toBe(true)
})

it('returns true when one interval contains the other', () => {
  expect(
    doMinuteIntervalsOverlap({ from: 0, to: 1440 }, { from: 600, to: 660 }),
  ).toBe(true)
})

it('returns false for disjoint intervals', () => {
  expect(
    doMinuteIntervalsOverlap({ from: 540, to: 720 }, { from: 780, to: 1020 }),
  ).toBe(false)
})

it('returns false for adjacent intervals (touching boundaries)', () => {
  expect(
    doMinuteIntervalsOverlap({ from: 540, to: 720 }, { from: 720, to: 1020 }),
  ).toBe(false)
})
