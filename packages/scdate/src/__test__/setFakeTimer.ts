import { vi } from 'vitest'
import { getUTCMillisecondsFromWallClock } from '../internal/zoned.js'
import { TestLocalTimeZone } from './constants.js'

export const setFakeTimer = (
  isoDateTime: string,
  timeZone: string = TestLocalTimeZone,
): void => {
  const [date = '', time = ''] = isoDateTime.split('T')

  const [year, month, day] = date.split('-')
  const [hours = '0', minutes = '0', seconds = '0'] =
    time.length > 0 ? time.split(':') : []

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(
      `Expected ISO value to include YYYY-MM-DD at a minimum. Current value: '${isoDateTime}'`,
    )
  }

  // The wall clock is built as UTC and resolved against the time zone so the
  // instant does not depend on the host's TZ.
  const wallClock = new Date(0)
  wallClock.setUTCFullYear(parseInt(year), parseInt(month) - 1, parseInt(day))
  wallClock.setUTCHours(
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds),
    0,
  )

  const now = getUTCMillisecondsFromWallClock(wallClock.getTime(), timeZone)

  vi.useFakeTimers({
    now,
    shouldAdvanceTime: false,
  })
}
