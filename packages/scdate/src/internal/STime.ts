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
}
