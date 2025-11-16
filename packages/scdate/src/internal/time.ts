export const getISOHoursFromISOTime = (isoTime: string): string => {
  const EndOfHoursIndex = 2

  return isoTime.slice(0, EndOfHoursIndex)
}

export const getISOMinutesFromISOTime = (isoTime: string): string => {
  const StartOfMinutesIndex = 3

  return isoTime.slice(StartOfMinutesIndex)
}

export const getISOTimeFromDate = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
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
  nativeDate.setUTCHours(hours)
  nativeDate.setUTCMinutes(minutes)

  // The following will result in an error if for example the date uses a time
  // outside of 0:00 and 23:59.

  if (
    nativeDate.getUTCMinutes() !== minutes ||
    nativeDate.getUTCHours() !== hours
  ) {
    throw new Error(
      `Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '${isoTime}'.`,
    )
  }
}
