import { validateISOTime } from './time.js'

/**
 * STime represents a time in the ISO-8601 format (HH:MM)
 */
export class STime {
  public readonly time: string

  public constructor(isoValue: string) {
    validateISOTime(isoValue)

    this.time = isoValue
  }

  public toJSON(): string {
    return this.time
  }

  /**
   * Returns the time in the HH:MM format. Used by template literals and
   * `String(value)`.
   */
  public toString(): string {
    return this.time
  }

  /**
   * Always throws. STime cannot be converted to a primitive value, so `<`,
   * `>`, `==` against a string and `+` throw instead of comparing or
   * concatenating silently. Use `compareTimes`, `isSameTime` or
   * `String(value)` instead.
   */
  public valueOf(): never {
    throw new TypeError(
      'STime cannot be converted to a primitive value. Use compareTimes() or isSameTime() to compare times, or String(value) to get the HH:MM string.',
    )
  }
}
