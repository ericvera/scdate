import { validateISODate } from './date.js'

/**
 * SDate represents a date in the ISO-8601 format (YYYY-MM-DD)
 */
export class SDate {
  public readonly date: string

  public constructor(isoValue: string) {
    validateISODate(isoValue)

    this.date = isoValue
  }

  public toJSON(): string {
    return this.date
  }

  /**
   * Returns the date in the YYYY-MM-DD format. Used by template literals and
   * `String(value)`.
   */
  public toString(): string {
    return this.date
  }

  /**
   * Always throws. SDate cannot be converted to a primitive value, so `<`,
   * `>`, `==` against a string and `+` throw instead of comparing or
   * concatenating silently. Use `compareDates`, `isSameDate` or
   * `String(value)` instead.
   */
  public valueOf(): never {
    throw new TypeError(
      'SDate cannot be converted to a primitive value. Use compareDates() or isSameDate() to compare dates, or String(value) to get the YYYY-MM-DD string.',
    )
  }
}
