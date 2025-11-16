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
}
