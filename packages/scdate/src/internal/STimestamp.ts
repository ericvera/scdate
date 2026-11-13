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
   * Returns the timestamp in the YYYY-MM-DDTHH:MM format. Used by template
   * literals and `String(value)`.
   */
  public toString(): string {
    return this.timestamp
  }

  /**
   * Always throws. STimestamp cannot be converted to a primitive value, so `<`,
   * `>`, `==` against a string and `+` throw instead of comparing or
   * concatenating silently. Use `compareTimestamps`, `isSameTimestamp` or
   * `String(value)` instead.
   */
  public valueOf(): never {
    throw new TypeError(
      'STimestamp cannot be converted to a primitive value. Use compareTimestamps() or isSameTimestamp() to compare timestamps, or String(value) to get the YYYY-MM-DDTHH:MM string.',
    )
  }
}
