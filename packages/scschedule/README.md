# scschedule

**Schedule management library for time-based availability patterns**

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/scschedule.svg?style=flat-square)](https://npmjs.org/package/scschedule)

## Overview

scschedule is a TypeScript library for managing time-based availability patterns. Built on top of [scdate](https://npmjs.org/package/scdate) for consistent date/time handling, it provides a powerful yet simple way to define and query when entities are available or unavailable using recurring patterns and date-specific overrides.

**Use cases**: Business hours, resource availability, service windows, time-restricted access control, scheduling systems, and any application that needs to determine availability based on time patterns.

## Features

- **Recurring patterns**: Define weekly schedules with different hours for different days
- **Override system**: Add exceptions for holidays, special events, or schedule changes
- **Cross-midnight support**: Handle time ranges that span midnight (e.g., 22:00-02:00)
- **Layered schedules**: Combine multiple schedules by intersection (e.g., business hours + item-specific restrictions) and query combined availability
- **Half-open ranges**: `from` is inclusive, `to` is exclusive — matching the convention used by iCalendar, spatie/opening-hours, and Luxon intervals
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

- Node.js >= 24
- TypeScript >= 5.0 (for TypeScript users)

## Migrating from v5

v6 changes time ranges to half-open (`to` is exclusive), replaces `getNextUnavailableFromSchedule` with availability-range queries, and drops the `timeZone` parameter. See [MIGRATION-V6.md](https://github.com/ericvera/scdate/blob/main/packages/scschedule/MIGRATION-V6.md) for the breaking changes and the stored-data migration checklist.

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
  from: STime // e.g., '09:00' (inclusive)
  to: STime // e.g., '17:00' (exclusive)
}
```

**Time range semantics** — ranges are half-open (`from` inclusive, `to` exclusive):

- `09:00`–`17:00` is available from 09:00 up to, but not including, 17:00
- Adjacent ranges share a boundary: `09:00`–`12:00` and `12:00`–`17:00` form one contiguous period with no gap and no overlap
- A `to` of `00:00` means "until the end of the day": `22:00`–`00:00` ends exactly at midnight
- `00:00`–`00:00` is a full day
- `from` after `to` crosses midnight into the next day (e.g., `22:00`–`02:00`); `from` equal to `to` (other than `00:00`) covers a full 24 hours

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

### Constants

#### `AlwaysAvailableSchedule: Schedule`

A frozen schedule that is always available (`{ weekly: true }`). The identity for layered schedules: combining it with other schedules restricts nothing. Spread it to add overrides:

```typescript
import { AlwaysAvailableSchedule } from 'scschedule'

const closedToday: Schedule = {
  ...AlwaysAvailableSchedule,
  overrides: [{ from: today, to: today, rules: [] }],
}
```

#### `NeverAvailableSchedule: Schedule`

A frozen schedule that is never available (`{ weekly: [] }`). Spread it to open specific windows via overrides.

### Validation

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

#### `isInOvernightSpillover(schedule: Schedule, date: SDate | string, time: STime | string): boolean`

Returns true if the given date and time fall within overnight spillover from the previous day's schedule. Useful when modifying the previous day's schedule would affect current availability (e.g., a business owner wanting to close early during an overnight shift that started yesterday).

```typescript
import { isInOvernightSpillover } from 'scschedule'
import { sDate, sTime } from 'scdate'

// Friday 01:00 is in Thursday's 22:00-02:00 spillover
const inSpillover = isInOvernightSpillover(
  schedule,
  sDate('2025-01-11'),
  sTime('01:00'),
)
if (inSpillover) {
  // Modifying Thursday's schedule would affect current availability
}
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

#### `getNextAvailabilityRangeFromSchedule(schedule: Schedule, fromTimestamp: STimestamp | string, maxDaysToSearch: number): NextAvailabilityRangeFromScheduleResult`

Find the availability range containing the given timestamp, or the next one to begin. One call answers "available now?" (`available`), "when next?" (`range.from`), and "until when?" (`range.to`). The range's `to` is exclusive — the first unavailable instant — and is `undefined` when availability does not end within the search window (e.g. `weekly: true` with no closing override). Adjacent ranges chain into one contiguous period. `range` is `undefined` when there is no availability within the search window.

```typescript
import { getNextAvailabilityRangeFromSchedule } from 'scschedule'

const { available, range } = getNextAvailabilityRangeFromSchedule(
  restaurant,
  now,
  30,
)

if (available && range) {
  console.log(`Open until ${range.to?.timestamp}`)
} else if (range) {
  console.log(`Opens at ${range.from.timestamp}`)
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

### Multi-Schedule Queries (Layered Availability)

Layered schedules combine by intersection: something is available only when every schedule in the list is available (e.g., a menu item is orderable only while the restaurant is open AND the item's own schedule allows it). Order does not affect the result, but the indexes reported by these functions refer to positions in the array, so a stable convention (e.g., index 0 = restaurant hours) makes results easy to interpret. `AlwaysAvailableSchedule` (`{ weekly: true }`) is the identity: it restricts nothing.

#### `areSchedulesAvailable(schedules: Schedule[], timestamp: STimestamp | string): boolean`

Check if all schedules are available at a specific time.

```typescript
import { areSchedulesAvailable } from 'scschedule'

const canOrder = areSchedulesAvailable([restaurant, menuItem], now)
```

#### `getUnavailableScheduleIndexes(schedules: Schedule[], timestamp: STimestamp | string): number[]`

Returns the indexes of the schedules that are unavailable at a specific time. Empty when everything is available — useful for explaining _why_ something is unavailable at any point in time, without paying for a forward search.

```typescript
import { getUnavailableScheduleIndexes } from 'scschedule'
import { sTimestamp } from 'scdate'

// A customer wants to schedule a pickup for Saturday at 18:00
const blocking = getUnavailableScheduleIndexes(
  [restaurant, menuItem],
  sTimestamp('2025-01-11T18:00'),
)

if (blocking.length === 0) {
  // Pickup time works
} else if (blocking.includes(0)) {
  // "The restaurant is closed at that time"
} else {
  // "This item is not offered at that time"
}
```

#### `getNextAvailabilityRangeFromSchedules(schedules: Schedule[], fromTimestamp: STimestamp | string, maxDaysToSearch: number): NextAvailabilityRangeFromSchedulesResult`

Find the availability range of the intersection of the schedules — containing the given timestamp, or the next one to begin. The combined availability starts when the last schedule opens and ends as soon as any one schedule closes. The result also includes whether everything is available at `fromTimestamp` (`available`) and the indexes of the schedules unavailable at `fromTimestamp`, explaining why availability is blocked now.

```typescript
import { getNextAvailabilityRangeFromSchedules } from 'scschedule'

const { available, range, unavailableScheduleIndexes } =
  getNextAvailabilityRangeFromSchedules([restaurant, menuItem], now, 30)

if (available && range) {
  console.log(`Available until ${range.to?.timestamp}`)
} else if (range) {
  // e.g. "Back Monday at 11:00" — unavailableScheduleIndexes says why
  console.log(`Available ${range.from.timestamp} until ${range.to?.timestamp}`)
}
```

To find out which schedule ends the availability, call `getUnavailableScheduleIndexes` with `range.to` — it is the first unavailable instant.

#### `getApplicableRuleForDate(schedule: Schedule, date: SDate | SDateString): ApplicableRule`

Returns the rules that apply for a given date, indicating whether they come from the weekly schedule or an override. When `source` is `'weekly'`, `rules` is the weekly schedule (`true` or `WeeklyScheduleRule[]`). When `source` is `'override'`, `rules` is the override's rules and `overrideIndex` identifies which override applies.

```typescript
import { getApplicableRuleForDate } from 'scschedule'
import { sDate } from 'scdate'

const result = getApplicableRuleForDate(restaurant, sDate('2025-12-15'))
// result.source === 'weekly' | 'override'
// result.rules === true | WeeklyScheduleRule[]
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
// - Thursday 20:00 until Friday 03:00
// - Friday 20:00 until Saturday 03:00
// - Saturday 20:00 until Sunday 03:00
```

To end exactly at midnight, use a `to` of `00:00` (e.g., `18:00`–`00:00`) — no spillover into the next day.

### Always Available (`weekly: true`)

Use `weekly: true` when an entity is available 24/7 by default. This is useful for items that inherit availability from a parent schedule (e.g., menu items that go through the restaurant's schedule filter first). The `AlwaysAvailableSchedule` constant provides this schedule ready-made; spread it to add overrides.

```typescript
import { AlwaysAvailableSchedule } from 'scschedule'

// Menu item available 24/7 (restaurant hours handle the filtering)
const menuItem: Schedule = AlwaysAvailableSchedule

// Same, but with an exception
const seasonalItem: Schedule = {
  ...AlwaysAvailableSchedule,
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

Use `weekly: []` when an entity is unavailable by default and only opens during specific override periods. The `NeverAvailableSchedule` constant provides this schedule ready-made; spread it to add overrides.

```typescript
import { NeverAvailableSchedule } from 'scschedule'

// Pop-up shop: closed by default, open only during specific events
const popUpShop: Schedule = {
  ...NeverAvailableSchedule,
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
import {
  areSchedulesAvailable,
  getNextAvailabilityRangeFromSchedules,
} from 'scschedule'

const businessHours: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'),
      from: sTime('11:00'),
      to: sTime('22:00'),
    },
  ],
}

// Item only available Mondays — business hours do the rest of the filtering
const mondaySpecial: Schedule = {
  weekly: [
    {
      weekdays: sWeekdays('-M-----'),
      from: sTime('00:00'),
      to: sTime('00:00'), // full day
    },
  ],
}

// One call answers: available now? why not? when next? until when?
const { available, range, unavailableScheduleIndexes } =
  getNextAvailabilityRangeFromSchedules([businessHours, mondaySpecial], now, 30)

// unavailableScheduleIndexes: [0] = location closed, [1] = item restricted

if (available && range) {
  // e.g. "Available until 22:00"
  console.log(`Available until ${range.to?.timestamp}`)
} else if (range) {
  // e.g. "Back Monday at 11:00"
  console.log(`Back at ${range.from.timestamp}`)
}

// For a boolean-only check, use areSchedulesAvailable
const canOrder = areSchedulesAvailable([businessHours, mondaySpecial], now)
```

## Validation Error Types

The library uses discriminated unions for type-safe error handling. Location types (`RuleLocation`, `FieldLocation`) provide structured data for finding and highlighting errors in the UI—no path parsing required.

```typescript
// RuleLocation - where a rule lives (used by EmptyWeekdays)
type RuleLocation =
  | { type: RuleLocationType.Weekly; ruleIndex: number }
  | {
      type: RuleLocationType.Override
      overrideIndex: number
      ruleIndex: number
    }

// FieldLocation - where a field lives (used by InvalidScDateFormat)
type FieldLocation =
  | { type: RuleLocationType.Weekly; ruleIndex: number; field: RuleField }
  | {
      type: RuleLocationType.Override
      overrideIndex: number
      field: OverrideField
    }
  | {
      type: RuleLocationType.Override
      overrideIndex: number
      ruleIndex: number
      field: RuleField
    }

// RuleField - rule-level fields (weekdays, from, to)
enum RuleField {
  Weekdays = 'weekdays',
  From = 'from',
  To = 'to',
}

// OverrideField - override date range fields (from, to)
enum OverrideField {
  From = 'from',
  To = 'to',
}
```

```typescript
type ValidationError =
  | {
      issue: ValidationIssue.InvalidScDateFormat
      location: FieldLocation
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
      location: RuleLocation
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

## Edge Cases

### Time Zones and DST

Schedules are wall-clock definitions: all queries compare wall-clock timestamps, so no scschedule function takes a time zone. Time zones enter the picture only when producing the query timestamp (e.g., `getTimestampNow(timeZone)` from scdate). Because evaluation is purely wall-clock, DST transitions do not affect schedule queries: a wall-clock time that occurs twice (fall back) or is skipped (spring forward) is compared like any other time.

### Cross-Midnight Ranges

Time ranges that cross midnight (e.g., `22:00-02:00`) are split internally and always spill into the next calendar day, regardless of whether that day is in the weekdays pattern. Ranges ending at `00:00` stop exactly at midnight and do not spill.

### Overlapping Overrides

Specific overrides (with both `from` and `to`) cannot overlap - this is a validation error. However, indefinite overrides can coexist with each other and with future specific overrides. When multiple indefinite overrides could apply to a date, the one with the latest `from` date is used (most recent policy wins).

## TypeScript Support

The library is written in TypeScript and provides full type definitions. All types are exported for use in your code:

```typescript
import type {
  ApplicableRule,
  Schedule,
  WeeklyScheduleRule,
  OverrideScheduleRule,
  AvailabilityRange,
  NextAvailabilityRange,
  NextAvailabilityRangeFromScheduleResult,
  NextAvailabilityRangeFromSchedulesResult,
  ValidationError,
  ValidationResult,
  RuleLocation,
  FieldLocation,
  SDateString,
  STimeString,
  STimestampString,
  SWeekdaysString,
} from 'scschedule'

import {
  ValidationIssue,
  RuleLocationType,
  RuleField,
  OverrideField,
} from 'scschedule'
```

Note: The `Weekday` enum (used in some `ValidationError` variants) is exported from `scdate`, not `scschedule`:

```typescript
import { Weekday } from 'scdate'
```

## Dependencies

This package depends on:

- `scdate`: Core date and time handling library (installed automatically as a direct dependency)

## License

MIT

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/ericvera/scdate).
