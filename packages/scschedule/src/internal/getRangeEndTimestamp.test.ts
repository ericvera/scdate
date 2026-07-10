import { sDate, sTime } from 'scdate'
import { expect, it } from 'vitest'
import { getRangeEndTimestamp } from './getRangeEndTimestamp.js'

it('returns a same-day timestamp for a normal range', () => {
  const result = getRangeEndTimestamp(sDate('2025-01-06'), {
    from: sTime('09:00'),
    to: sTime('17:00'),
  })

  expect(result).toMatchInlineSnapshot(`"2025-01-06T17:00"`)
})

it('returns a next-day timestamp for a cross-midnight range', () => {
  const result = getRangeEndTimestamp(sDate('2025-01-06'), {
    from: sTime('22:00'),
    to: sTime('02:00'),
  })

  expect(result).toMatchInlineSnapshot(`"2025-01-07T02:00"`)
})

it('returns the next-day midnight for a range ending at 00:00', () => {
  const result = getRangeEndTimestamp(sDate('2025-01-06'), {
    from: sTime('22:00'),
    to: sTime('00:00'),
  })

  expect(result).toMatchInlineSnapshot(`"2025-01-07T00:00"`)
})

it('returns the next-day midnight for a full-day 00:00-00:00 range', () => {
  const result = getRangeEndTimestamp(sDate('2025-01-06'), {
    from: sTime('00:00'),
    to: sTime('00:00'),
  })

  expect(result).toMatchInlineSnapshot(`"2025-01-07T00:00"`)
})

it('returns a next-day timestamp for a 24-hour wrap (from equal to to)', () => {
  const result = getRangeEndTimestamp(sDate('2025-01-06'), {
    from: sTime('09:00'),
    to: sTime('09:00'),
  })

  expect(result).toMatchInlineSnapshot(`"2025-01-07T09:00"`)
})
