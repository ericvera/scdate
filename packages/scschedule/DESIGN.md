# Schedule Library Design Document

## Overview

A TypeScript library for managing time-based availability patterns. Built on top of `scdate` for consistent date/time handling.

**Purpose**: Define and query when entities are available or unavailable using recurring patterns and date-specific overrides. Use cases include business hours, resource availability, service windows, and time-restricted access control.

**Key Principles**:

- Immutable data structures (all operations return new instances)
- Plain objects for data, functions for operations
- Verbose, consistent naming following scdate patterns
- Uses scdate types (SDate, STime, STimestamp, SWeekdays) throughout

## Dependencies

- `scdate` - Core date/time handling
- All scdate peer dependencies

## Core Types

### Schedule

```typescript
interface Schedule {
  timezone: string
  weekly: WeeklyScheduleRule[] // Base recurring schedule
  overrides?: OverrideScheduleRule[] // Date-specific exceptions
}
```

### Rules

```typescript
interface TimeRange {
  from: STime
  to: STime
}

interface WeeklyScheduleRule {
  weekdays: SWeekdays
  times: TimeRange[]
}

interface OverrideScheduleRule {
  from: SDate
  to?: SDate
  rules: WeeklyScheduleRule[] // Empty array = unavailable
}
```

**Rule Semantics**:

1. **Weekly Rule**: Defines recurring availability pattern
   - `weekdays`: Days this rule applies (SWeekdays format)
   - `times`: Time ranges when available on those days
   - Example: Open Tue-Sat 11:00-22:00

2. **Override Rule**: Exceptions to weekly patterns for specific date range
   - `from`: Start date (required)
   - `to`: End date (optional - if omitted, applies indefinitely from `from` date forward)
   - `rules`: Array of weekly patterns to apply during this date range
     - Empty array `[]` = unavailable/closed for entire period
     - Non-empty = available with specified weekly patterns
   - Examples:
     - Closed Dec 25: `{ from: '2025-12-25', rules: [] }`
     - Closed indefinitely starting Dec 25: `{ from: '2025-12-25', rules: [] }` (no `to`)
     - Extended hours Dec 1-31, different for weekdays/weekends:
       ```typescript
       {
         from: '2025-12-01',
         to: '2025-12-31',
         rules: [
           { weekdays: '-MTWTF-', times: [{ from: '08:00', to: '17:00' }] },
           { weekdays: 'S-----S', times: [{ from: '12:00', to: '17:00' }] }
         ]
       }
       ```

### Additional Types

```typescript
interface AvailabilityRange {
  from: STimestamp
  to: STimestamp
}
```

## API Design

### Construction & Validation

```typescript
enum ValidationIssue {
  InvalidTimezone = 'invalid-timezone',
  MultipleIndefiniteOverrides = 'multiple-indefinite-overrides',
  OverlappingSpecificOverrides = 'overlapping-specific-overrides',
  OverlappingTimesInRule = 'overlapping-times-in-rule',
  EmptyTimes = 'empty-times',
  InvalidScDateFormat = 'invalid-scdate-format',
}

enum RuleLocationType {
  Weekly = 'weekly',
  Override = 'override',
}

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
      overrideIndexes: [number, number] // pair of conflicting override indexes
    }
  | {
      issue: ValidationIssue.OverlappingTimesInRule
      location:
        | { type: RuleLocationType.Weekly; ruleIndex: number }
        | { type: RuleLocationType.Override; overrideIndex: number; ruleIndex: number }
      timeRangeIndexes: [number, number] // pair of conflicting time range indexes
    }
  | {
      issue: ValidationIssue.EmptyTimes
      location:
        | { type: RuleLocationType.Weekly; ruleIndex: number }
        | { type: RuleLocationType.Override; overrideIndex: number; ruleIndex: number }
    }
  | {
      issue: ValidationIssue.InvalidScDateFormat
      field: string // e.g., "overrides[2].from"
      value: string
      expectedFormat: string // e.g., "YYYY-MM-DD", "HH:MM", "YYYY-MM-DDTHH:MM", "SMTWTFS"
    }

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const validateSchedule = (schedule: Schedule): ValidationResult
```

### Utilities

```typescript
const cleanupExpiredOverridesFromSchedule = (
  schedule: Schedule,
  beforeDate: SDate | string
): Schedule
```

**Cleanup behavior**:

- Removes overrides where `to` (or `from` if no `to`) is before `beforeDate`
- Returns new Schedule instance (immutable)

**Adding/Removing Rules**:
Modify `weekly` and `overrides` arrays directly using standard array operations.

### Availability Queries

```typescript
const isScheduleAvailable = (
  schedule: Schedule,
  timestamp: STimestamp | string
): boolean

const getNextAvailableFromSchedule = (
  schedule: Schedule,
  fromTimestamp: STimestamp | string
): STimestamp | undefined

const getNextUnavailableFromSchedule = (
  schedule: Schedule,
  fromTimestamp: STimestamp | string
): STimestamp | undefined

const getAvailableRangesFromSchedule = (
  schedule: Schedule,
  startDate: SDate | string,
  endDate: SDate | string
): AvailabilityRange[]
```

### Inspection

See `validateSchedule` in Construction & Validation section.

To access schedule data, use properties directly:

- `schedule.weekly` - Base recurring schedule
- `schedule.overrides` - Date-specific exceptions
- `schedule.timezone` - Timezone string

## Schedule Rules

A valid schedule must satisfy these constraints:

1. **Valid timezone**: Must be in `Intl.supportedValuesOf('timeZone')`
2. **Single indefinite override**: Maximum one override without `to` property
3. **Non-overlapping specific overrides**: Overrides with both `from` and `to` must not have overlapping date ranges
4. **Non-overlapping times within rules**: Within each WeeklyScheduleRule (in base `weekly` array or override's `rules`), time ranges applying to the same weekday must not overlap
5. **Non-empty times**: Each WeeklyScheduleRule must have at least one time range (`times.length > 0`)
6. **Valid scdate formats**: All SDate, STime, STimestamp, and SWeekdays values must be valid per scdate specifications

**Notes**:

- Cross-midnight time ranges (e.g., `{from: '22:00', to: '02:00'}`) are valid and handled internally
- Multiple weekly rules with different weekdays can coexist without conflict
- Override rules with empty `rules: []` arrays are valid (indicates unavailable/closed)

## Implementation Requirements

### Rule Priority System

Rules are evaluated in this order (highest to lowest priority):

1. **Specific override** (if date falls within override with both `from` and `to`)
2. **Indefinite override** (if date >= indefinite override's `from` and no specific override applies)
3. **Weekly rules** (base schedule if no overrides apply)

**Notes**:

- Only one indefinite override allowed per schedule (validated)
- Specific overrides cannot overlap (validated)
- When override applies, its nested `rules` array defines availability (empty = closed)

### Cross-Midnight Handling

Time ranges that cross midnight (e.g., `{from: '22:00', to: '02:00'}`) span two calendar days, starting on the weekday specified in the pattern and continuing into the next day.

**Implementation**: Split internally into two periods:

- Day 1: from time to 23:59
- Day 2: 00:00 to to time

**Availability**: The range starts on any weekday included in the pattern and always continues into the next calendar day, regardless of whether that next day is in the weekdays pattern.

**Example:**

```typescript
{
  weekdays: sWeekdays('-----F-'), // Only Friday
  times: [{ from: '22:00', to: '02:00' }]
}
// Available: Friday 22:00-23:59, Saturday 00:00-02:00
// (Saturday portion applies even though Saturday not in weekdays)
```

### Timezone Handling

- Schedule stores timezone for all operations
- All queries use schedule's timezone for date/time calculations
- Leverage scdate's timezone functions for conversions
- DST transitions handled via scdate

### Calendar Day Queries

When checking specific dates:

- "Available on Dec 25th" means calendar day in schedule's timezone
- Use scdate's date comparison functions
- Time ranges apply within the calendar day boundaries

## Edge Cases to Handle

### 1. Overlapping Override Date Ranges

**Scenario**: Override ranges overlap (e.g., Dec 1-31 and Dec 15-Jan 15).

**Solution**:

- **Specific overrides** (with `to` date): Detected by `validateSchedule`. User must split ranges or remove conflicting rule.
- **Indefinite overrides** (no `to` date): Can coexist with future specific overrides that have both `from` and `to`. Indefinite serves as new baseline schedule, specific overrides add exceptions.

**Example - Valid:**

```typescript
// New schedule starting Jan 1 (indefinite baseline)
{ from: '2026-01-01', rules: [...newSchedule] }

// Holiday exception (specific)
{ from: '2026-12-25', to: '2026-12-25', rules: [] }
```

**Example - Invalid:**

```typescript
// Both specific overrides - validation error
{ from: '2025-12-01', to: '2025-12-31', rules: [...] }
{ from: '2025-12-15', to: '2026-01-15', rules: [...] }
```

### 2. Missing Hours (DST Spring Forward)

**Scenario**: Time falls in skipped hour during DST transition.

**Solution**: Rely on scdate's `addMinutesToTimestamp` which handles DST. If querying availability in missing hour, treat as unavailable.

### 3. Repeated Hours (DST Fall Back)

**Scenario**: Time appears twice during DST transition.

**Solution**: Rely on scdate's UTC timestamp conversions. First occurrence takes precedence.

### 4. Empty Time Ranges in Weekly Rules

**Scenario**: WeeklyScheduleRule with empty `times: []`.

**Solution**: Treat as invalid - throw error. Weekly rules must have at least one time range.

### 5. Empty Rules Array in Override

**Scenario**: Override with `rules: []`.

**Solution**: This is valid and means unavailable/closed for the date range.

### 6. Midnight Representation

**Scenario**: Is 00:00 start or end of day?

**Solution**:

- Time `00:00` is start of day
- Range `{from: '22:00', to: '00:00'}` is invalid (use `23:59` or cross-midnight pattern)
- To represent "until end of day", use `{to: '23:59'}`

### 7. Same-Day Ranges

**Scenario**: `getAvailableRangesFromSchedule` with startDate === endDate.

**Solution**: Return ranges for that single day only.

### 8. Cross-Midnight Time Ranges

**Scenario**: Time range crossing midnight, e.g., `{from: '22:00', to: '02:00'}`.

**Solution**: Allowed. Implementation handles splitting internally:

- Range starts on any weekday in the pattern
- Always continues into next calendar day, regardless of weekdays pattern
- `{from: '22:00', to: '02:00'}` on Friday becomes:
  - Friday: 22:00-23:59
  - Saturday: 00:00-02:00 (applies even if Saturday not in weekdays)

**Example:**

```typescript
{
  weekdays: sWeekdays('----TFS'), // Thu, Fri, Sat
  times: [{ from: '17:00', to: '02:00' }]
}
// Thursday: 17:00-23:59, Friday: 00:00-02:00
// Friday: 17:00-23:59, Saturday: 00:00-02:00
// Saturday: 17:00-23:59, Sunday: 00:00-02:00
// All spillover periods (Fri, Sat, Sun mornings) apply regardless of weekdays
```

### 9. Indefinite Override Without End Date

**Scenario**: Override with no `to` date applies forever forward.

**Solution**: Valid pattern. Used for permanent closures or permanent schedule changes starting on a date.

### 10. Override With No Matching Weekdays

**Scenario**: Override date range where nested weekly rules' weekdays don't cover any days in range.

**Solution**: Treat those uncovered days as unavailable (override with empty effective rules).

**Example**:

```typescript
{

  from: '2025-12-25', // Thursday
  to: '2025-12-26',   // Friday
  rules: [
    {  weekdays: 'S-----S', times: [...] } // Only Sat/Sun
  ]
}
// Dec 25-26 (Thu-Fri) are unavailable since no weekend days in range
```

## Usage Examples

### Basic Business Hours

```typescript
const restaurant: Schedule = {
  timezone: 'America/Puerto_Rico',
  weekly: [
    {
      weekdays: sWeekdays('-MTWTFS'), // Tue-Sat
      times: [{ from: sTime('11:00'), to: sTime('22:00') }],
    },
  ],
}

// Validate
const validation = validateSchedule(restaurant)
if (!validation.valid) {
  console.error('Invalid schedule:', validation.errors)
}

// Check if open now
const isOpen = isScheduleAvailable(
  restaurant,
  getTimestampNow('America/Puerto_Rico'),
)

// Find next opening time
const nextOpen = getNextAvailableFromSchedule(
  restaurant,
  getTimestampNow('America/Puerto_Rico'),
)
```

### Holiday Closures

```typescript
const withHoliday = {
  ...restaurant,
  overrides: [
    ...(restaurant.overrides || []),
    {
      from: sDate('2025-12-25'),
      rules: [], // Empty = closed
    },
  ],
}
```

### Extended Holiday Hours

```typescript
const withExtendedHours = {
  ...restaurant,
  overrides: [
    ...(restaurant.overrides || []),
    {
      from: sDate('2025-12-01'),
      to: sDate('2025-12-31'),
      rules: [
        {
          weekdays: sWeekdays('S-----S'), // Weekends only
          times: [{ from: sTime('08:00'), to: sTime('23:00') }],
        },
      ],
    },
  ],
}
```

### Checking Multiple Schedules

```typescript
const businessOpen = isScheduleAvailable(restaurant, timestamp)
const breakfastAvailable = isScheduleAvailable(breakfastMenu, timestamp)

// Both must be true for breakfast to be orderable
const canOrderBreakfast = businessOpen && breakfastAvailable
```

### Get Available Slots

```typescript
const slots = getAvailableRangesFromSchedule(
  restaurant,
  sDate('2025-11-11'),
  sDate('2025-11-11'),
)
// Returns: [{ from: '2025-11-11T11:00', to: '2025-11-11T22:00' }]
```

## Testing Strategy

### Unit Tests Required

1. **Validation**
   - All validation rules enforced correctly
   - Detailed error messages for each ValidationIssue type
   - Valid schedules pass validation

2. **Availability Queries**
   - Weekly patterns work correctly
   - Override rules properly override weekly patterns
   - Date ranges work inclusively
   - Weekday filters in overrides work correctly
   - Cross-midnight times handled properly

3. **Edge Cases**
   - DST transitions (both spring forward and fall back)
   - Midnight handling
   - Same-day queries
   - Past date cleanup

### Integration Test Scenarios

1. Restaurant with changing hours throughout week and special holiday hours

## Performance Considerations

- Rule evaluation is O(n) where n = number of rules
- Consider indexing by date range for schedules with 100+ override rules
- getAvailableRangesFromSchedule may need optimization for large date ranges
- Memoization opportunity for repeated queries on same schedule/timestamp
