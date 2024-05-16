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
}
