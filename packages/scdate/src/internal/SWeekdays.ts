import { validateWeekdays } from './weekdays.js'

/**
 * SWeekdays represents a string of weekdays in the format 'SMTWTFS' where each
 * position is represented by a flag indicating if the weekday (starting on
 * Sunday and ending on Saturday using the first letter of the english word for
 * the week day) is included or excluded. If excluded, the position is filled
 * with a '-' character.
 */
export class SWeekdays {
  public readonly weekdays: string

  public constructor(weekdays: string) {
    validateWeekdays(weekdays)

    this.weekdays = weekdays
  }

  public toJSON(): string {
    return this.weekdays
  }

  /**
   * Returns the weekdays in the SMTWTFS format, e.g.
   * `String(sWeekdays('-MTWTF-'))` is `'-MTWTF-'`. Called by `String(value)`,
   * template literals, object keys, `.join()` and `.sort()` without a
   * comparator.
   */
  public toString(): string {
    return this.weekdays
  }

  /**
   * Always throws a `TypeError`. SWeekdays cannot be converted to a primitive
   * value, so `<`, `>`, `<=`, `>=`, `==` against a primitive, `+`, arithmetic,
   * `Number(value)` and an explicit `valueOf()` call throw instead of silently
   * producing a wrong result. Use `areWeekdaysEqual` to compare, or
   * `String(value)` to get the string.
   */
  public valueOf(): never {
    throw new TypeError(
      'SWeekdays cannot be converted to a primitive value. Use areWeekdaysEqual() to compare weekdays, or String(value) to get the SMTWTFS string.',
    )
  }
}
