import { fromZonedTime } from 'date-fns-tz'
import { vi } from 'vitest'
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

  const localNow = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds),
  )

  const now = fromZonedTime(localNow, timeZone)

  vi.useFakeTimers({
    now,
    shouldAdvanceTime: false,
  })
}
