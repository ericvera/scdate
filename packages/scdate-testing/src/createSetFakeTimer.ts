import { getUTCMillisecondsFromTimestamp } from 'scdate'
import type { STimestampString } from 'scdate'
import { vi } from 'vitest'

const ZoneProbeTimestamp = '2020-01-01T00:00'

/**
 * The helper returned by `createSetFakeTimer`, bound to a single
 * time zone.
 */
export interface SetFakeTimer {
  /**
   * Sets vitest's fake timers to the given local timestamp in the
   * bound time zone and returns the matching number of
   * milliseconds since the Unix epoch (January 1, 1970, 00:00:00
   * UTC) so tests can assert against a stable value instead of
   * `Date.now()`.
   *
   * @param timestamp The local timestamp to set the clock to as a
   * string in the YYYY-MM-DDTHH:MM format.
   */
  (timestamp: STimestampString): number
}

/**
 * Returns a helper that sets vitest's fake timers to a local
 * timestamp in the given time zone. The helper returns the number
 * of milliseconds since the Unix epoch (January 1, 1970, 00:00:00
 * UTC) that it set the clock to. The time zone is validated
 * eagerly so an unusable zone throws here, at binding time, rather
 * than inside a test.
 *
 * @param timeZone The time zone used to interpret every timestamp
 * passed to the returned helper. See
 * `Intl.supportedValuesOf('timeZone')` for a list of valid time
 * zones.
 */
export const createSetFakeTimer = (timeZone: string): SetFakeTimer => {
  getUTCMillisecondsFromTimestamp(ZoneProbeTimestamp, timeZone)

  const setFakeTimer: SetFakeTimer = (timestamp: STimestampString): number => {
    const now = getUTCMillisecondsFromTimestamp(timestamp, timeZone)

    vi.useFakeTimers({ now, shouldAdvanceTime: true })

    return now
  }

  return setFakeTimer
}
