import { formatISO } from 'date-fns'

export const getISOHoursFromISOTime = (isoTime: string): string => {
  const EndOfHoursIndex = 2

  return isoTime.slice(0, EndOfHoursIndex)
}

export const getISOMinutesFromISOTime = (isoTime: string): string => {
  const StartOfMinutesIndex = 3

  return isoTime.slice(StartOfMinutesIndex)
}

export const getISOTimeFromDate = (date: Readonly<Date>): string => {
  const StartOfISOTimeIndex = 11
  const EndOfISOTimeIndex = 16

  return formatISO(date).slice(StartOfISOTimeIndex, EndOfISOTimeIndex)
}

export const validateISOTime = (isoTime: string): void => {
  const ValidISOTime = /^\d{2}:\d{2}$/

  if (!ValidISOTime.test(isoTime)) {
    throw new Error(
      `Invalid time format. Expected format: HH:MM. Current value: '${isoTime}'.`,
    )
  }

  const hours = Number(getISOHoursFromISOTime(isoTime))
  const minutes = Number(getISOMinutesFromISOTime(isoTime))

  const nativeDate = new Date()
  nativeDate.setHours(hours)
  nativeDate.setMinutes(minutes)

  // The following will result in an error if for example the date uses a time
  // outside of 0:00 and 23:59.

  if (nativeDate.getMinutes() !== minutes || nativeDate.getHours() !== hours) {
    throw new Error(
      `Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '${isoTime}'.`,
    )
  }
}
