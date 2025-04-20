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
- **Schedule-focused**: Built specifically for applications that need to handle schedules and recurring patterns

## Installation

```bash
npm install scdate
# or
yarn add scdate
```

## Basic Usage

```typescript
import { sDate, sTime, sTimestamp, sWeekdays, Weekday } from 'scdate'

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

## Time zones

For a list of valid time zones run `Intl.supportedValuesOf('timeZone')` in your environment.

## License

MIT
