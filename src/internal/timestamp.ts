import { UTCDateMini } from '@date-fns/utc'
import { formatISO } from 'date-fns'
import { STimestamp } from './STimestamp'
import { validateISODate } from './date'
import { validateISOTime } from './time'

export const getISODateFromISOTimestamp = (isoTimestamp: string): string => {
  const EndOfDateIndex = 10

  return isoTimestamp.slice(0, EndOfDateIndex)
}

export const getISOTimeFromISOTimestamp = (isoTimestamp: string): string => {
  const StartOfTimeIndex = 11

  return isoTimestamp.slice(StartOfTimeIndex)
}

export const getISOTimestampFromZonedDate = (date: Readonly<Date>): string => {
  const ISOTimestampLength = 16

  return formatISO(date).slice(0, ISOTimestampLength)
}

// TODO: Really needed?
export const getISOTimestampFromUnzonedDate = (
  date: Readonly<Date>,
): string => {
  const EndOfISOTimestampLength = 16

  return date.toISOString().slice(0, EndOfISOTimestampLength)
}

export const validateISOTimestamp = (isoTimestamp: string): void => {
  const ValidISOTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

  if (!ValidISOTimestamp.test(isoTimestamp)) {
    throw new Error(
      `Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '${isoTimestamp}'.`,
    )
  }

  const isoDate = getISODateFromISOTimestamp(isoTimestamp)
  validateISODate(isoDate)

  const isoTime = getISOTimeFromISOTimestamp(isoTimestamp)
  validateISOTime(isoTime)
}

export const getTimestampAsUTCDateMini = (timestamp: STimestamp): UTCDateMini =>
  new UTCDateMini(`${timestamp.timestamp}z`)
