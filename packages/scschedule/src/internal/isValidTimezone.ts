/**
 * Checks if a string is a valid IANA timezone identifier.
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    const validTimezones = Intl.supportedValuesOf('timeZone')

    return validTimezones.includes(timezone)
  } catch {
    return false
  }
}
