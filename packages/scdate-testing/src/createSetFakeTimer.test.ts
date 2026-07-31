import { getUTCMillisecondsFromTimestamp } from 'scdate'
import { afterEach, expect, it, vi } from 'vitest'
import { createSetFakeTimer } from './createSetFakeTimer.js'

interface TestGlobals {
  setTimeout: (callback: () => void, milliseconds: number) => void
}

/**
 * No tsconfig in this repo pulls in the node or DOM ambient types, so
 * `setTimeout` is read off `globalThis` through an explicit local type.
 * It is read on every call so it resolves to whichever implementation,
 * real or faked, is installed at that moment.
 */
const getTestGlobals = (): TestGlobals => globalThis as unknown as TestGlobals

const wait = (milliseconds: number): Promise<void> =>
  new Promise<void>((resolve) => {
    getTestGlobals().setTimeout(() => {
      resolve()
    }, milliseconds)
  })

afterEach(() => {
  vi.useRealTimers()
})

it('returns the same milliseconds scdate returns for the same inputs', () => {
  // The package delegates every conversion to scdate rather than
  // holding its own notion of what a wall-clock time means, so this
  // covers zone offsets, sub-hour offsets, and both daylight saving
  // edges at once. Absolute values are anchored separately below.
  const cases: [timestamp: string, timeZone: string][] = [
    ['2026-01-24T12:00', 'UTC'],
    // Accepted by scdate's conversion and treated as UTC. Inherited
    // permissiveness, pinned here rather than guarded against.
    ['2026-01-24T12:00', ''],
    ['2026-01-24T12:00', 'America/New_York'],
    ['2026-06-15T08:45', 'Asia/Tokyo'],
    ['2026-01-24T12:34', 'Australia/Eucla'],
    ['2020-02-29T23:59', 'Europe/Paris'],
    // Spring-forward gap and fall-back overlap in New York.
    ['2024-03-10T02:30', 'America/New_York'],
    ['2024-11-03T01:30', 'America/New_York'],
  ]

  for (const [timestamp, timeZone] of cases) {
    const setFakeTimer = createSetFakeTimer(timeZone)

    expect(setFakeTimer(timestamp)).toBe(
      getUTCMillisecondsFromTimestamp(timestamp, timeZone),
    )
  }
})

it('sets the clock to exactly the value it returns', () => {
  const setNewYork = createSetFakeTimer('America/New_York')

  const now = setNewYork('2026-01-24T12:00')

  expect(now).toBe(1769274000000)
  expect(Date.now()).toBe(now)
  expect(new Date().getTime()).toBe(now)
})

it('lets awaited timers make progress and keeps the clock moving', async () => {
  const setFakeTimer = createSetFakeTimer('UTC')

  const now = setFakeTimer('2026-01-24T12:00')

  // Without `shouldAdvanceTime` the faked `setTimeout` never fires on
  // its own and this await never settles.
  await wait(20)

  expect(Date.now()).toBeGreaterThan(now)
})

it('re-sets the clock on every call', () => {
  const setFakeTimer = createSetFakeTimer('UTC')

  const first = setFakeTimer('2026-01-24T12:00')

  expect(Date.now()).toBe(first)

  const second = setFakeTimer('2027-03-05T06:30')

  expect(second).not.toBe(first)
  expect(Date.now()).toBe(second)
})

it('throws for an unusable time zone at binding time', () => {
  expect(() => {
    // The returned helper is discarded, so the throw can only come from
    // the factory itself.
    createSetFakeTimer('Invalid/Zone')
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid time zone. Time zone: 'Invalid/Zone']`,
  )

  expect(vi.isFakeTimers()).toBe(false)
})

it('throws scdate format errors and leaves timer state untouched', () => {
  const setFakeTimer = createSetFakeTimer('UTC')

  expect(() => {
    setFakeTimer('2022-04-03T23:59:59')
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2022-04-03T23:59:59'.]`,
  )

  expect(() => {
    setFakeTimer('2021-04-05')
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-04-05'.]`,
  )

  expect(() => {
    setFakeTimer('not-a-timestamp')
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: 'not-a-timestamp'.]`,
  )

  expect(vi.isFakeTimers()).toBe(false)
})

it('replaces a previously installed fake timer configuration', () => {
  const setFakeTimer = createSetFakeTimer('UTC')

  // This configuration deliberately leaves `setTimeout` real, so the
  // callback below can only fire from a fake-timer advance if the
  // helper reinstalled vitest's default set of faked APIs rather than
  // merging with what was already installed.
  vi.useFakeTimers({ toFake: ['Date'], now: 0 })

  const now = setFakeTimer('2026-01-24T12:00')

  let fired = false

  getTestGlobals().setTimeout(() => {
    fired = true
  }, 5_000)

  vi.advanceTimersByTime(5_000)

  expect(fired).toBe(true)
  expect(Date.now()).toBeGreaterThanOrEqual(now + 5_000)
})
