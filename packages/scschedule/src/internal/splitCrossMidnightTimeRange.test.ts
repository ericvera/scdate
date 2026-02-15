import { sTime } from 'scdate'
import { expect, it } from 'vitest'
import type { TimeRange } from './types.js'
import { splitCrossMidnightTimeRange } from './splitCrossMidnightTimeRange.js'

it('should not split same-day time ranges', () => {
  const range: TimeRange = { from: sTime('09:00'), to: sTime('17:00') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "09:00",
        "to": "17:00",
      },
    ]
  `)
})

it('should split cross-midnight time ranges', () => {
  const range: TimeRange = { from: sTime('22:00'), to: sTime('02:00') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "22:00",
        "to": "23:59",
      },
      {
        "from": "00:00",
        "to": "02:00",
      },
    ]
  `)
})

it('should handle edge case starting at midnight', () => {
  const range: TimeRange = { from: sTime('00:00'), to: sTime('09:00') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "00:00",
        "to": "09:00",
      },
    ]
  `)
})

it('should handle edge case ending at 23:59', () => {
  const range: TimeRange = { from: sTime('09:00'), to: sTime('23:59') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "09:00",
        "to": "23:59",
      },
    ]
  `)
})

it('should handle late night to early morning', () => {
  const range: TimeRange = { from: sTime('23:00'), to: sTime('01:00') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "23:00",
        "to": "23:59",
      },
      {
        "from": "00:00",
        "to": "01:00",
      },
    ]
  `)
})

it('should handle ranges ending just after midnight', () => {
  const range: TimeRange = { from: sTime('22:30'), to: sTime('00:30') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "22:30",
        "to": "23:59",
      },
      {
        "from": "00:00",
        "to": "00:30",
      },
    ]
  `)
})

it('should handle edge case ending exactly at midnight', () => {
  const range: TimeRange = { from: sTime('22:00'), to: sTime('00:00') }
  const result = splitCrossMidnightTimeRange(range)

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "from": "22:00",
        "to": "23:59",
      },
      {
        "from": "00:00",
        "to": "00:00",
      },
    ]
  `)
})
