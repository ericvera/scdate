import type { STime } from 'scdate'
import type { STimeString } from '../types.js'

/**
 * Represents a time range within a day. Time ranges can cross midnight. For
 * example, a range from 20:00 to 02:00 represents 8:00 PM up to (but not
 * including) 2:00 AM the next day.
 */
export interface TimeRange {
  /** Start time of the range (inclusive) */
  from: STime | STimeString
  /**
   * End time of the range (exclusive). A `to` of 00:00 means the range runs
   * to the end of the day. When `from` equals `to` (other than 00:00), the
   * range covers a full 24 hours.
   */
  to: STime | STimeString
}

/**
 * A half-open interval of minutes within a single day: `from` (inclusive) to
 * `to` (exclusive), where 0 is midnight and 1440 is the end of the day.
 */
export interface MinuteInterval {
  /** Start of the interval in minutes since midnight (inclusive) */
  from: number
  /** End of the interval in minutes since midnight (exclusive, up to 1440) */
  to: number
}
