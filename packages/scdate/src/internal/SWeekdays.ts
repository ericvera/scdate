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
   * Returns the weekdays in the SMTWTFS format. Used by template literals and
   * `String(value)`.
   */
  public toString(): string {
    return this.weekdays
  }

  /**
   * Always throws. SWeekdays cannot be converted to a primitive value, so `<`,
   * `>`, `==` against a string and `+` throw instead of comparing or
   * concatenating silently. Use `areWeekdaysEqual` or `String(value)` instead.
   */
  public valueOf(): never {
    throw new TypeError(
      'SWeekdays cannot be converted to a primitive value. Use areWeekdaysEqual() to compare weekdays, or String(value) to get the SMTWTFS string.',
    )
  }
}
