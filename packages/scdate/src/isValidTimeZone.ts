/**
 * Checks if a string is a time zone the runtime's `Intl.DateTimeFormat`
 * accepts: IANA names, their aliases (for example `US/Eastern` or
 * `Asia/Calcutta`), `UTC`, and names in any letter case. Fixed offsets such
 * as `+05:00` are accepted where the runtime supports them.
 *
 * @param timeZone The string to validate as a time zone.
 */
export const isValidTimeZone = (timeZone: string): boolean => {
  if (typeof timeZone !== 'string') {
    return false
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone })

    return true
  } catch {
    return false
  }
}
