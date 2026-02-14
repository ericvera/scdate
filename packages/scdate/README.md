# scDate

**Date and time library for working with schedules**

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/scdate.svg?style=flat-square)](https://npmjs.org/package/scdate)

## Overview

scDate is a TypeScript library designed specifically for handling date and time operations in scheduling applications. It provides a set of immutable classes and utility functions that make working with dates, times, timestamps, and weekday patterns simple and predictable.

## Features

- **Comprehensive date/time handling**: Work with dates (`SDate`), times (`STime`), timestamps (`STimestamp`), and weekday patterns (`SWeekdays`)
- **Time zone aware**: Time zone information is only required when performing operations where it's relevant
- **Serializable**: All objects serialize to simple ISO-formatted strings for easy storage and transmission
- **Immutable**: All operations return new instances, ensuring data consistency
- **Flexible inputs**: All methods accept either serialized strings or class instances, simplifying code and improving readability
- **Schedule-focused**: Built specifically for applications that need to handle schedules and recurring patterns

## Installation

```bash
npm install scdate
# or
yarn add scdate
```

## Basic Usage

```typescript
import {
  sDate,
  sTime,
  sTimestamp,
  sWeekdays,
  Weekday,
  getDateToday,
  getNextDateByWeekday,
  getTimeNow,
  addMinutesToTime,
  getTimestampNow,
  getTimestampFromDateAndTime,
  getWeekdaysFromWeekdayFlags,
} from 'scdate'

// Working with dates
const today = getDateToday('America/Puerto_Rico')
const nextMonday = getNextDateByWeekday(today, Weekday.Mon)

// Working with times
const currentTime = getTimeNow('America/Puerto_Rico')
const inOneHour = addMinutesToTime(currentTime, 60)

// Working with timestamps
const now = getTimestampNow('America/Puerto_Rico')
const meeting = getTimestampFromDateAndTime(nextMonday, sTime('14:30'))

// Working with weekday patterns
const weekendDays = getWeekdaysFromWeekdayFlags(Weekday.Sat | Weekday.Sun)
const businessDays = getWeekdaysFromWeekdayFlags(
  Weekday.Mon | Weekday.Tue | Weekday.Wed | Weekday.Thu | Weekday.Fri,
)
```

## API Documentation

### Date Operations (`SDate`)

`SDate` represents a date in the ISO 8601 format (`YYYY-MM-DD`).

```typescript
// Creating dates
const date1 = sDate('2023-12-25') // From ISO string
const date2 = getDateToday('America/Puerto_Rico') // Current date in timezone
const date3 = getDateForFirstDayOfMonth(date1) // First day of month
const date4 = getDateForLastDayOfMonth(date1) // Last day of month

// Date arithmetic
const nextDay = addDaysToDate(date1, 1) // Add days
const nextMonth = addMonthsToDate(date1, 1) // Add months
const nextYear = addYearsToDate(date1, 1) // Add years

// Date information
const year = getYearFromDate(date1) // Get year (number)
const month = getMonthFromDate(date1) // Get month (0-11)
const day = getDateFromDate(date1) // Get day of month
const weekday = getWeekdayFromDate(date1) // Get weekday (0-6)

// Date navigation
const nextTuesday = getNextDateByWeekday(date1, Weekday.Tue)
const prevFriday = getPreviousDateByWeekday(date1, Weekday.Fri)

// Date calculations
const daysBetween = getDaysBetweenDates(date1, date2) // Days between dates (positive if date2 is later)
const utcMs = getUTCMillisecondsFromDate(date1, 'America/Puerto_Rico') // Convert to UTC milliseconds
const zonedDate = getTimeZonedDateFromDate(date1, 'America/Puerto_Rico') // Get timezone-adjusted Date

// Date comparison
const isEqual = isSameDate(date1, date2)
const isBefore = isBeforeDate(date1, date2)
const isAfter = isAfterDate(date1, date2)
const isSameOrBefore = isSameDateOrBefore(date1, date2)
const isSameOrAfter = isSameDateOrAfter(date1, date2)
const isToday = isDateToday(date1, 'America/Puerto_Rico')
const isSameMonth = areDatesInSameMonth(date1, date2) // Check if dates are in same month & year
const isSameYear = areDatesInSameYear(date1, date2) // Check if dates are in same year
const isCurrentMonth = isDateInCurrentMonth(date1, 'America/Puerto_Rico') // Check if in current month
const isCurrentYear = isDateInCurrentYear(date1, 'America/Puerto_Rico') // Check if in current year

// Date formatting
const fullDateStr = getFullDateString(date1, 'en-US')
const shortDateStr = getShortDateString(date1, 'America/Puerto_Rico', 'en-US', {
  includeWeekday: true,
  onTodayText: () => 'Today',
})
```

#### Important Behaviors and Edge Cases

- **`getNextDateByWeekday(date, weekday)`**: Always returns a date _after_ the provided date. If the current date falls on the specified weekday, it will return the _next_ occurrence (7 days later), not the current date.

- **`getPreviousDateByWeekday(date, weekday)`**: Always returns a date _before_ the provided date. If the current date falls on the specified weekday, it will return the _previous_ occurrence (7 days earlier), not the current date.

- **`getDateForFirstDayOfMonth(date)`**: Returns a new date set to the first day of the month from the input date, preserving the year and month.

- **`getDateForLastDayOfMonth(date)`**: Returns a new date set to the last day of the month, which varies depending on the month and year (accounting for leap years).

- **`addMonthsToDate(date, months, options?)`**: Properly handles month boundaries by clamping to the last day of the target month. For example, adding one month to January 31 will result in February 28/29 (depending on leap year), adding 3 months will result in April 30, and adding 5 months will result in June 30. This ensures consistent and predictable date handling when crossing between months with different numbers of days.

  Accepts an optional `options` object with:
  - `capToCommonDate`: When set to `true`, dates greater than the 28th will always be capped to the 28th of the target month (the last date common to all months). For example, `addMonthsToDate('2023-01-31', 3, { capToCommonDate: true })` will result in `'2023-04-28'` rather than `'2023-04-30'`. This is useful for scheduling scenarios where you need consistent date behavior across all months.

- **`isDateToday(date, timeZone)`**: The comparison is time-zone aware, so a date that is "today" in one time zone might not be "today" in another time zone.

- **`getDaysBetweenDates(date1, date2)`**: Returns the number of calendar days between two dates. The result is positive if date2 is after date1, negative if before. This accounts for calendar days rather than full 24-hour periods.

- **`getUTCMillisecondsFromDate(date, timeZone)`**: Converts a date to UTC milliseconds since the Unix epoch, accounting for the specified time zone offset.

- **`getTimeZonedDateFromDate(date, timeZone)`**: Returns a native Date object adjusted so that its local time matches the local time at the specified time zone.

- **`areDatesInSameMonth(date1, date2)` / `areDatesInSameYear(date1, date2)`**: Check if two dates fall within the same month/year. For months, both the month and year must match.

- **`isDateInCurrentMonth(date, timeZone)` / `isDateInCurrentYear(date, timeZone)`**: Check if a date falls within the current month or year in the specified time zone.

### Time Operations (`STime`)

`STime` represents a time in the ISO 8601 format (`HH:MM`).

```typescript
// Creating times
const time1 = sTime('14:30') // From ISO string
const time2 = getTimeNow('America/Puerto_Rico') // Current time in timezone
const time3 = getTimeAtMidnight() // 00:00
const time4 = getTimeFromMinutes(60) // 01:00 (60 minutes after midnight)

// Time arithmetic
const laterTime = addMinutesToTime(time1, 30) // Add minutes

// Time information
const hours = getHoursFromTime(time1) // Get hours (0-23)
const minutes = getMinutesFromTime(time1) // Get minutes (0-59)
const totalMinutes = getTimeInMinutes(time1) // Get total minutes since midnight

// Time formatting
const timeString = get12HourTimeString(time1) // e.g., "2:30 PM"
const hoursString = get12HoursHoursStringFromTime(time1) // Get hours in 12-hour format (e.g., "2")
const minutesString = getMinutesStringFromTime(time1) // Get minutes as 2-digit string (e.g., "30")

// Time comparison
const isEqual = isSameTime(time1, time2)
const isBefore = isBeforeTime(time1, time2)
const isAfter = isAfterTime(time1, time2)
const isSameOrBefore = isSameTimeOrBefore(time1, time2)
const isSameOrAfter = isSameTimeOrAfter(time1, time2)
const isPM = isTimePM(time1)
```

#### Important Behaviors and Edge Cases

- **`addMinutesToTime(time, minutes)`**: When adding minutes, the time wraps around a 24-hour clock. For example, adding 30 minutes to 23:45 results in 00:15, not 24:15.

- **`getTimeInMinutes(time, midnightIs24)`**: By default, midnight (00:00) is represented as 0 minutes. If `midnightIs24` is set to `true`, midnight will be represented as 1440 minutes (24 hours).

- **`isTimePM(time)`**: Hours from 12:00 to 23:59 are considered PM, while 00:00 to 11:59 are AM. 12:00 is considered PM, not AM.

- **`get12HoursHoursStringFromTime(time)`**: Returns the hours component in 12-hour format as a string (1-12).

- **`getMinutesStringFromTime(time)`**: Returns the minutes component as a zero-padded 2-digit string (00-59).

### Timestamp Operations (`STimestamp`)

`STimestamp` combines a date and time in the ISO 8601 format (`YYYY-MM-DDTHH:MM`).

```typescript
// Creating timestamps
const ts1 = sTimestamp('2023-12-25T14:30') // From ISO string
const ts2 = getTimestampNow('America/Puerto_Rico') // Current timestamp in timezone
const ts3 = getTimestampFromDateAndTime(date1, time1) // From date and time
const ts4 = getTimestampFromUTCMilliseconds(
  1640444400000,
  'America/Puerto_Rico',
) // From UTC milliseconds

// Timestamp arithmetic
const tsNextDay = addDaysToTimestamp(ts1, 1)
const ts30MinLater = addMinutesToTimestamp(ts1, 30, 'America/Puerto_Rico')

// Timestamp breakdown
const tsDate = getDateFromTimestamp(ts1) // Extract date part
const tsTime = getTimeFromTimestamp(ts1) // Extract time part

// Timestamp conversion
const tsMilliseconds = getUTCMillisecondsFromTimestamp(
  ts1,
  'America/Puerto_Rico',
)
const tsNativeDate = getTimeZonedDateFromTimestamp(ts1, 'America/Puerto_Rico')
const secondsToTs = getSecondsToTimestamp(ts1, 'America/Puerto_Rico')

// Timestamp formatting
const tsString = getShortTimestampString(ts1, 'America/Puerto_Rico', 'en-US', {
  includeWeekday: true,
  onTodayAtText: () => 'Today at',
})

// Timestamp comparison
const isEqual = isSameTimestamp(ts1, ts2)
const isBefore = isBeforeTimestamp(ts1, ts2)
const isAfter = isAfterTimestamp(ts1, ts2)
const isSameOrBefore = isSameTimestampOrBefore(ts1, ts2)
const isSameOrAfter = isSameTimestampOrAfter(ts1, ts2)
```

#### Important Behaviors and Edge Cases

- **`getTimestampFromUTCMilliseconds(milliseconds, timeZone)`**: Converts UTC milliseconds to a timestamp in the specified time zone, accounting for time zone offsets.

- **`addMinutesToTimestamp(timestamp, minutes, timeZone)`**: Time zone awareness is critical for this operation, especially around Daylight Saving Time transitions. When a timestamp lands in the "missing hour" during a spring-forward transition, it's adjusted to the valid time.

- **`getSecondsToTimestamp(timestamp, timeZone)`**: Returns a positive value for future timestamps and negative for past timestamps. Handles DST transitions correctly but might produce unexpected results for timestamps that fall in skipped or repeated hours during DST transitions.

- **`getUTCMillisecondsFromTimestamp(timestamp, timeZone)`**: Converts a timestamp to UTC milliseconds, accounting for the time zone offset at that specific date and time (important for historical dates with different time zone rules).

### Weekday Operations (`SWeekdays`)

`SWeekdays` represents a set of weekdays in the format `SMTWTFS`, where each position corresponds to a day of the week (Sunday to Saturday).

```typescript
// Creating weekday patterns
const weekdays1 = sWeekdays('SMTWTFS') // All days
const weekdays2 = sWeekdays('SM----S') // Sunday, Monday, Saturday
const weekdays3 = getWeekdaysFromWeekdayFlags(Weekday.Mon | Weekday.Wed) // Monday, Wednesday
const weekdays4 = getWeekdaysWithAllIncluded() // All days
const weekdays5 = getWeekdaysWithNoneIncluded() // No days

// Weekday operations
const shiftedWeekdays = shiftWeekdaysForward(weekdays2) // Shift pattern one day forward
const filteredWeekdays = filterWeekdaysForDates(
  // Filter to days in date range
  weekdays1,
  '2023-12-25',
  '2023-12-31',
)
const updatedWeekdays = addWeekdayToWeekdays(weekdays5, Weekday.Fri) // Add Friday to pattern

// Weekday navigation
const previousDay = getPreviousWeekday(Weekday.Mon) // Returns Weekday.Sun
const nextDay = getNextWeekday(Weekday.Mon) // Returns Weekday.Tue

// Weekday queries
const includesMonday = doesWeekdaysIncludeWeekday(weekdays2, Weekday.Mon)
const hasOverlap = doesWeekdaysHaveOverlapWithWeekdays(weekdays2, weekdays3)
const areEqual = areWeekdaysEqual(weekdays1, weekdays4) // true (both all days)
const isEmpty = isWeekdaysEmpty(weekdays5) // true (no days)
```

#### Important Behaviors and Edge Cases

- **`sWeekdays(pattern)`**: The pattern must be exactly 7 characters long, with each position representing a day from Sunday to Saturday. Valid characters are the first letter of the English weekday name (S, M, T, W, T, F, S) or a dash '-' for excluded days.

- **`shiftWeekdaysForward(weekdays)`**: Shifts the pattern forward by one day with circular wrapping. For example, 'SM----S' becomes 'SMT----'. The last character (Saturday) wraps around to become the first day (Sunday) position.

- **`filterWeekdaysForDates(weekdays, fromDate, toDate)`**: Returns a new weekday pattern that only includes the weekdays that fall within the given date range. If the date range spans less than a week, only the applicable days are included.

- **`getWeekdaysFromWeekdayFlags(flags)`**: Uses bitwise operations to combine multiple weekday flags. Each weekday is represented by a power of 2, allowing for efficient combination and checking.

## Dependencies

This package has the following dependencies:

- `date-fns-tz`: Used for time zone calculations
- `date-fns`: Peer dependency of `date-fns-tz`
- `@date-fns/utc`: Used for its `UTCDateMini` implementation that simplifies time calculations

## Design Decisions

### ISO 8601 Format

scDate uses a subset of the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) standard for all date and time representations. This format was chosen for several key benefits:

- **Human readability**: Dates and times are easy to read and interpret
- **String sortability**: ISO-formatted strings can be sorted chronologically using simple string comparison
- **Direct comparison**: Values can be compared directly as strings without conversion

### Minute-Level Precision

scDate intentionally omits seconds and milliseconds from time representations. This design choice reflects the library's focus on scheduling applications, where:

- Minute-level granularity is typically sufficient for most scheduling needs
- Simpler time representations lead to more intuitive API and usage patterns
- Performance is optimized by avoiding unnecessary precision

## Time Zones

```typescript
import { isValidTimeZone } from 'scdate'

isValidTimeZone('America/New_York') // true
isValidTimeZone('Invalid/Timezone') // false
```

For a list of valid time zones run `Intl.supportedValuesOf('timeZone')` in your environment.

## License

MIT
