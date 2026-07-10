import {
  addDaysToDate,
  getTimestampFromDateAndTime,
  type SDate,
  type STimestamp,
} from 'scdate'
import {
  getMinuteIntervalsFromTimeRange,
  MinutesInDay,
} from './getMinuteIntervalsFromTimeRange.js'
import type { TimeRange } from './types.js'

/**
 * Returns the timestamp at which a rule's time range ends (exclusive) when
 * the rule applies on the given date. Ranges that run to or past midnight
 * end on the next day (a `to` of 00:00 ends at the next day's midnight).
 */
export const getRangeEndTimestamp = (
  date: SDate | string,
  timeRange: TimeRange,
): STimestamp => {
  const { sameDay } = getMinuteIntervalsFromTimeRange(timeRange)

  return sameDay.to === MinutesInDay
    ? getTimestampFromDateAndTime(addDaysToDate(date, 1), timeRange.to)
    : getTimestampFromDateAndTime(date, timeRange.to)
}
