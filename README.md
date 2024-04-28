# scDate

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/scdate.svg?style=flat-square)](https://npmjs.org/package/scdate)

Date and time library optimized for dealing with schedules.

_`scdate` is in active pre-release development so there may be breaking changes until v1.0.0 is released._

Features:

- Supports dates, times, and time stamps
- Time zone required for operations only when relevant
- Serializable to simple ISO formatted string

## Time zones

For a list of valid time zones run `Intl.supportedValuesOf('timeZone')` in your environment.

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
- [get12HoursHoursStringFromTime](#gear-get12hourshoursstringfromtime)
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

Returns a new SDate instance.

| Function | Type                               |
| -------- | ---------------------------------- |
| `sDate`  | `(date: string or SDate) => SDate` |

Parameters:

- `date`: An instance of SDate or a string in the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L34)

### :gear: getDateToday

Returns a new SDate instance with the current date in the given time zone.

| Function       | Type                          |
| -------------- | ----------------------------- |
| `getDateToday` | `(timeZone: string) => SDate` |

Parameters:

- `timeZone`: The time zone to get the current date for. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L52)

### :gear: getNextDateByWeekday

Returns a new SDate instance set to the next date after the provided date
that match the given weekday.

| Function               | Type                                                 |
| ---------------------- | ---------------------------------------------------- |
| `getNextDateByWeekday` | `(date: string or SDate, weekday: Weekday) => SDate` |

Parameters:

- `date`: The date to start from (not included). It can be an SDate or a
  string in the YYYY-MM-DD format.
- `weekday`: The weekday to find the next date for.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L66)

### :gear: getPreviousDateByWeekday

Returns a new SDate instance set to date that is before the provided date and
matches the given weekday.

| Function                   | Type                                                 |
| -------------------------- | ---------------------------------------------------- |
| `getPreviousDateByWeekday` | `(date: string or SDate, weekday: Weekday) => SDate` |

Parameters:

- `date`: The date to start from (not included).
- `weekday`: The weekday to find the previous date for. It can be an SDate
  or a string in the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L95)

### :gear: getDateForFirstDayOfMonth

Returns a new SDate instance set to the first day of the month for the
provided date.

| Function                    | Type                               |
| --------------------------- | ---------------------------------- |
| `getDateForFirstDayOfMonth` | `(date: string or SDate) => SDate` |

Parameters:

- `date`: The date to get the first day of the month for. It can be an
  SDate or a string in the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L123)

### :gear: getDateForLastDayOfMonth

Returns a new SDate instance set to the last day of the month for the
provided date.

| Function                   | Type                               |
| -------------------------- | ---------------------------------- |
| `getDateForLastDayOfMonth` | `(date: string or SDate) => SDate` |

Parameters:

- `date`: The date to get the last day of the month for. It can be an SDate
  or a string in the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L138)

### :gear: getYearFromDate

Returns the year from the given date.

| Function          | Type                                |
| ----------------- | ----------------------------------- |
| `getYearFromDate` | `(date: string or SDate) => number` |

Parameters:

- `date`: The date to get the year from. It can be an SDate or a string in
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L156)

### :gear: getMonthFromDate

Returns the month from the given date. Returns a 0-index value (i.e. Janary
is 0 and December is 11) to match the result from native Date object.

| Function           | Type                                |
| ------------------ | ----------------------------------- |
| `getMonthFromDate` | `(date: string or SDate) => number` |

Parameters:

- `date`: The date to get the month from. It can be an SDate or a string in
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L169)

### :gear: getDateFromDate

Returns the day of the month from the given date.

| Function          | Type                                |
| ----------------- | ----------------------------------- |
| `getDateFromDate` | `(date: string or SDate) => number` |

Parameters:

- `date`: The date to get the day from. It can be an SDate or a string in
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L181)

### :gear: getWeekdayFromDate

Returns the day of the week from the given date (Sunday to Saturday / 0 to
6).

| Function             | Type                                |
| -------------------- | ----------------------------------- |
| `getWeekdayFromDate` | `(date: string or SDate) => number` |

Parameters:

- `date`: The date to get the weekday from. It can be an SDate or a string
  in the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L194)

### :gear: getTimeZonedDateFromDate

Returns a native Date adjusted so that the local time of that date matches
the local time at the specified time zone.

| Function                   | Type                                                |
| -------------------------- | --------------------------------------------------- |
| `getTimeZonedDateFromDate` | `(date: string or SDate, timeZone: string) => Date` |

Parameters:

- `date`: The date to get the time zoned date from. It can be an SDate or a
  string in the YYYY-MM-DD format.
- `timeZone`: The time zone to adjust the date to. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L210)

### :gear: getDaysBetweenDates

Returns the number of days between the first date to the second date. The
value is positive if the first date is before the second date, and negative
if the first date is after the second date. This accounts for calendar days
and not full 24-hour periods which could be different due to daylight saving
adjustments.

| Function              | Type                                                         |
| --------------------- | ------------------------------------------------------------ |
| `getDaysBetweenDates` | `(date1: string or SDate, date2: string or SDate) => number` |

Parameters:

- `date1`: The first date to get the days between. It can be an SDate or a
  string in the YYYY-MM-DD format.
- `date2`: The second date to get the days between. It can be an SDate or a
  string in the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L235)

### :gear: getFullDateString

Returns a string representation that includes all of the date components of
the given date formatted according to the given locale.

| Function            | Type                                                         |
| ------------------- | ------------------------------------------------------------ |
| `getFullDateString` | `(date: string or SDate, locale: LocalesArgument) => string` |

Parameters:

- `date`: The date to get the full string representation for. It can be an
  SDate or a string in the YYYY-MM-DD format.
- `locale`: The locale to use for the string representation.

Examples:

```ts
getFullDateString('2021-02-05', 'es')
//=> 'viernes, 5 de febrero de 2021'
```

```ts
getFullDateString('2021-02-05', 'en')
//=> 'Friday, February 5, 2021'
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L268)

### :gear: getShortDateString

Get the short string representation of the given date in the given locale.

| Function             | Type                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `getShortDateString` | `(date: string or SDate, timeZone: string, locale: LocalesArgument, options: SDateShortStringOptions) => string` |

Parameters:

- `date`: The date to get the short string representation for. It can be an
  SDate or a string in the YYYY-MM-DD format.
- `timeZone`: The time zone used to determine if in the current year. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
- `locale`: The locale to use for the string representation.
- `options`: The options to customize the short string representation.

Examples:

```ts
getShortDateString('2021-02-05', TestLocalTimeZone, 'en', {
  onTodayText,
  includeWeekday: false,
}),
//=> 'Feb 5' (year is not shown when in the current year)
```

```ts
getShortDateString('2021-02-05', TestLocalTimeZone, 'es', {
  onTodayText,
  includeWeekday: true,
})
//=> 'vie, 5 feb 21' (year when not in current year)
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L309)

### :gear: addDaysToDate

Returns a new SDates instance with the date resulting from adding the given
number of days to the given date. Because it adds calendar days rather than
24-hour days, this operation is not affected by time zones.

| Function        | Type                                             |
| --------------- | ------------------------------------------------ |
| `addDaysToDate` | `(date: string or SDate, days: number) => SDate` |

Parameters:

- `date`: The date to add days to. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `days`: The number of days to add to the date.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L346)

### :gear: addMonthsToDate

Returns a new SDate instance with the date resulting from adding the given
number of months to the given date. Because it just adds to the month
component of the date, this operation is not affected by time zones.

| Function          | Type                                               |
| ----------------- | -------------------------------------------------- |
| `addMonthsToDate` | `(date: string or SDate, months: number) => SDate` |

Parameters:

- `date`: The date to add months to. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `months`: The number of months to add to the date.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L364)

### :gear: addYearsToDate

Returns a new SDate instance with the date resulting from adding the given
number of years to the given date. Because this only adds to the year
component of the date, this method is not affected by leap years.

| Function         | Type                                              |
| ---------------- | ------------------------------------------------- |
| `addYearsToDate` | `(date: string or SDate, years: number) => SDate` |

Parameters:

- `date`: The date to add years to. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `years`: The number of years to add to the date.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L385)

### :gear: isSameDate

Returns true when the two given dates represent the same day and false
otherwise.

| Function     | Type                                                          |
| ------------ | ------------------------------------------------------------- |
| `isSameDate` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L407)

### :gear: isBeforeDate

Returns true when the first date represents a date before the second date and
false otherwise.

| Function       | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| `isBeforeDate` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L426)

### :gear: isSameDateOrBefore

Returns true when the first date represents a date that happens on the same
date or before the second date and false otherwise.

| Function             | Type                                                          |
| -------------------- | ------------------------------------------------------------- |
| `isSameDateOrBefore` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in the
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L445)

### :gear: isAfterDate

Returns true when the first date represents a date that happens after the
second date and false otherwise.

| Function      | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| `isAfterDate` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in the
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L464)

### :gear: isSameDateOrAfter

Returns true when the first date represents a date that happens on the same
date or after the second date and false otherwise.

| Function            | Type                                                          |
| ------------------- | ------------------------------------------------------------- |
| `isSameDateOrAfter` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in the
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L483)

### :gear: isDateToday

Returns true when the date is today and false otherwise.

| Function      | Type                                                   |
| ------------- | ------------------------------------------------------ |
| `isDateToday` | `(date: string or SDate, timeZone: string) => boolean` |

Parameters:

- `date`: The date to check if it is today. It can be an SDate or a string
  in the YYYY-MM-DD format.
- `timeZone`: The time zone to check if the date is today. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L501)

### :gear: areDatesInSameMonth

Returns true when the month on the first date is the same as the month on the
second date. It also checks that the year is the same. Returns false
otherwise.

| Function              | Type                                                          |
| --------------------- | ------------------------------------------------------------- |
| `areDatesInSameMonth` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in
  the YYYY-MM-DD format.

Examples:

```ts
areDatesInSameMonth('2021-02-05', '2021-02-15')
//=> true
```

```ts
areDatesInSameMonth('2022-02-05', '2023-02-15')
//=> false (different years)
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L532)

### :gear: isDateInCurrentMonth

Returns true when the date represents a date in the current month and year.
Returns false otherwise.

| Function               | Type                                                   |
| ---------------------- | ------------------------------------------------------ |
| `isDateInCurrentMonth` | `(date: string or SDate, timeZone: string) => boolean` |

Parameters:

- `date`: The date to check if it is in the current month. It can be an
  SDate or a string in the YYYY-MM-DD format.
- `timeZone`: The time zone to check if the date is in the current month.
  See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L554)

### :gear: areDatesInSameYear

Returns true when the year of the first date is the same as the year on the
second date. Returns false otherwise.

| Function             | Type                                                          |
| -------------------- | ------------------------------------------------------------- |
| `areDatesInSameYear` | `(date1: string or SDate, date2: string or SDate) => boolean` |

Parameters:

- `date1`: The first date to compare. It can be an SDate or a string in the
  YYYY-MM-DD format.
- `date2`: The second date to compare. It can be an SDate or a string in
  the YYYY-MM-DD format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L572)

### :gear: isDateInCurrentYear

Returns true when the year component of the date matches the current year in
the given time zone. Returns false otherwise.

| Function              | Type                                                   |
| --------------------- | ------------------------------------------------------ |
| `isDateInCurrentYear` | `(date: string or SDate, timeZone: string) => boolean` |

Parameters:

- `date`: The date to check if it is in the current year. It can be an
  SDate or a string in the YYYY-MM-DD format.
- `timeZone`: The time zone to check if the date is in the current year.
  See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sDate.ts#L593)

### :gear: sTime

Returns a new STime instance.

| Function | Type                               |
| -------- | ---------------------------------- |
| `sTime`  | `(time: string or STime) => STime` |

Parameters:

- `time`: And instance of STime or a string in the format 'HH:MM'.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L19)

### :gear: getTimeNow

Returns a new STime instance with the current time in the given time zone.

| Function     | Type                          |
| ------------ | ----------------------------- |
| `getTimeNow` | `(timeZone: string) => STime` |

Parameters:

- `timeZone`: The time zone to get the current time in. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L37)

### :gear: getTimeAtMidnight

Returns a new STime instance with the time at midnight (00:00).

| Function            | Type          |
| ------------------- | ------------- |
| `getTimeAtMidnight` | `() => STime` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L46)

### :gear: getTimeFromMinutes

Returns a new STime instance with the time resulting from adding the given
number of minutes to midnight (00:00).

| Function             | Type                               |
| -------------------- | ---------------------------------- |
| `getTimeFromMinutes` | `(timeInMinutes: number) => STime` |

Parameters:

- `timeInMinutes`: The number of minutes to add to midnight.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L54)

### :gear: getHoursFromTime

Returns the hours from the given time.

| Function           | Type                                |
| ------------------ | ----------------------------------- |
| `getHoursFromTime` | `(time: string or STime) => number` |

Parameters:

- `time`: The time to get the hours from. It can be an STime or a string
  in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L70)

### :gear: get12HoursHoursStringFromTime

Returns the hours from given time as a string (1 - 12).

| Function                        | Type                                |
| ------------------------------- | ----------------------------------- |
| `get12HoursHoursStringFromTime` | `(time: string or STime) => string` |

Parameters:

- `time`: The time to get the hours from. It can be an STime or a string
  in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L82)

### :gear: getMinutesFromTime

Returns the minutes from the given time.

| Function             | Type                                |
| -------------------- | ----------------------------------- |
| `getMinutesFromTime` | `(time: string or STime) => number` |

Parameters:

- `time`: The time to get the minutes from. It can be an STime or a string
  in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L97)

### :gear: getMinutesStringFromTime

Returns the minutes from given time as a string (00-59).

| Function                   | Type                                |
| -------------------------- | ----------------------------------- |
| `getMinutesStringFromTime` | `(time: string or STime) => string` |

Parameters:

- `time`: The time to get the minutes from. It can be an STime or a string
  in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L109)

### :gear: get12HourTimeString

Returns a string that represents the time in a 12-hour format (HH:MM AM/PM).

| Function              | Type                                |
| --------------------- | ----------------------------------- |
| `get12HourTimeString` | `(time: string or STime) => string` |

Parameters:

- `time`: The time to get the string from. It can be an STime or a string
  in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L121)

### :gear: getTimeInMinutes

Returns the time converted to minutes since midnight.

| Function           | Type                                                        |
| ------------------ | ----------------------------------------------------------- |
| `getTimeInMinutes` | `(time: string or STime, midnightIs24?: boolean) => number` |

Parameters:

- `time`: The time to get the minutes from. It can be an STime or a string
  in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L135)

### :gear: addMinutesToTime

Returns a new STime instance with the time resulting from adding the given
number of minutes to the given time. The time will wrap around a 24 hour
clock.

| Function           | Type                                                |
| ------------------ | --------------------------------------------------- |
| `addMinutesToTime` | `(time: string or STime, minutes: number) => STime` |

Parameters:

- `time`: The time to add the minutes to. It can be an STime or a string
  in the HH:MM format.
- `minutes`: The number of minutes to add.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L165)

### :gear: isSameTime

Returns true when the two times are the same and false otherwise.

| Function     | Type                                                          |
| ------------ | ------------------------------------------------------------- |
| `isSameTime` | `(time1: string or STime, time2: string or STime) => boolean` |

Parameters:

- `time1`: The first time to compare. It can be an STime or a string in the
  HH:MM format.
- `time2`: The second time to compare. It can be an STime or a string in
  the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L197)

### :gear: isAfterTime

Returns true when first time represents a time that happens after the second
time. Returns false otherwise.

| Function      | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| `isAfterTime` | `(time1: string or STime, time2: string or STime) => boolean` |

Parameters:

- `time1`: The first time to compare. It can be an STime or a string in the
  HH:MM format.
- `time2`: The second time to compare. It can be an STime or a string in
  the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L216)

### :gear: isSameTimeOrAfter

Returns true when first time represents a time that happens after or at the
same time as the second time. Returns false otherwise.

| Function            | Type                                                          |
| ------------------- | ------------------------------------------------------------- |
| `isSameTimeOrAfter` | `(time1: string or STime, time2: string or STime) => boolean` |

Parameters:

- `time1`: The first time to compare. It can be an STime or a string in the
  HH:MM format.
- `time2`: The second time to compare. It can be an STime or a string in
  the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L235)

### :gear: isBeforeTime

Returns true when first time represents a time that happens before the
second time. Returns false otherwise.

| Function       | Type                                                          |
| -------------- | ------------------------------------------------------------- |
| `isBeforeTime` | `(time1: string or STime, time2: string or STime) => boolean` |

Parameters:

- `time1`: The first time to compare. It can be an STime or a string in the
  HH:MM format.
- `time2`: The second time to compare. It can be an STime or a string in
  the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L254)

### :gear: isSameTimeOrBefore

Returns true when first time represents a time that happens before or at the
same time as the second time. Returns false otherwise.

| Function             | Type                                                          |
| -------------------- | ------------------------------------------------------------- |
| `isSameTimeOrBefore` | `(time1: string or STime, time2: string or STime) => boolean` |

Parameters:

- `time1`: The first time to compare. It can be an STime or a string in the
  HH:MM format.
- `time2`: The second time to compare. It can be an STime or a string in
  the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L273)

### :gear: isTimePM

Returns true when the given time is at or after noon (12:00) and false
otherwise.

| Function   | Type                                 |
| ---------- | ------------------------------------ |
| `isTimePM` | `(time: string or STime) => boolean` |

Parameters:

- `time`: The time to check. It can be an STime or a string in the HH:MM
  format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTime.ts#L290)

### :gear: sTimestamp

Returns a new STimestamp instance.

| Function     | Type                                              |
| ------------ | ------------------------------------------------- |
| `sTimestamp` | `(timestamp: string or STimestamp) => STimestamp` |

Parameters:

- `timestamp`: An instance of STimestamp or a string in the
  YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L33)

### :gear: getTimestampFromUTCMilliseconds

Returns a new STimestamp instance set to the date and time that results from
converting the given number of milliseconds since the Unix epoch to the given
time zone.

| Function                          | Type                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| `getTimestampFromUTCMilliseconds` | `(utcDateInMilliseconds: number, timeZone: string) => STimestamp` |

Parameters:

- `utcDateInMilliseconds`: The number of milliseconds since the Unix epoch.
- `timeZone`: The time zone to use when creating the timestamp. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L54)

### :gear: getTimestampNow

Returns a new STimestamp instance set to the current date and time in the
given time zone.

| Function          | Type                               |
| ----------------- | ---------------------------------- |
| `getTimestampNow` | `(timeZone: string) => STimestamp` |

Parameters:

- `timeZone`: The time zone to use when creating the timestamp. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L70)

### :gear: getTimestampFromDateAndTime

Returns a new STimestamp instance set to the date and time that results from
combining the given date and time.

| Function                      | Type                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| `getTimestampFromDateAndTime` | `(date: string or SDate, time: string or STime) => STimestamp` |

Parameters:

- `date`: The date to use when creating the timestamp. It can be an SDate
  or a string in the YYYY-MM-DD format.
- `time`: The time to use when creating the timestamp. It can be an STime
  or a string in the HH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L83)

### :gear: getTimeZonedDateFromTimestamp

Returns a native Date adjusted so that the local time of that date matches
the local timestamp at the specified time zone.

| Function                        | Type                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `getTimeZonedDateFromTimestamp` | `(timestamp: string or STimestamp, timeZone: string) => Date` |

Parameters:

- `date`: The date to get the time zoned date from. It can be an SDate or a
  string in the YYYY-MM-DD format.
- `timeZone`: The time zone to adjust the date to. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L106)

### :gear: getSecondsToTimestamp

Returns the number of seconds from now to the given timestamp. If the
timestamp is in the future, the number of seconds will be positive. If the
timestamp is in the past, the number of seconds will be negative.

Daylight Saving Notes:

The following notes use `America/New_York` as the time zone to explain how
Daylight Savings is handled, but it works the same across time zones on their
respective Daylight Saving schedules as defined by Intl API.

Notice that when looking at a watch (that adjusts for Daylight Saving
automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
the time moves forward one hour) the times between 02:00 and 02:59 never
happen as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the
day the time zone goes back to Standard Time), the times between 01:00 and
01:59 happen twice as the first time the watch hits 02:00 it goes back to
01:00.

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

Transition to Eastern Daylight Time (EDT) in 2024
| Time Zone | T1 | T2 | T3 |
|------------------|-----------------------|------------------------|-----------------------|
| America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT) | 2024-03-10T03:00(EST) |
| UTC | 2024-03-10T06:59 | 2024-03-10T06:00 | 2024-03-10T07:00 |

Transition to Eastern Standard Time (EST) in 2024
| Time Zone | T1 | T2 | T3 |
|------------------|-----------------------|------------------------|-----------------------|
| America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST) | 2024-11-03T03:00(EST) |
| UTC | 2024-11-03T05:59 | 2024-11-03T07:00 | 2024-11-03T08:00 |

| Function                | Type                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `getSecondsToTimestamp` | `(timestamp: string or STimestamp, timeZone: string) => number` |

Parameters:

- `timestamp`: The timestamp to get the seconds to. It can be an STimestamp
  or a string in the YYYY-MM-DDTHH:MM format.
- `timeZone`: The time zone to use when creating the timestamp. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L171)

### :gear: getDateFromTimestamp

Returns a new SDate instance set to the date part of the given timestamp.

| Function               | Type                                         |
| ---------------------- | -------------------------------------------- |
| `getDateFromTimestamp` | `(timestamp: string or STimestamp) => SDate` |

Parameters:

- `timestamp`: The timestamp to get the date from. It can be an STimestamp
  or a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L194)

### :gear: getTimeFromTimestamp

Returns a new STime instance set to the time part of the given timestamp.

| Function               | Type                                         |
| ---------------------- | -------------------------------------------- |
| `getTimeFromTimestamp` | `(timestamp: string or STimestamp) => STime` |

Parameters:

- `timestamp`: The timestamp to get the time from. It can be an STimestamp
  or a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L206)

### :gear: getShortTimestampString

Returns a string representation that includes a minimum set of components
from the given timestamp. This is a combination of the the results of
the `getShortDateString` method, and `get12HourTimeString`.

| Function                  | Type                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `getShortTimestampString` | `(timestamp: string or STimestamp, timeZone: string, locale: LocalesArgument, options: STimestampShortStringOptions) => string` |

Parameters:

- `timestamp`: The timestamp to get the short string from. It can be an
  STimestamp or a string in the YYYY-MM-DDTHH:MM format.
- `timeZone`: The time zone to use when creating the short string. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.
- `locale`: The locale to use for the string representation.
- `options`: An object with options for the short string representation.

Examples:

```ts
// Example when the timestamp is today
getShortTimestampString('2021-08-10T08:00', 'America/Puerto_Rico', 'en', {
  includeWeekday: true,
  onTodayAtText: () => 'Today at',
})
//=> 'Today at 8:00 AM'
```

```ts
// Example when the timestamp is not today
getShortTimestampString('2022-09-11T08:00', 'America/Puerto_Rico', 'es', {
  includeWeekday: true,
  onTodayAtText: () => 'Hoy a las',
})
//=> 'dom, 11 sept 22 8:00 AM'
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L244)

### :gear: addDaysToTimestamp

Returns a new STimestamp instance resulting from adding the given number of
calendar days to the given timestamp. Because it adds calendar days rather
than 24-hour days, this operation is not affected by time zones.

| Function             | Type                                                            |
| -------------------- | --------------------------------------------------------------- |
| `addDaysToTimestamp` | `(timestamp: string or STimestamp, days: number) => STimestamp` |

Parameters:

- `timestamp`: The timestamp to add days to. It can be an STimestamp or a
  string in the YYYY-MM-DDTHH:MM format.
- `days`: The number of days to add to the timestamp.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L276)

### :gear: addMinutesToTimestamp

Returns a new STimestamp instance resulting from adding the given number of
minutes to the given timestamp.

Daylight Saving Time Notes:

The following notes use `America/New_York` as the time zone to explain how
Daylight Savings is handled, but it works the same across time zones on their
respective Daylight Saving schedules as defined by Intl API.

Notice that when looking at a watch (that adjusts for Daylight Saving
automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
the time moves forward one hour) the times between 02:00 and 02:59 never
happen as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the
day the time zone goes back to Standard Time), the times between 01:00 and
01:59 happen twice as the first time the watch hits 02:00 it goes back to
01:00.

To account for time zone changes, this method converts the timestamp to UTC
milliseconds before adding the specified minutes. This works as expected for
all times, but the expectation for the transition times (those that don't
happen on a watch that automatically adjusts or that happen twice) it can
work in unexpected ways.

Time is converted from the given time zone to
UTC before the minutes are added, and then converted back to the specified
time zone. This results in the resulting time being adjusted for daylight saving time
changes. (e.g. Adding 60 minutes to 2024-03-10T01:59 in America/New_York will
result in 2024-03-10T03:59 as time move forward one hour for daylight saving
time at 2024-03-10T02:00.)

For example, adding one minute to 2024-03-10T01:59 will result in
2024-03-10T03:00 as expected. However, trying to add one minute to
2024-03-10T02:00 (a time that technically does not exist on a watch that
automatically adjusts for Daylight Saving) will result in 2024-03-10T01:01.
This is because 2024-03-10T02:00 is converted to 2024-03-10T06:00 UTC (due
to timezone offset being -4 starting from 02:00 local time) and one minute
later would be 2024-03-10T06:01 UTC which would be 2024-03-10T01:01 in
`America/New_York`. A similar situation happens when the time zone
transitions from Daylight Saving Time to Standard Time as can be derived from
the table below.

In 'America/New_York'

Transition to Eastern Daylight Time (EDT) in 2024
| Time Zone | T1 | T2 | T3 |
|------------------|-----------------------|------------------------|-----------------------|
| America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT) | 2024-03-10T03:00(EST) |
| UTC | 2024-03-10T06:59 | 2024-03-10T06:00 | 2024-03-10T07:00 |

Transition to Eastern Standard Time (EST) in 2024
| Time Zone | T1 | T2 | T3 |
|------------------|-----------------------|------------------------|-----------------------|
| America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST) | 2024-11-03T03:00(EST) |
| UTC | 2024-11-03T05:59 | 2024-11-03T07:00 | 2024-11-03T08:00 |

| Function                | Type                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `addMinutesToTimestamp` | `(timestamp: string or STimestamp, minutes: number, timeZone: string) => STimestamp` |

Parameters:

- `timestamp`: The timestamp to add minutes to. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.
- `minutes`: The number of minutes to add to the timestamp.
- `timeZone`: The time zone to use when creating the timestamp. See
  `Intl.supportedValuesOf('timeZone')` for a list of valid time zones.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L350)

### :gear: isSameTimestamp

Returns true if the two timestamps represent the same date and time. Returns
false otherwise.

| Function          | Type                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| `isSameTimestamp` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

Parameters:

- `timestamp1`: The first timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.
- `timestamp2`: The second timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L382)

### :gear: isBeforeTimestamp

Returns true if the first timestamp represents a date and time that happens
before the second timestamp. Returns false otherwise.

| Function            | Type                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `isBeforeTimestamp` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

Parameters:

- `timestamp1`: The first timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.
- `timestamp2`: The second timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L401)

### :gear: isSameTimestampOrBefore

Returns true if the first timestamp represents a date and time that happens
on or before the second timestamp. Returns false otherwise.

| Function                  | Type                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| `isSameTimestampOrBefore` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

Parameters:

- `timestamp1`: The first timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.
- `timestamp2`: The second timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L420)

### :gear: isAfterTimestamp

Returns true if the first timestamp represents a date and time that happens
after the second timestamp. Returns false otherwise.

| Function           | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `isAfterTimestamp` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

Parameters:

- `timestamp1`: The first timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.
- `timestamp2`: The second timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L439)

### :gear: isSameTimestampOrAfter

Returns true if the first timestamp represents a date and time that happens
on or after the second timestamp. Returns false otherwise.

| Function                 | Type                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| `isSameTimestampOrAfter` | `(timestamp1: string or STimestamp, timestamp2: string or STimestamp) => boolean` |

Parameters:

- `timestamp1`: The first timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.
- `timestamp2`: The second timestamp to compare. It can be an STimestamp or
  a string in the YYYY-MM-DDTHH:MM format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sTimestamp.ts#L458)

### :gear: sWeekdays

Returns a new SWeekdays instance.

| Function    | Type                                           |
| ----------- | ---------------------------------------------- |
| `sWeekdays` | `(weekdays: string or SWeekdays) => SWeekdays` |

Parameters:

- `weekdays`: An instance of SWeekdays that will be returned or a string in
  the SMTWTFS format. Each character in the string represents a weekday
  starting on Sunday and ending on Saturday using the first letter of the
  English word for the week day. If the weekday is excluded, the position is
  filled with a '-' character.

Examples:

```ts
sWeekdays('SM----S')
// Returns an instance of SWeekdays with the weekdays Sunday, Monday, and
// Saturday included while the rest are excluded.
```

```ts
sWeekdays('SMTWTFS')
// Returns an instance of SWeekdays with all weekdays included.
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L48)

### :gear: getWeekdaysFromWeekdayFlags

Returns a new SWeekdays instance with all provided weekdays included. The
provided weekdays can be any combination of the Weekday enum values.

| Function                      | Type                               |
| ----------------------------- | ---------------------------------- |
| `getWeekdaysFromWeekdayFlags` | `(weekdays: Weekday) => SWeekdays` |

Parameters:

- `weekdays`: A combination of the Weekday enum values.

Examples:

```ts
getWeekdaysFromWeekdayFlags(Weekday.Monday | Weekday.Wednesday | Weekday.Friday)
// Returns an instance of SWeekdays with the weekdays Monday, Wednesday, and
// Friday included while the rest are excluded.
```

```ts
getWeekdaysFromWeekdayFlags(Weekday.Tuesday)
// Returns an instance of SWeekdays with the weekday Tuesday included while
// the rest are excluded.
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L80)

### :gear: getWeekdaysWithAllIncluded

Returns a new SWeekdays instance with all weekdays included.

| Function                     | Type              |
| ---------------------------- | ----------------- |
| `getWeekdaysWithAllIncluded` | `() => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L97)

### :gear: getWeekdaysWithNoneIncluded

Returns a new SWeekdays instance with no weekdays included.

| Function                      | Type              |
| ----------------------------- | ----------------- |
| `getWeekdaysWithNoneIncluded` | `() => SWeekdays` |

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L104)

### :gear: shiftWeekdaysForward

Returns a new SWeekdays instance with the weekdays shifted forward by one
day.

| Function               | Type                                           |
| ---------------------- | ---------------------------------------------- |
| `shiftWeekdaysForward` | `(weekdays: string or SWeekdays) => SWeekdays` |

Parameters:

- `weekdays`: The weekdays to shift forward. It can be an SWeekdays or a
  string in the SMTWTFS format.

Examples:

```ts
shiftWeekdaysForward('SM----S')
// Returns an instance of SWeekdays with the weekdays shifted forward by one
// day. 'SM----S' becomes 'SMT----'.
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L126)

### :gear: filterWeekdaysForDates

Returns a new SWeekdays instance where only the weekdays that are within the
provided date range are included.

| Function                 | Type                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `filterWeekdaysForDates` | `(weekdays: string or SWeekdays, fromDate: string or SDate, toDate: string or SDate) => SWeekdays` |

Parameters:

- `weekdays`: The weekdays to filter. It can be an SWeekdays or a string in
  the SMTWTFS format.
- `fromDate`: The start date of the range. It can be an SDate or a string
  in the YYYY-MM-DD format.
- `toDate`: The end date of the range. It can be an SDate or a string in
  the YYYY-MM-DD format.

Examples:

```ts
filterWeekdaysForDates('SMTWTFS', '2020-03-05', '2020-03-05')
// Returns an instance of SWeekdays with only Thursday included.
```

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L163)

### :gear: addWeekdayToWeekdays

Returns a new SWeekdays instance with the provided weekday added to the
current set of weekdays.

| Function               | Type                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| `addWeekdayToWeekdays` | `(weekdays: string or SWeekdays, weekdayToAdd: Weekday) => SWeekdays` |

Parameters:

- `weekdays`: The weekdays to add the weekday to. It can be an SWeekdays or
  a string in the SMTWTFS format.
- `weekdayToAdd`: The weekday to add.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L210)

### :gear: doesWeekdaysIncludeWeekday

Returns true if the provided weekdays include the provided weekday. Returns
false otherwise.

| Function                     | Type                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| `doesWeekdaysIncludeWeekday` | `(weekdays: string or SWeekdays, weekday: Weekday) => boolean` |

Parameters:

- `weekdays`: The weekdays to check. It can be an SWeekdays or a string in
  the SMTWTFS format.
- `weekday`: The weekday to check.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L235)

### :gear: doesWeekdaysHaveOverlapWithWeekdays

Returns true if any of the included weekdays in weekdays1 is also included in
weekdays2. Returns false otherwise.

| Function                              | Type                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `doesWeekdaysHaveOverlapWithWeekdays` | `(weekdays1: string or SWeekdays, weekdays2: string or SWeekdays) => boolean` |

Parameters:

- `weekdays1`: The first set of weekdays to compare. It can be an SWeekdays
  or a string in the SMTWTFS format.
- `weekdays2`: The second set of weekdays to compare. It can be an
  SWeekdays or a string in the SMTWTFS format.

[:link: Source](https://github.com/ericvera/scdate/tree/main/src/sWeekdays.ts#L254)

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
