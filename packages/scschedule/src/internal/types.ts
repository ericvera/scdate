import type { STime } from 'scdate'
import type { STimeString } from '../types.js'

/**
 * Represents a time range within a day. Time ranges can cross midnight. For
 * example, a range from 20:00 to 02:00 represents 8:00 PM to 2:00 AM the next
 * day.
 */
export interface TimeRange {
  /** Start time of the range (inclusive) */
  from: STime | STimeString
  /** End time of the range (inclusive) */
  to: STime | STimeString
}
