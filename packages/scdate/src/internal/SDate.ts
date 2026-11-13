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
   * Returns the date in the YYYY-MM-DD format, e.g.
   * `String(sDate('2024-03-01'))` is `'2024-03-01'`. Called by `String(value)`,
   * template literals, object keys, `.join()` and `.sort()` without a
   * comparator.
   */
  public toString(): string {
    return this.date
  }

  /**
   * Always throws a `TypeError`. SDate cannot be converted to a primitive
   * value, so `<`, `>`, `<=`, `>=`, `==` against a primitive, `+`, arithmetic,
   * `Number(value)` and an explicit `valueOf()` call throw instead of silently
   * producing a wrong result. Use `isSameDate`, `isBeforeDate` or
   * `isAfterDate` to compare, or `String(value)` to get the string, which
   * sorts with `.sort()` or `localeCompare`.
   */
  public valueOf(): never {
    throw new TypeError(
      'SDate cannot be converted to a primitive value. Use isSameDate(), isBeforeDate() or isAfterDate() to compare dates, or String(value) to get the YYYY-MM-DD string, which sorts in date order.',
    )
  }
}
