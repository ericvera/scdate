/**
 * Weekday flags for use with bitwise operations. Each value is a power of 2,
 * allowing multiple days to be combined using the bitwise OR operator.
 *
 * @example
 * ```ts
 * // Combine weekdays with bitwise OR
 * const weekendDays = Weekday.Sat | Weekday.Sun
 *
 * // Business days
 * const businessDays =
 *   Weekday.Mon | Weekday.Tue | Weekday.Wed | Weekday.Thu | Weekday.Fri
 * ```
 */
export enum Weekday {
  Sun = 1,
  Mon = 2,
  Tue = 4,
  Wed = 8,
  Thu = 16,
  Fri = 32,
  Sat = 64,
}

/**
 * Maps weekday index (0-6) to Weekday enum value.
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export const DayToWeekday: Weekday[] = [
  Weekday.Sun,
  Weekday.Mon,
  Weekday.Tue,
  Weekday.Wed,
  Weekday.Thu,
  Weekday.Fri,
  Weekday.Sat,
]
