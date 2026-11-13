import { validateISOTimestamp } from './timestamp.js'

/**
 * STimestamp represents a timestamp in the ISO-8601 format (YYYY-MM-DDTHH:MM)
 */
export class STimestamp {
  public readonly timestamp: string

  public constructor(timestamp: string) {
    validateISOTimestamp(timestamp)

    this.timestamp = timestamp
  }

  public toJSON(): string {
    return this.timestamp
  }

  /**
   * Returns the timestamp in the YYYY-MM-DDTHH:MM format, e.g.
   * `String(sTimestamp('2024-03-01T09:30'))` is `'2024-03-01T09:30'`. Called by
   * `String(value)`, template literals, object keys, `.join()` and `.sort()`
   * without a comparator.
   */
  public toString(): string {
    return this.timestamp
  }

  /**
   * Always throws a `TypeError`. STimestamp cannot be converted to a primitive
   * value, so `<`, `>`, `<=`, `>=`, `==` against a primitive, `+`, arithmetic,
   * `Number(value)` and an explicit `valueOf()` call throw instead of silently
   * producing a wrong result. Use `isSameTimestamp`, `isBeforeTimestamp` or
   * `isAfterTimestamp` to compare, or `String(value)` to get the string, which
   * sorts with `.sort()` or `localeCompare`.
   */
  public valueOf(): never {
    throw new TypeError(
      'STimestamp cannot be converted to a primitive value. Use isSameTimestamp(), isBeforeTimestamp() or isAfterTimestamp() to compare timestamps, or String(value) to get the YYYY-MM-DDTHH:MM string, which sorts in time order.',
    )
  }
}
