# scschedule

**Schedule management library for time-based availability patterns**

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/scschedule.svg?style=flat-square)](https://npmjs.org/package/scschedule)

## Overview

scschedule is a TypeScript library for managing time-based availability patterns. Built on top of [scdate](https://npmjs.org/package/scdate) for consistent date/time handling, it provides a powerful yet simple way to define and query when entities are available or unavailable using recurring patterns and date-specific overrides.

**Use cases**: Business hours, resource availability, service windows, time-restricted access control, scheduling systems, and any application that needs to determine availability based on time patterns.

## Features

- **Recurring patterns**: Define weekly schedules with different hours for different days
- **Override system**: Add exceptions for holidays, special events, or schedule changes
- **Cross-midnight support**: Handle time ranges that span midnight (e.g., 22:00-02:00)
- **Timezone aware**: All operations use schedule's timezone for calculations
- **DST handling**: Properly handles daylight saving time transitions
- **Immutable**: All operations return new instances
- **Type-safe validation**: Discriminated union errors with detailed information
- **Tree-shakeable**: Each function in its own file for optimal bundling

## Installation

```bash
npm install scschedule scdate
# or
yarn add scschedule scdate
```

## Requirements

- Node.js >= 22
- TypeScript >= 5.0 (for TypeScript users)

## Quick Start

```typescript
import {
  Schedule,
  isScheduleAvailable,
  getNextAvailableFromSchedule,
  validateSchedule,
} from 'scschedule'
import { sDate, sTime, sWeekdays, getTimestampNow } from 'scdate'

// Define a restaurant schedule: Tuesday-Saturday, 11:00-22:00
const restaurant: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Tue-Sat
      times: [{ from: sTime('11:00'), to: sTime('22:00') }],
    },
  ],
}

// Validate the schedule
const validation = validateSchedule(restaurant)
if (!validation.valid) {
  console.error('Invalid schedule:', validation.errors)
}

// Check if open now
const now = getTimestampNow('America/Puerto_Rico')
const isOpen = isScheduleAvailable(restaurant, now)
console.log(`Restaurant is ${isOpen ? 'open' : 'closed'}`)

// Find next opening time
const nextOpen = getNextAvailableFromSchedule(restaurant, now)
if (nextOpen) {
  console.log(`Next opening: ${nextOpen.timestamp}`)
}
```

## Core Concepts

### Schedule Structure

A `Schedule` consists of:

- **timezone**: The timezone for all time calculations
- **weekly**: Base recurring schedule (array of `WeeklyScheduleRule`)
- **overrides** (optional): Date-specific exceptions (array of `OverrideScheduleRule`)

```typescript
interface Schedule {
  timezone: string
  weekly: WeeklyScheduleRule[]
  overrides?: OverrideScheduleRule[]
}
```

### Weekly Rules

Define recurring availability patterns for specific days of the week:

```typescript
interface WeeklyScheduleRule {
  weekdays: SWeekdays // e.g., 'SMTWTFS' or '-MTWTF-'
  times: TimeRange[] // Array of time ranges
}

interface TimeRange {
  from: STime // e.g., '09:00'
  to: STime // e.g., '17:00'
}
```

### Override Rules

Override the weekly schedule for specific date ranges:

```typescript
interface OverrideScheduleRule {
  from: SDate // Start date (required)
  to?: SDate // End date (optional - if omitted, applies indefinitely)
  rules: WeeklyScheduleRule[] // Empty array = unavailable/closed
}
```

**Override semantics**:

- **Closed for a day**: `{ from: '2025-12-25', rules: [] }` (Christmas Day)
- **Closed indefinitely**: `{ from: '2025-12-25', rules: [] }` (no `to` date)
- **Special hours**: Override with different weekly patterns for the date range

### Rule Priority

Rules are evaluated in order of priority:

1. **Specific override** (with both `from` and `to`) - highest priority
2. **Indefinite override** (with only `from`, no `to`)
3. **Weekly rules** - lowest priority (base schedule)

## API Reference

### Validation

#### `validateSchedule(schedule: Schedule): ValidationResult`

Validates a schedule and returns detailed errors.

```typescript
import { validateSchedule, ValidationIssue } from 'scschedule'

const result = validateSchedule(mySchedule)

if (!result.valid) {
  result.errors.forEach((error) => {
    switch (error.issue) {
      case ValidationIssue.InvalidTimezone:
        console.error(`Invalid timezone: ${error.timezone}`)
        break
      case ValidationIssue.OverlappingSpecificOverrides:
        console.error(
          `Overlapping overrides at indexes: ${error.overrideIndexes}`,
        )
        break
      // ... handle other error types
    }
  })
}
```

**Validation checks**:

- Valid timezone (in `Intl.supportedValuesOf('timeZone')`)
- At most one indefinite override
- No overlapping specific overrides
- No overlapping time ranges within rules (same weekday)
- All rules have at least one time range
- Valid scdate formats (SDate, STime, SWeekdays)

### Schedule Management

#### `cleanupExpiredOverridesFromSchedule(schedule: Schedule, beforeDate: SDate | string): Schedule`

Removes expired overrides before a given date. Returns a new Schedule instance.

```typescript
import { cleanupExpiredOverridesFromSchedule } from 'scschedule'
import { sDate } from 'scdate'

const cleaned = cleanupExpiredOverridesFromSchedule(
  mySchedule,
  sDate('2025-01-01'),
)
```

### Availability Queries

#### `isScheduleAvailable(schedule: Schedule, timestamp: STimestamp | string): boolean`

Check if schedule is available at a specific timestamp.

```typescript
import { isScheduleAvailable } from 'scschedule'
import { getTimestampNow } from 'scdate'

const isOpen = isScheduleAvailable(
  restaurant,
  getTimestampNow('America/Puerto_Rico'),
)
```

#### `getNextAvailableFromSchedule(schedule: Schedule, fromTimestamp: STimestamp | string): STimestamp | undefined`

Find the next available timestamp from a given time.

```typescript
import { getNextAvailableFromSchedule } from 'scschedule'

const nextOpen = getNextAvailableFromSchedule(restaurant, now)
if (nextOpen) {
  console.log(`Opens at: ${nextOpen.timestamp}`)
}
```

#### `getNextUnavailableFromSchedule(schedule: Schedule, fromTimestamp: STimestamp | string): STimestamp | undefined`

Find the next unavailable timestamp from a given time.

```typescript
import { getNextUnavailableFromSchedule } from 'scschedule'

const nextClosed = getNextUnavailableFromSchedule(restaurant, now)
if (nextClosed) {
  console.log(`Closes at: ${nextClosed.timestamp}`)
}
```

#### `getAvailableRangesFromSchedule(schedule: Schedule, startDate: SDate | string, endDate: SDate | string): AvailabilityRange[]`

Get all available time ranges within a date range.

```typescript
import { getAvailableRangesFromSchedule } from 'scschedule'
import { sDate } from 'scdate'

const ranges = getAvailableRangesFromSchedule(
  restaurant,
  sDate('2025-11-11'),
  sDate('2025-11-17'),
)

ranges.forEach((range) => {
  console.log(`Available: ${range.from.timestamp} to ${range.to.timestamp}`)
})
```

## Usage Examples

### Basic Business Hours

```typescript
import { Schedule } from 'scschedule'
import { sTime, sWeekdays } from 'scdate'

const restaurant: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Tue-Sat
      times: [{ from: sTime('11:00'), to: sTime('22:00') }],
    },
  ],
}
```

### Split Schedules (Lunch & Dinner)

```typescript
const restaurant: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Tue-Sat
      times: [
        { from: sTime('11:00'), to: sTime('14:00') }, // Lunch
        { from: sTime('17:00'), to: sTime('22:00') }, // Dinner
      ],
    },
  ],
}
```

### Different Hours for Different Days

```typescript
const restaurant: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      // Weekdays: longer hours
      weekdays: sWeekdays('-MTWTF-'), // Mon-Fri
      times: [{ from: sTime('10:00'), to: sTime('23:00') }],
    },
    {
      // Weekends: shorter hours
      weekdays: sWeekdays('S-----S'), // Sat-Sun
      times: [{ from: sTime('12:00'), to: sTime('20:00') }],
    },
  ],
}
```

### Holiday Closure

```typescript
import { sDate } from 'scdate'

const withHoliday: Schedule = {
  ...restaurant,
  overrides: [
    {
      from: sDate('2025-12-25'), // Christmas Day
      rules: [], // Empty array = closed
    },
  ],
}
```

### Extended Holiday Hours

```typescript
const withExtendedHours: Schedule = {
  ...restaurant,
  overrides: [
    {
      from: sDate('2025-12-01'),
      to: sDate('2025-12-31'),
      rules: [
        {
          // Extended hours for December, weekends only
          weekdays: sWeekdays('S-----S'),
          times: [{ from: sTime('08:00'), to: sTime('23:00') }],
        },
      ],
    },
  ],
}
```

### Permanent Schedule Change

```typescript
const newSchedule: Schedule = {
  ...restaurant,
  overrides: [
    {
      // New schedule starting Jan 1, 2026 (indefinite)
      from: sDate('2026-01-01'),
      // No 'to' date = applies indefinitely
      rules: [
        {
          weekdays: sWeekdays('SMTWTFS'), // All days
          times: [{ from: sTime('09:00'), to: sTime('21:00') }],
        },
      ],
    },
  ],
}
```

### Cross-Midnight Hours (Late Night)

```typescript
const lateNightBar: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('----TFS'), // Thu-Sat
      times: [{ from: sTime('20:00'), to: sTime('03:00') }], // 8PM-3AM
    },
  ],
}

// This means:
// - Thursday: 20:00-23:59, Friday: 00:00-03:00
// - Friday: 20:00-23:59, Saturday: 00:00-03:00
// - Saturday: 20:00-23:59, Sunday: 00:00-03:00
```

### Multiple Schedules (Layered Availability)

```typescript
import { isScheduleAvailable } from 'scschedule'

const businessHours: Schedule = {
  /* ... */
}
const breakfastMenu: Schedule = {
  /* ... */
}

// Both must be available
const canOrderBreakfast =
  isScheduleAvailable(businessHours, timestamp) &&
  isScheduleAvailable(breakfastMenu, timestamp)
```

## Validation Error Types

The library uses discriminated unions for type-safe error handling:

```typescript
type ValidationError =
  | {
      issue: ValidationIssue.InvalidTimezone
      timezone: string
    }
  | {
      issue: ValidationIssue.MultipleIndefiniteOverrides
      overrideIndexes: number[]
    }
  | {
      issue: ValidationIssue.OverlappingSpecificOverrides
      overrideIndexes: [number, number]
    }
  | {
      issue: ValidationIssue.OverlappingTimesInRule
      location:
        | { type: RuleLocationType.Weekly; ruleIndex: number }
        | {
            type: RuleLocationType.Override
            overrideIndex: number
            ruleIndex: number
          }
      timeRangeIndexes: [number, number]
    }
  | {
      issue: ValidationIssue.EmptyTimes
      location:
        | { type: RuleLocationType.Weekly; ruleIndex: number }
        | {
            type: RuleLocationType.Override
            overrideIndex: number
            ruleIndex: number
          }
    }
  | {
      issue: ValidationIssue.InvalidScDateFormat
      field: string
      value: string
      expectedFormat: string
    }
```

## Best Practices

1. **Always validate schedules** before using them in production
2. **Clean up expired overrides** periodically to keep schedules manageable
3. **Use specific date ranges** for overrides when possible (instead of indefinite)
4. **Test cross-midnight ranges** thoroughly if your schedule uses them
5. **Consider timezone** carefully - all times are interpreted in the schedule's timezone
6. **Handle DST transitions** by testing schedules during spring forward and fall back

## Edge Cases

### DST Transitions

The library handles DST transitions using scdate's timezone functions. Times that fall in "missing hours" (spring forward) are treated as unavailable.

### Cross-Midnight Ranges

Time ranges that cross midnight (e.g., `22:00-02:00`) are split internally and always spill into the next calendar day, regardless of whether that day is in the weekdays pattern.

### Overlapping Overrides

Specific overrides (with both `from` and `to`) cannot overlap - this is a validation error. However, an indefinite override can coexist with future specific overrides.

## TypeScript Support

The library is written in TypeScript and provides full type definitions. All types are exported for use in your code:

```typescript
import type {
  Schedule,
  WeeklyScheduleRule,
  OverrideScheduleRule,
  TimeRange,
  AvailabilityRange,
  ValidationError,
  ValidationResult,
} from 'scschedule'
```

## Dependencies

This package depends on:

- `scdate`: Core date and time handling library

All of scdate's peer dependencies are also required.

## License

MIT

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/ericvera/scdate).
