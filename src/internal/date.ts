import { UTCDateMini } from '@date-fns/utc'
import { SDate } from './SDate.js'

export const getISOYearFromISODate = (isoDate: string): string => {
  const EndOfYearIndex = 4

  return isoDate.slice(0, EndOfYearIndex)
}

export const getISOMonthFromISODate = (isoDate: string): string => {
  const StartOfMonthIndex = 5
  const EndOfMonthIndex = 7

  return isoDate.slice(StartOfMonthIndex, EndOfMonthIndex)
}

export const getISODateFromISODate = (isoDate: string): string => {
  const StartOfDateIndex = 8

  return isoDate.slice(StartOfDateIndex)
}

export const getISODateFromZonedDate = (date: Date): string => {
  return `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

export const validateISODate = (isoDate: string) => {
  const ValidISODate = /^\d{4}-\d{2}-\d{2}$/
  if (!ValidISODate.test(isoDate)) {
    throw new Error(
      `Invalid date format. Expected format: YYYY-MM-DD. Current value: '${isoDate}'.`,
    )
  }

  const year = Number(getISOYearFromISODate(isoDate))
  const month = Number(getISOMonthFromISODate(isoDate)) - 1
  const date = Number(getISODateFromISODate(isoDate))

  const nativeDate = new Date()
  nativeDate.setUTCFullYear(year, month, date)

  // This will result in an error if for example the date uses 32 as the date
  if (
    nativeDate.getUTCFullYear() !== year ||
    nativeDate.getUTCMonth() !== month ||
    nativeDate.getUTCDate() !== date
  ) {
    throw new Error(`Invalid ISO date value. Current value: '${isoDate}'.`)
  }
}

export const getDateAsUTCDateMini = (date: SDate): UTCDateMini =>
  new UTCDateMini(`${date.date}T00:00z`)
