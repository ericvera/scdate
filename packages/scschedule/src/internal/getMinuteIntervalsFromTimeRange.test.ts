import { sTime } from 'scdate'
import { expect, it } from 'vitest'
import { getMinuteIntervalsFromTimeRange } from './getMinuteIntervalsFromTimeRange.js'

it('returns a single same-day interval for a normal range', () => {
  expect(
    getMinuteIntervalsFromTimeRange({ from: sTime('09:00'), to: '17:00' }),
  ).toEqual({ sameDay: { from: 540, to: 1020 } })
})

it('splits a cross-midnight range into same-day and next-day intervals', () => {
  expect(
    getMinuteIntervalsFromTimeRange({ from: '22:00', to: sTime('02:00') }),
  ).toEqual({
    sameDay: { from: 1320, to: 1440 },
    nextDay: { from: 0, to: 120 },
  })
})

it('treats a to of 00:00 as end of day without spillover', () => {
  expect(
    getMinuteIntervalsFromTimeRange({ from: sTime('22:00'), to: '00:00' }),
  ).toEqual({ sameDay: { from: 1320, to: 1440 } })
})

it('treats 00:00-00:00 as a full day without spillover', () => {
  expect(
    getMinuteIntervalsFromTimeRange({ from: '00:00', to: sTime('00:00') }),
  ).toEqual({ sameDay: { from: 0, to: 1440 } })
})

it('treats from equal to to as a full 24 hours', () => {
  expect(
    getMinuteIntervalsFromTimeRange({ from: sTime('09:00'), to: '09:00' }),
  ).toEqual({
    sameDay: { from: 540, to: 1440 },
    nextDay: { from: 0, to: 540 },
  })
})
