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
- **Time zone aware**: Time zone passed at the call site where needed (DST-safe arithmetic)
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

// Define a restaurant schedule: Monday-Saturday, 11:00-22:00
const restaurant: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Mon-Sat
      from: sTime('11:00'),
      to: sTime('22:00'),
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

// Find next opening time (search up to 30 days ahead)
const nextOpen = getNextAvailableFromSchedule(restaurant, now, 30)
if (nextOpen) {
  console.log(`Next opening: ${nextOpen.timestamp}`)
}
```

## Core Concepts

### Schedule Structure

A `Schedule` consists of:

- **weekly**: Base recurring schedule — `true` (available 24/7), an array of `WeeklyScheduleRule` (time-based), or `[]` (never available; overrides can open windows)
- **overrides** (optional): Date-specific exceptions (array of `OverrideScheduleRule`)

```typescript
interface Schedule {
  weekly: WeeklyScheduleRule[] | true
  overrides?: OverrideScheduleRule[]
}
```

### Weekly Rules

Define recurring availability patterns for specific days of the week:

```typescript
interface WeeklyScheduleRule {
  weekdays: SWeekdays // e.g., 'SMTWTFS' or '-MTWTF-'
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

1. **Specific override** (with both `from` and `to`) - highest priority, shortest duration wins when multiple could apply
2. **Indefinite override** (with only `from`, no `to`) - when multiple indefinite overrides could apply, the one with the latest `from` date wins (most recent policy)
3. **Weekly rules** - lowest priority (base schedule)

## API Reference

### Validation

#### `isValidTimeZone(timeZone: string): boolean`

Re-exported from `scdate`. Checks if a string is a valid IANA time zone identifier (using `Intl.supportedValuesOf('timeZone')`).

```typescript
import { isValidTimeZone } from 'scschedule' // or from 'scdate'

isValidTimeZone('America/New_York') // true
isValidTimeZone('Invalid/Timezone') // false
```

#### `validateSchedule(schedule: Schedule): ValidationResult`

Validates a schedule and returns detailed errors.

```typescript
import { validateSchedule, ValidationIssue } from 'scschedule'

const result = validateSchedule(mySchedule)

if (!result.valid) {
  result.errors.forEach((error) => {
    switch (error.issue) {
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

- Valid scdate formats (SDate, STime, SWeekdays)
- Override `to` date must not be before `from` date
- No duplicate overrides (identical from/to dates)
- No overlapping specific overrides (hierarchical nesting allowed)
- No overlapping time ranges within a single rule (same weekday)
- No overlapping rules within the weekly schedule (shared weekdays with overlapping times)
- No overlapping rules within the same override (shared weekdays with overlapping times)
- No cross-midnight spillover conflicts at override boundaries
- All rules have at least one time range
- No empty weekdays patterns (e.g., `'-------'` with no days selected)
- Override weekdays must match at least one date in the override's date range

### Schedule Management

#### `cleanupExpiredOverridesFromSchedule(schedule: Schedule, beforeDate: SDate | string): Schedule`

Removes expired overrides (with a `to` date) that ended before a given date. Indefinite overrides (no `to` date) are never removed. Returns a new Schedule instance.

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

#### `getNextAvailableFromSchedule(schedule: Schedule, fromTimestamp: STimestamp | string, maxDaysToSearch: number): STimestamp | undefined`

Find the next available timestamp from a given time. Searches up to `maxDaysToSearch` days forward.

```typescript
import { getNextAvailableFromSchedule } from 'scschedule'

const nextOpen = getNextAvailableFromSchedule(restaurant, now, 30)
if (nextOpen) {
  console.log(`Opens at: ${nextOpen.timestamp}`)
}
```

#### `getNextUnavailableFromSchedule(schedule: Schedule, timeZone: string, fromTimestamp: STimestamp | string, maxDaysToSearch: number): STimestamp | undefined`

Find the next unavailable timestamp from a given time. Requires a time zone for DST-safe timestamp arithmetic. Searches up to `maxDaysToSearch` days forward.

```typescript
import { getNextUnavailableFromSchedule } from 'scschedule'

const nextClosed = getNextUnavailableFromSchedule(
  restaurant,
  'America/Puerto_Rico',
  now,
  30,
)
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
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Mon-Sat
      from: sTime('11:00'),
      to: sTime('22:00'),
    },
  ],
}
```

### Split Schedules (Lunch & Dinner)

```typescript
const restaurant: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Mon-Sat
      from: sTime('11:00'),
      to: sTime('14:00'), // Lunch
    },
    {
      weekdays: sWeekdays('-MTWTFS'), // Mon-Sat
      from: sTime('17:00'),
      to: sTime('22:00'), // Dinner
    },
  ],
}
```

### Different Hours for Different Days

```typescript
const restaurant: Schedule = {
  weekly: [
    {
      // Weekdays: longer hours
      weekdays: sWeekdays('-MTWTF-'), // Mon-Fri
      from: sTime('10:00'),
      to: sTime('23:00'),
    },
    {
      // Weekends: shorter hours
      weekdays: sWeekdays('S-----S'), // Sat-Sun
      from: sTime('12:00'),
      to: sTime('20:00'),
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
          from: sTime('08:00'),
          to: sTime('23:00'),
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
          from: sTime('09:00'),
          to: sTime('21:00'),
        },
      ],
    },
  ],
}
```

### Cross-Midnight Hours (Late Night)

```typescript
const lateNightBar: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('----TFS'), // Thu-Sat
      from: sTime('20:00'),
      to: sTime('03:00'), // 8PM-3AM
    },
  ],
}

// This means:
// - Thursday: 20:00-23:59, Friday: 00:00-03:00
// - Friday: 20:00-23:59, Saturday: 00:00-03:00
// - Saturday: 20:00-23:59, Sunday: 00:00-03:00
```

### Always Available (`weekly: true`)

Use `weekly: true` when an entity is available 24/7 by default. This is useful for items that inherit availability from a parent schedule (e.g., menu items that go through the restaurant's schedule filter first).

```typescript
// Menu item available 24/7 (restaurant hours handle the filtering)
const menuItem: Schedule = {
  weekly: true,
  overrides: [
    {
      // Except Christmas Day
      from: sDate('2025-12-25'),
      to: sDate('2025-12-25'),
      rules: [],
    },
  ],
}
```

### Closed by Default (`weekly: []`)

Use `weekly: []` when an entity is unavailable by default and only opens during specific override periods.

```typescript
// Pop-up shop: closed by default, open only during specific events
const popUpShop: Schedule = {
  weekly: [],
  overrides: [
    {
      from: sDate('2025-12-20'),
      to: sDate('2025-12-24'),
      rules: [
        {
          weekdays: sWeekdays('SMTWTFS'),
          from: sTime('10:00'),
          to: sTime('18:00'),
        },
      ],
    },
  ],
}
```

### Multiple Schedules (Layered Availability)

```typescript
import { isScheduleAvailable } from 'scschedule'

const businessHours: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'),
      from: sTime('11:00'),
      to: sTime('22:00'),
    },
  ],
}

// Menu available 24/7 — restaurant hours do the filtering
const breakfastMenu: Schedule = {
  weekly: true,
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
      issue: ValidationIssue.InvalidScDateFormat
      field: string
      value: string
      expectedFormat: string
    }
  | {
      issue: ValidationIssue.InvalidOverrideDateOrder
      overrideIndex: number
      from: string
      to: string
    }
  | {
      issue: ValidationIssue.DuplicateOverrides
      overrideIndexes: [number, number]
    }
  | {
      issue: ValidationIssue.OverlappingSpecificOverrides
      overrideIndexes: [number, number]
    }
  | {
      issue: ValidationIssue.OverlappingRulesInWeekly
      ruleIndexes: [number, number]
      weekday: Weekday
    }
  | {
      issue: ValidationIssue.OverlappingRulesInOverride
      overrideIndex: number
      ruleIndexes: [number, number]
      weekday: Weekday
    }
  | {
      issue: ValidationIssue.EmptyWeekdays
      location:
        | { type: RuleLocationType.Weekly; ruleIndex: number }
        | {
            type: RuleLocationType.Override
            overrideIndex: number
            ruleIndex: number
          }
    }
  | {
      issue: ValidationIssue.OverrideWeekdaysMismatch
      overrideIndex: number
      ruleIndex: number
      weekdays: string
      dateRange: { from: string; to: string }
    }
  | {
      issue: ValidationIssue.SpilloverConflictIntoOverrideFirstDay
      overrideIndex: number
      date: string
      overrideRuleIndex: number
      sourceWeeklyRuleIndex?: number
      sourceOverrideIndex?: number
      sourceOverrideRuleIndex?: number
    }
  | {
      issue: ValidationIssue.SpilloverConflictOverrideIntoNext
      overrideIndex: number
      date: string
      overrideRuleIndex: number
      nextDayWeeklyRuleIndex?: number
      nextDayOverrideIndex?: number
      nextDayOverrideRuleIndex?: number
    }
```

## Best Practices

1. **Always validate schedules** before using them in production
2. **Clean up expired overrides** periodically to keep schedules manageable
3. **Use specific date ranges** for overrides when possible - indefinite overrides are useful for permanent schedule changes
4. **When using multiple indefinite overrides**, remember that the most recent one (latest `from` date) takes precedence
5. **Test cross-midnight ranges** thoroughly if your schedule uses them
6. **Validate time zones** separately using `isValidTimeZone()` before passing them to functions that require one
7. **Handle DST transitions** by testing schedules during spring forward and fall back

## Edge Cases

### DST Transitions

The library handles DST transitions using scdate's time zone functions. Times that fall in "missing hours" (spring forward) are treated as unavailable.

### Cross-Midnight Ranges

Time ranges that cross midnight (e.g., `22:00-02:00`) are split internally and always spill into the next calendar day, regardless of whether that day is in the weekdays pattern.

### Overlapping Overrides

Specific overrides (with both `from` and `to`) cannot overlap - this is a validation error. However, indefinite overrides can coexist with each other and with future specific overrides. When multiple indefinite overrides could apply to a date, the one with the latest `from` date is used (most recent policy wins).

## TypeScript Support

The library is written in TypeScript and provides full type definitions. All types are exported for use in your code:

```typescript
import type {
  Schedule,
  WeeklyScheduleRule,
  OverrideScheduleRule,
  AvailabilityRange,
  ValidationError,
  ValidationResult,
  SDateString,
  STimeString,
  STimestampString,
  SWeekdaysString,
} from 'scschedule'

import { ValidationIssue, RuleLocationType } from 'scschedule'
```

Note: The `Weekday` enum (used in some `ValidationError` variants) is exported from `scdate`, not `scschedule`:

```typescript
import { Weekday } from 'scdate'
```

## Dependencies

This package depends on:

- `scdate`: Core date and time handling library

All of scdate's peer dependencies are also required.

## License

MIT

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/ericvera/scdate).
