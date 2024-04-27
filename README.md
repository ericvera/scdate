# scdate

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/scdate.svg?style=flat-square)](https://npmjs.org/package/scdate)

Date and time library optimized for dealing with schedules.

_`scdate` is in active pre-release development so there may be breaking changes until v1.0.0 is released._

Features:

- Supports dates, times, and time stamps
- Time zone required for operations only when relevant
- Serializable to simple ISO formatted string

<!-- TSDOC_START -->

## :toolbox: Functions

- [sDate](#gear-sdate)
- [getDateToday](#gear-getdatetoday)
- [getNextDateByWeekday](#gear-getnextdatebyweekday)
- [getPreviousDateByWeekday](#gear-getpreviousdatebyweekday)
- [getDateForFirstDayOfMonth](#gear-getdateforfirstdayofmonth)
- [getDateForLastDayOfMonth](#gear-getdateforlastdayofmonth)
- [getYearFromDate](#gear-getyearfromdate)
- [getMonthFromDate](#gear-getmonthfromdate)
- [getDateFromDate](#gear-getdatefromdate)
- [getWeekdayFromDate](#gear-getweekdayfromdate)
- [getTimeZonedDateFromDate](#gear-gettimezoneddatefromdate)
- [getDaysBetweenDates](#gear-getdaysbetweendates)
- [getFullDateString](#gear-getfulldatestring)
- [getShortDateString](#gear-getshortdatestring)
- [addDaysToDate](#gear-adddaystodate)
- [addMonthsToDate](#gear-addmonthstodate)
- [addYearsToDate](#gear-addyearstodate)
- [isSameDate](#gear-issamedate)
- [isBeforeDate](#gear-isbeforedate)
- [isSameDateOrBefore](#gear-issamedateorbefore)
- [isAfterDate](#gear-isafterdate)
- [isSameDateOrAfter](#gear-issamedateorafter)
- [isDateToday](#gear-isdatetoday)
- [areDatesInSameMonth](#gear-aredatesinsamemonth)
- [isDateInCurrentMonth](#gear-isdateincurrentmonth)
- [areDatesInSameYear](#gear-aredatesinsameyear)
- [isDateInCurrentYear](#gear-isdateincurrentyear)
- [sTime](#gear-stime)
- [getTimeNow](#gear-gettimenow)
- [getTimeAtMidnight](#gear-gettimeatmidnight)
- [getTimeFromMinutes](#gear-gettimefromminutes)
- [getHoursFromTime](#gear-gethoursfromtime)
- [getHoursStringFromTime](#gear-gethoursstringfromtime)
- [getMinutesFromTime](#gear-getminutesfromtime)
- [getMinutesStringFromTime](#gear-getminutesstringfromtime)
- [get12HourTimeString](#gear-get12hourtimestring)
- [getTimeInMinutes](#gear-gettimeinminutes)
- [addMinutesToTime](#gear-addminutestotime)
- [isSameTime](#gear-issametime)
- [isAfterTime](#gear-isaftertime)
- [isSameTimeOrAfter](#gear-issametimeorafter)
- [isBeforeTime](#gear-isbeforetime)
- [isSameTimeOrBefore](#gear-issametimeorbefore)
- [isTimePM](#gear-istimepm)
- [sTimestamp](#gear-stimestamp)
- [getTimestampFromUTCMilliseconds](#gear-gettimestampfromutcmilliseconds)
- [getTimestampNow](#gear-gettimestampnow)
- [getTimestampFromDateAndTime](#gear-gettimestampfromdateandtime)
- [getTimeZonedDateFromTimestamp](#gear-gettimezoneddatefromtimestamp)
- [getSecondsToTimestamp](#gear-getsecondstotimestamp)
- [getDateFromTimestamp](#gear-getdatefromtimestamp)
- [getTimeFromTimestamp](#gear-gettimefromtimestamp)
- [getShortTimestampString](#gear-getshorttimestampstring)
- [addDaysToTimestamp](#gear-adddaystotimestamp)
- [addMinutesToTimestamp](#gear-addminutestotimestamp)
- [isSameTimestamp](#gear-issametimestamp)
- [isBeforeTimestamp](#gear-isbeforetimestamp)
- [isSameTimestampOrBefore](#gear-issametimestamporbefore)
- [isAfterTimestamp](#gear-isaftertimestamp)
- [isSameTimestampOrAfter](#gear-issametimestamporafter)
- [sWeekdays](#gear-sweekdays)
- [getWeekdaysFromWeekdayFlags](#gear-getweekdaysfromweekdayflags)
- [getWeekdaysWithAllIncluded](#gear-getweekdayswithallincluded)
- [getWeekdaysWithNoneIncluded](#gear-getweekdayswithnoneincluded)
- [shiftWeekdaysForward](#gear-shiftweekdaysforward)
- [filterWeekdaysForDates](#gear-filterweekdaysfordates)
- [addWeekdayToWeekdays](#gear-addweekdaytoweekdays)
- [doesWeekdaysIncludeWeekday](#gear-doesweekdaysincludeweekday)
- [doesWeekdaysHaveOverlapWithWeekdays](#gear-doesweekdayshaveoverlapwithweekdays)

### :gear: sDate

Factory function for creating a new SDate instance or returns the same
instance if already an instance of SDate.

| Function | Type                               |
| -------- | ---------------------------------- |
| `sDate`  | `(date: string or SDate) => SDate` |

Parameters:

- `date`: An instance of SDate that will be returned or a string in the
  ISO-8601 format (YYYY-MM-DD).

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L35)

### :gear: getDateToday

Returns the current date in the given time zone.

| Function       | Type                          |
| -------------- | ----------------------------- |
| `getDateToday` | `(timeZone: string) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L50)

### :gear: getNextDateByWeekday

Get the next date that matches the given weekday after the given date.

| Function               | Type                                                 |
| ---------------------- | ---------------------------------------------------- |
| `getNextDateByWeekday` | `(date: string or SDate, weekday: Weekday) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L59)

### :gear: getPreviousDateByWeekday

Get the previous date that matches the given weekday before the given date.

| Function                   | Type                                                 |
| -------------------------- | ---------------------------------------------------- |
| `getPreviousDateByWeekday` | `(date: string or SDate, weekday: Weekday) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L83)

### :gear: getDateForFirstDayOfMonth

Returns the date for the first day of the month for the given date.

| Function                    | Type                               |
| --------------------------- | ---------------------------------- |
| `getDateForFirstDayOfMonth` | `(date: string or SDate) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L107)

### :gear: getDateForLastDayOfMonth

Returns the date for the last day of the month for the given date.

| Function                   | Type                               |
| -------------------------- | ---------------------------------- |
| `getDateForLastDayOfMonth` | `(date: string or SDate) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L118)

### :gear: getYearFromDate

Returns the year from the given date.

| Function          | Type                                |
| ----------------- | ----------------------------------- |
| `getYearFromDate` | `(date: string or SDate) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L133)

### :gear: getMonthFromDate

Returns the month from the given date. Return sa 0-index value (i.e. Janary
is 0 and December is 11) to match the result from native Date object.

| Function           | Type                                |
| ------------------ | ----------------------------------- |
| `getMonthFromDate` | `(date: string or SDate) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L143)

### :gear: getDateFromDate

Returns the day of the month from the given date.

| Function          | Type                                |
| ----------------- | ----------------------------------- |
| `getDateFromDate` | `(date: string or SDate) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L152)

### :gear: getWeekdayFromDate

Returns the day of the week from the given date.

| Function             | Type                                |
| -------------------- | ----------------------------------- |
| `getWeekdayFromDate` | `(date: string or SDate) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L161)

### :gear: getTimeZonedDateFromDate

Returns the native Date representation of the given date in the given time
zone.

| Function                   | Type                                                |
| -------------------------- | --------------------------------------------------- |
| `getTimeZonedDateFromDate` | `(date: string or SDate, timeZone: string) => Date` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L172)

### :gear: getDaysBetweenDates

Get the number of days from the first date to the second date. The value is
positive if the first date is before the second date, and negative if the
first date is after the second date. This accounts for calendar days and not
full 24-hour periods which could be different due to daylight saving time.

| Function              | Type                                                         |
| --------------------- | ------------------------------------------------------------ |
| `getDaysBetweenDates` | `(date1: string or SDate, date2: string or SDate) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L191)

### :gear: getFullDateString

Get the full string representation of the given date in the given locale.

| Function            | Type                                                         |
| ------------------- | ------------------------------------------------------------ |
| `getFullDateString` | `(date: string or SDate, locale: LocalesArgument) => string` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L207)

### :gear: getShortDateString

Get the short string representation of the given date in the given locale.

| Function             | Type                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `getShortDateString` | `(date: string or SDate, timeZone: string, locale: LocalesArgument, options: SDateShortStringOptions) => string` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L223)

### :gear: addDaysToDate

Returns the date resulting from adding the given number of days to the given
date.

| Function        | Type                                             |
| --------------- | ------------------------------------------------ |
| `addDaysToDate` | `(date: string or SDate, days: number) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L255)

### :gear: addMonthsToDate

Returns the date resulting from adding the given number of months to the
given date.

| Function          | Type                                               |
| ----------------- | -------------------------------------------------- |
| `addMonthsToDate` | `(date: string or SDate, months: number) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L268)

### :gear: addYearsToDate

Returns the date resulting from adding the given number of years to the given
date.

| Function         | Type                                              |
| ---------------- | ------------------------------------------------- |
| `addYearsToDate` | `(date: string or SDate, years: number) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L284)

### :gear: isSameDate

Returns whether the two given dates are the same day.

| Function     | Type                                                          |
| ------------ | ------------------------------------------------------------- |
| `isSameDate` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L300)

### :gear: isBeforeDate

Returns whether the first given date is before the second given date.

| Function       | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| `isBeforeDate` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L313)

### :gear: isSameDateOrBefore

Returns whether the first given date is the same day or before the second
given date.

| Function             | Type                                                          |
| -------------------- | ------------------------------------------------------------- |
| `isSameDateOrBefore` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L327)

### :gear: isAfterDate

Returns whether the first given date is after the second given date.

| Function      | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| `isAfterDate` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L340)

### :gear: isSameDateOrAfter

Returns whether the first given date is the same day or after the second
given date.

| Function            | Type                                                          |
| ------------------- | ------------------------------------------------------------- |
| `isSameDateOrAfter` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L354)

### :gear: isDateToday

Returns whether the given date is today.

| Function      | Type                                                   |
| ------------- | ------------------------------------------------------ |
| `isDateToday` | `(date: string or SDate, timeZone: string) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L367)

### :gear: areDatesInSameMonth

Returns whether the month on the first date is the same as the month on the
second date. It also checks that the year is the same.

| Function              | Type                                                          |
| --------------------- | ------------------------------------------------------------- |
| `areDatesInSameMonth` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L380)

### :gear: isDateInCurrentMonth

Returns whether the given date is in the current month.

| Function               | Type                                                   |
| ---------------------- | ------------------------------------------------------ |
| `isDateInCurrentMonth` | `(date: string or SDate, timeZone: string) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L396)

### :gear: areDatesInSameYear

Returns whether the year on the first date is the same as the year on the
second date.

| Function             | Type                                                          |
| -------------------- | ------------------------------------------------------------- |
| `areDatesInSameYear` | `(date1: string or SDate, date2: string or SDate) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L409)

### :gear: isDateInCurrentYear

Returns whether the given date is in the current year.

| Function              | Type                                                   |
| --------------------- | ------------------------------------------------------ |
| `isDateInCurrentYear` | `(date: string or SDate, timeZone: string) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L424)

### :gear: sTime

Factory function for creating a new STime instance or returns the same
instance if already an instance of STime.

| Function | Type                               |
| -------- | ---------------------------------- |
| `sTime`  | `(time: string or STime) => STime` |

Parameters:

- `time`: An instance of STime that will be returned or a string in the
  ISO-8601 format (HH:MM).

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L20)

### :gear: getTimeNow

Returns the current time in the given time zone.

| Function     | Type                          |
| ------------ | ----------------------------- |
| `getTimeNow` | `(timeZone: string) => STime` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L35)

### :gear: getTimeAtMidnight

Returns the time at midnight (00:00).

| Function            | Type          |
| ------------------- | ------------- |
| `getTimeAtMidnight` | `() => STime` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L44)

### :gear: getTimeFromMinutes

Returns the time resulting from adding the given number of minutes to
midnight.

| Function             | Type                               |
| -------------------- | ---------------------------------- |
| `getTimeFromMinutes` | `(timeInMinutes: number) => STime` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L50)

### :gear: getHoursFromTime

Returns the hours part of the given time.

| Function           | Type                                |
| ------------------ | ----------------------------------- |
| `getHoursFromTime` | `(time: string or STime) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L63)

### :gear: getHoursStringFromTime

Returns the hours part of the given time as a string.

| Function                 | Type                                |
| ------------------------ | ----------------------------------- |
| `getHoursStringFromTime` | `(time: string or STime) => string` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L72)

### :gear: getMinutesFromTime

Returns the minutes part of the given time.

| Function             | Type                                |
| -------------------- | ----------------------------------- |
| `getMinutesFromTime` | `(time: string or STime) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L84)

### :gear: getMinutesStringFromTime

Returns the minutes part of the given time as a string.

| Function                   | Type                                |
| -------------------------- | ----------------------------------- |
| `getMinutesStringFromTime` | `(time: string or STime) => string` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L93)

### :gear: get12HourTimeString

Returns the time in the 12-hour format (HH:MM AM/PM).

| Function              | Type                                |
| --------------------- | ----------------------------------- |
| `get12HourTimeString` | `(time: string or STime) => string` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L102)

### :gear: getTimeInMinutes

Returns the time converted to minutes since midnight.

| Function           | Type                                                        |
| ------------------ | ----------------------------------------------------------- |
| `getTimeInMinutes` | `(time: string or STime, midnightIs24?: boolean) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L113)

### :gear: addMinutesToTime

Adds the given number of minutes to the given time. The time will wrap around
a 24 hour clock.

| Function           | Type                                                |
| ------------------ | --------------------------------------------------- |
| `addMinutesToTime` | `(time: string or STime, minutes: number) => STime` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L138)

### :gear: isSameTime

Returns whether the two times are the same.

| Function     | Type                                                          |
| ------------ | ------------------------------------------------------------- |
| `isSameTime` | `(time1: string or STime, time2: string or STime) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L165)

### :gear: isAfterTime

Returns whether the first time is after the second.

| Function      | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| `isAfterTime` | `(time1: string or STime, time2: string or STime) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L178)

### :gear: isSameTimeOrAfter

Returns whether the first time is the same or after the second.

| Function            | Type                                                          |
| ------------------- | ------------------------------------------------------------- |
| `isSameTimeOrAfter` | `(time1: string or STime, time2: string or STime) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L191)

### :gear: isBeforeTime

Returns whether the first time is before the second.

| Function       | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| `isBeforeTime` | `(time1: string or STime, time2: string or STime) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L204)

### :gear: isSameTimeOrBefore

Returns whether the first time is the same or before the second.

| Function             | Type                                                          |
| -------------------- | ------------------------------------------------------------- |
| `isSameTimeOrBefore` | `(time1: string or STime, time2: string or STime) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L217)

### :gear: isTimePM

Returns whether the given time is in the PM.

| Function   | Type                                 |
| ---------- | ------------------------------------ |
| `isTimePM` | `(time: string or STime) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L230)

### :gear: sTimestamp

Factory function for creating a new STimestamp instance or returns the same
instance if already an instance of STimestamp.

| Function     | Type                                              |
| ------------ | ------------------------------------------------- |
| `sTimestamp` | `(timestamp: string or STimestamp) => STimestamp` |

Parameters:

- `timestamp`: An instance of STimestamp that will be returned or a string
  in the ISO-8601 format (YYYY-MM-DDTHH:MM)

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L39)

### :gear: getTimestampFromUTCMilliseconds

Returns the current timestamp for the given UTC date in the given time zone.

| Function                          | Type                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| `getTimestampFromUTCMilliseconds` | `(utcDateInMilliseconds: number, timeZone: string) => STimestamp` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L54)

### :gear: getTimestampNow

Returns the current timestamp for the given time zone.

| Function          | Type                               |
| ----------------- | ---------------------------------- |
| `getTimestampNow` | `(timeZone: string) => STimestamp` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L66)

### :gear: getTimestampFromDateAndTime

Returns a timestamp for the given date and time.

| Function                      | Type                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| `getTimestampFromDateAndTime` | `(date: string or SDate, time: string or STime) => STimestamp` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L73)

### :gear: getTimeZonedDateFromTimestamp

Returns the native Date representation of the timestamp in the given time
zone.

| Function                        | Type                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `getTimeZonedDateFromTimestamp` | `(timestamp: string or STimestamp, timeZone: string) => Date` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L91)

### :gear: getSecondsToTimestamp

Returns the number of seconds from now to the given timestamp. If the
timestamp is in the future, the number of seconds will be positive. If the
timestamp is in the past, the number of seconds will be negative.

Daylight Saving Notes:

The following notes uses America/New_York as the time zone to explain how
Daylight Savings is handled, but it works the same across time zones on their
respective Daylight schedules as defined by Intl API.

Notice that when looking at a watch (that adjusts for Daylight Saving
automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
the time moves forward one hour) the times between 02:00 and 02:59 never happen
as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the day the
time zone goes back to Standard Time), the times between 01:00 and 01:59
happen twice as the first time the watch hits 02:00 it goes back to 01:00.

To account for time zone changes, this method converts the timestamp to UTC
milliseconds (for both the current time and the expected timestamp) before
calculating the difference in seconds. This works as expected for all times,
but the expectation for the transition times (those that don't happen on a
watch that automatically adjusts or that happen twice) it can work in
unexpected ways.

For example, trying to calculate the number of seconds to 2024-03-10T02:00
(the start of Daylight Saving Time) at 2024-03-10T01:59 (still in Standard
Time) will result in -3540 seconds (59 minutes in the past). A similar
situation happens when the time zone transitions from Daylight Saving Time to
Standard Time as can be derived from the table below.

In 'America/New_York'

| Transition to Eastern Daylight Time (EDT) in 2024 ----------------------------------------|
| America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT) | 2024-03-10T03:00(EST) |
| UTC | 2024-03-10T06:59 | 2024-03-10T06:00 | 2024-03-10T07:00 |

| Transition to Eastern Standard Time (EST) in 2024 ----------------------------------------|
| America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST) | 2024-11-03T03:00(EST) |
| UTC | 2024-11-03T05:59 | 2024-11-03T07:00 | 2024-11-03T08:00 |

| Function                | Type                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `getSecondsToTimestamp` | `(timestamp: string or STimestamp, timeZone: string) => number` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L147)

### :gear: getDateFromTimestamp

Returns the date part of the given timestamp.

| Function               | Type                                         |
| ---------------------- | -------------------------------------------- |
| `getDateFromTimestamp` | `(timestamp: string or STimestamp) => SDate` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L167)

### :gear: getTimeFromTimestamp

Returns the time part of the given timestamp.

| Function               | Type                                         |
| ---------------------- | -------------------------------------------- |
| `getTimeFromTimestamp` | `(timestamp: string or STimestamp) => STime` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L176)

### :gear: getShortTimestampString

Returns a string representation of the timestamp in the short format. The
short format is a combination of the short date and the 12-hour time.

| Function                  | Type                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `getShortTimestampString` | `(timestamp: string or STimestamp, timeZone: string, locale: LocalesArgument, options: STimestampShortStringOptions) => string` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L186)

### :gear: addDaysToTimestamp

Returns a new timestamp resulting from adding the given number of calendar
days (rather than 24-horu days) to the given timestamp. Becaues it adds
calendar days rather than 24-hour days, this operation is not affected by
time zones.

| Function             | Type                                                            |
| -------------------- | --------------------------------------------------------------- |
| `addDaysToTimestamp` | `(timestamp: string or STimestamp, days: number) => STimestamp` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L215)

### :gear: addMinutesToTimestamp

Returns a new timestamp resulting from adding the given number of minutes to
the given timestamp. Time is converted from the given time zone to UTC before
the minutes are added, and then converted back to the specified time zone.
This results in the resulting time being adjusted for daylight saving time
changes. (e.g. Adding 60 minutes to 2024-03-10T01:59 in America/New_York will
result in 2024-03-10T03:59 as time move forward one hour for daylight saving
time at 2024-03-10T02:00.)

| Function                | Type                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `addMinutesToTimestamp` | `(timestamp: string or STimestamp, minutes: number, timeZone: string) => STimestamp` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L236)

### :gear: isSameTimestamp

Returns true if the two timestamps are the same.

| Function          | Type                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| `isSameTimestamp` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L262)

### :gear: isBeforeTimestamp

Returns true if the first timestamp is before the second timestamp.

| Function            | Type                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `isBeforeTimestamp` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L275)

### :gear: isSameTimestampOrBefore

Returns true if the first timestamp is the same or before the second
timestamp.

| Function                  | Type                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| `isSameTimestampOrBefore` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L289)

### :gear: isAfterTimestamp

Returns true if the first timestamp is after the second timestamp.

| Function           | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `isAfterTimestamp` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L302)

### :gear: isSameTimestampOrAfter

Returns true if the first timestamp is the same or after the second

| Function                 | Type                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| `isSameTimestampOrAfter` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L315)

### :gear: sWeekdays

Factory function for creating a new SWeekdays instance or returns the
instance if already an instance of SWeekdays.

| Function    | Type                                           |
| ----------- | ---------------------------------------------- |
| `sWeekdays` | `(weekdays: string or SWeekdays) => SWeekdays` |

Parameters:

- `weekdays`: An instance of SWeekdays that will be returned or a string
  in the format 'SMTWTFS'. Each in the string represents a weekday starting
  on Sunday and ending on Saturday using the first letter of the english word
  for the week day. If the weekday is excluded, the position is filled with a
  '-' character. E.g. in 'SM----S', the weekdays Sunday, Monday, and Saturday
  are included while the rest are excluded.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L36)

### :gear: getWeekdaysFromWeekdayFlags

Returns a new SWeekdays instance with all provided weekdays included. The
provided weekdays can be any combination of the Weekday enum values. e.g.
`Weekday.Monday | Weekday.Wednesday | Weekday.Friday`.

| Function                      | Type                               |
| ----------------------------- | ---------------------------------- |
| `getWeekdaysFromWeekdayFlags` | `(weekdays: Weekday) => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L53)

### :gear: getWeekdaysWithAllIncluded

Returns a new SWeekdays instance with all weekdays included.

| Function                     | Type              |
| ---------------------------- | ----------------- |
| `getWeekdaysWithAllIncluded` | `() => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L70)

### :gear: getWeekdaysWithNoneIncluded

Returns a new SWeekdays instance with no weekdays included.

| Function                      | Type              |
| ----------------------------- | ----------------- |
| `getWeekdaysWithNoneIncluded` | `() => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L77)

### :gear: shiftWeekdaysForward

Returns a new SWeekdays instance with the weekdays shifted forward by one
day. e.g. 'SM----S' becomes 'SMT----'.

| Function               | Type                                           |
| ---------------------- | ---------------------------------------------- |
| `shiftWeekdaysForward` | `(weekdays: string or SWeekdays) => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L89)

### :gear: filterWeekdaysForDates

Returns a new SWeekdays where only the weekdays that are both included in the
provided weekdays that are within the date range are included.

| Function                 | Type                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `filterWeekdaysForDates` | `(weekdays: string or SWeekdays, fromDate: string or SDate, toDate: string or SDate) => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L113)

### :gear: addWeekdayToWeekdays

Returns a new SWeekdays instance with the provided weekday added to the
current set of weekdays.

| Function               | Type                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `addWeekdayToWeekdays` | `(weekdays: string or SWeekdays, weekdayToAdd: Weekday) => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L156)

### :gear: doesWeekdaysIncludeWeekday

Returns true if the provided weekdays include the provided weekday.

| Function                     | Type                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| `doesWeekdaysIncludeWeekday` | `(weekdays: string or SWeekdays, weekday: Weekday) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L176)

### :gear: doesWeekdaysHaveOverlapWithWeekdays

Returns true if any of the included weekdays in weekdays1 is also included in
weekdays2.

| Function                              | Type                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `doesWeekdaysHaveOverlapWithWeekdays` | `(weekdays1: string or SWeekdays, weekdays2: string or SWeekdays) => boolean` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L190)

## :nut_and_bolt: Enum

- [Weekday](#gear-weekday)

### :gear: Weekday

| Property | Type | Description |
| -------- | ---- | ----------- |
| `Sun`    | `1`  |             |
| `Mon`    | `2`  |             |
| `Tue`    | `4`  |             |
| `Wed`    | `8`  |             |
| `Thu`    | `16` |             |
| `Fri`    | `32` |             |
| `Sat`    | `64` |             |

<!-- TSDOC_END -->
