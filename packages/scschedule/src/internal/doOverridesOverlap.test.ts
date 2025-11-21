import { sDate } from 'scdate'
import { expect, it } from 'vitest'
import type { OverrideScheduleRule } from '../types.js'
import { doOverridesOverlap } from './doOverridesOverlap.js'

it('should return false for non-overlapping overrides', () => {
  const override1: OverrideScheduleRule = {
    from: '2025-12-01',
    to: sDate('2025-12-10'),
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: sDate('2025-12-15'),
    to: '2025-12-25',
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(false)
})

it('should return true for overlapping overrides', () => {
  const override1: OverrideScheduleRule = {
    from: sDate('2025-12-01'),
    to: '2025-12-20',
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: '2025-12-15',
    to: sDate('2025-12-31'),
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(true)
})

it('should return true for identical date ranges', () => {
  const override1: OverrideScheduleRule = {
    from: '2025-12-25',
    to: '2025-12-25',
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: sDate('2025-12-25'),
    to: sDate('2025-12-25'),
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(true)
})

it('should return true for adjacent date ranges', () => {
  const override1: OverrideScheduleRule = {
    from: sDate('2025-12-01'),
    to: sDate('2025-12-15'),
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: '2025-12-15',
    to: '2025-12-31',
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(true)
})

it('should return true when one range contains another', () => {
  const override1: OverrideScheduleRule = {
    from: '2025-12-01',
    to: '2025-12-31',
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: sDate('2025-12-10'),
    to: sDate('2025-12-20'),
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(true)
})

it('should return false when one override is indefinite', () => {
  const override1: OverrideScheduleRule = {
    from: '2025-12-01',
    to: sDate('2025-12-31'),
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: sDate('2025-12-15'),
    // no 'to' - indefinite
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(false)
})

it('should return false when both overrides are indefinite', () => {
  const override1: OverrideScheduleRule = {
    from: sDate('2025-12-01'),
    rules: [],
  }
  const override2: OverrideScheduleRule = {
    from: '2026-01-01',
    rules: [],
  }

  expect(doOverridesOverlap(override1, override2)).toBe(false)
})
