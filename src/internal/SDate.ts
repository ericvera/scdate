import { validateISODate } from './date'

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
}
