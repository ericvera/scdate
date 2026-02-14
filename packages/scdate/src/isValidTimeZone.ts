/**
 * Checks if a string is a valid IANA time zone identifier.
 */
export const isValidTimeZone = (timeZone: string): boolean => {
  try {
    const validTimeZones = Intl.supportedValuesOf('timeZone')

    return validTimeZones.includes(timeZone)
  } catch {
    return false
  }
}
