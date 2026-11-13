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
   * Returns the time in the HH:MM format, e.g. `String(sTime('09:30'))` is
   * `'09:30'`. Called by `String(value)`, template literals, object keys,
   * `.join()` and `.sort()` without a comparator.
   */
  public toString(): string {
    return this.time
  }

  /**
   * Always throws a `TypeError`. STime cannot be converted to a primitive
   * value, so `<`, `>`, `<=`, `>=`, `==` against a primitive, `+`, arithmetic,
   * `Number(value)` and an explicit `valueOf()` call throw instead of silently
   * producing a wrong result. Use `isSameTime`, `isBeforeTime` or
   * `isAfterTime` to compare, or `String(value)` to get the string, which
   * sorts with `.sort()` or `localeCompare`.
   */
  public valueOf(): never {
    throw new TypeError(
      'STime cannot be converted to a primitive value. Use isSameTime(), isBeforeTime() or isAfterTime() to compare times, or String(value) to get the HH:MM string, which sorts in time order.',
    )
  }
}
