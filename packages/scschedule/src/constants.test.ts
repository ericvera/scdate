import { sTimestamp } from 'scdate'
import { expect, it } from 'vitest'
import { AlwaysAvailableSchedule, NeverAvailableSchedule } from './constants.js'
import { isScheduleAvailable } from './isScheduleAvailable.js'

it('should always be available for AlwaysAvailableSchedule', () => {
  expect(
    isScheduleAvailable(
      AlwaysAvailableSchedule,
      sTimestamp('2025-01-06T12:00'),
    ),
  ).toBe(true)
})

it('should never be available for NeverAvailableSchedule', () => {
  expect(
    isScheduleAvailable(NeverAvailableSchedule, sTimestamp('2025-01-06T12:00')),
  ).toBe(false)
})

it('should freeze the schedule constants', () => {
  expect(Object.isFrozen(AlwaysAvailableSchedule)).toBe(true)
  expect(Object.isFrozen(NeverAvailableSchedule)).toBe(true)
  expect(Object.isFrozen(NeverAvailableSchedule.weekly)).toBe(true)
})
