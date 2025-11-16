# Implementation Plan for scschedule

This document outlines the files to be created or modified to implement the scschedule library based on DESIGN.md.

## Public Constants and Types

### `src/constants.ts`

- Export `ValidationIssue` enum with all validation error types
- Export `RuleLocationType` enum for discriminating rule location in validation errors

### `src/types.ts`

- Export all public interfaces: `Schedule`, `TimeRange`, `WeeklyScheduleRule`, `OverrideScheduleRule`, `AvailabilityRange`
- Export `ValidationError` discriminated union type with structured error data per issue type
- Export `ValidationResult` interface with valid boolean and errors array

## Internal Utility Functions

### `src/internal/isValidTimezone.ts` (+ `isValidTimezone.test.ts`)

- Single export: `isValidTimezone()` to check if timezone is in `Intl.supportedValuesOf('timeZone')`
- Test file covers: valid timezones, invalid timezones, edge cases

### `src/internal/getApplicableRuleForDate.ts` (+ `getApplicableRuleForDate.test.ts`)

- Single export: determine which rule (override or weekly) applies to a date
- Implement rule priority system (specific override > indefinite override > weekly)
- Test file covers: weekly rules, specific overrides, indefinite overrides, priority ordering

### `src/internal/splitCrossMidnightTimeRange.ts` (+ `splitCrossMidnightTimeRange.test.ts`)

- Single export: split cross-midnight time ranges into two periods
- Return array of time ranges for current and next day
- Test file covers: same-day ranges, cross-midnight ranges, edge times (00:00, 23:59)

### `src/internal/doTimeRangesOverlap.ts` (+ `doTimeRangesOverlap.test.ts`)

- Single export: check if two time ranges overlap
- Handle cross-midnight ranges
- Test file covers: non-overlapping ranges, overlapping ranges, cross-midnight cases, identical ranges

### `src/internal/isTimestampInTimeRange.ts` (+ `isTimestampInTimeRange.test.ts`)

- Single export: check if a timestamp falls within a time range
- Handle cross-midnight ranges and timezone considerations
- Test file covers: timestamps in/out of range, cross-midnight ranges, boundary cases

### `src/internal/doOverridesOverlap.ts` (+ `doOverridesOverlap.test.ts`)

- Single export: check if two override date ranges overlap
- Only applies to specific overrides (both have `to` date)
- Test file covers: non-overlapping dates, overlapping dates, adjacent dates, identical ranges

### `src/internal/hasMultipleIndefiniteOverrides.ts` (+ `hasMultipleIndefiniteOverrides.test.ts`)

- Single export: validate only one indefinite override exists in schedule
- Returns boolean
- Test file covers: no indefinite overrides, one indefinite override, multiple indefinite overrides

## Validation Functions

### `src/validateSchedule.ts` (+ `validateSchedule.test.ts`)

- Single export: main validation function returning `ValidationResult`
- Coordinate all validation checks below
- Return detailed errors for all validation failures
- Test file covers: all validation rules, valid schedules, invalid schedules, edge cases

### `src/internal/validateTimezone.ts` (+ `validateTimezone.test.ts`)

- Validate timezone is in `Intl.supportedValuesOf('timeZone')`
- Return `ValidationError[]`
- Test file covers: valid timezone, invalid timezone, missing timezone

### `src/internal/validateNoMultipleIndefiniteOverrides.ts` (+ `validateNoMultipleIndefiniteOverrides.test.ts`)

- Check for at most one override without `to` property
- Return `ValidationError[]`
- Test file covers: no indefinite overrides, one indefinite override, multiple indefinite overrides

### `src/internal/validateNoOverlappingOverrides.ts` (+ `validateNoOverlappingOverrides.test.ts`)

- Check specific overrides don't overlap
- Return `ValidationError[]`
- Test file covers: non-overlapping overrides, overlapping overrides, adjacent overrides

### `src/internal/validateNoOverlappingTimesInRule.ts` (+ `validateNoOverlappingTimesInRule.test.ts`)

- Check time ranges within each rule don't overlap for same weekday
- Return `ValidationError[]`
- Test file covers: non-overlapping times, overlapping times, different weekdays, cross-midnight ranges

### `src/internal/validateNonEmptyTimes.ts` (+ `validateNonEmptyTimes.test.ts`)

- Check each WeeklyScheduleRule has at least one time range
- Return `ValidationError[]`
- Test file covers: non-empty times, empty times in weekly rules, empty times in override rules

### `src/internal/validateScDateFormats.ts` (+ `validateScDateFormats.test.ts`)

- Validate all SDate, STime, STimestamp, SWeekdays values
- Return `ValidationError[]`
- Test file covers: valid formats, invalid SDate, invalid STime, invalid STimestamp, invalid SWeekdays

## Schedule Management Functions

### `src/cleanupExpiredOverridesFromSchedule.ts` (+ `cleanupExpiredOverridesFromSchedule.test.ts`)

- Single export: remove expired overrides before given date
- Return new Schedule instance (immutable)
- Test file covers: expired overrides, indefinite overrides, immutability

## Availability Query Functions

### `src/isScheduleAvailable.ts` (+ `isScheduleAvailable.test.ts`)

- Single export: check if schedule is available at specific timestamp
- Use `getApplicableRuleForDate()` for rule resolution
- Test file covers: weekly rules, override rules, cross-midnight ranges, DST transitions

### `src/getNextAvailableFromSchedule.ts` (+ `getNextAvailableFromSchedule.test.ts`)

- Single export: find next available timestamp from given time
- Return `STimestamp | undefined`
- Test file covers: finding next opening across days, when already available, with overrides

### `src/getNextUnavailableFromSchedule.ts` (+ `getNextUnavailableFromSchedule.test.ts`)

- Single export: find next unavailable timestamp from given time
- Return `STimestamp | undefined`
- Test file covers: finding next closing across days, when already unavailable, with overrides

### `src/getAvailableRangesFromSchedule.ts` (+ `getAvailableRangesFromSchedule.test.ts`)

- Single export: get all available ranges in date range
- Return `AvailabilityRange[]`
- Test file covers: same-day queries, multi-day queries, override scenarios, cross-midnight handling

## Main Export Module

### `src/index.ts`

- Export all constants from `constants.ts`
- Export all types from `types.ts`
- Export all public functions (validateSchedule, cleanupExpiredOverridesFromSchedule, isScheduleAvailable, etc.)
- Re-export relevant scdate types for convenience (SDate, STime, STimestamp, SWeekdays)

## Integration Tests

### `src/__test__/integration.test.ts`

- Test restaurant schedule with changing hours and holiday overrides
- Test multiple schedules (e.g., business hours + menu availability)
- Test real-world scenarios from usage examples in DESIGN.md
- Test performance with schedules containing many overrides

## Documentation

### Update `README.md`

- Add usage examples from DESIGN.md
- Document all exported functions and types
- Include installation and basic setup instructions

## Package Configuration

### Update `package.json`

- Ensure scdate is listed in dependencies
- Verify peer dependencies match scdate's requirements
- Set correct entry points and exports

### Update `tsconfig.json`

- Verify compiler options match scdate package
- Ensure proper module resolution for scdate imports

## Summary

**Total New Files: 56**

- 1 public constants file (`constants.ts`)
- 1 public types file (`types.ts`)
- 7 internal utility files + co-located test files (14 files total in `internal/`)
- 6 internal validation helper files + co-located test files (12 files total in `internal/`)
- 1 public validation file (`validateSchedule.ts`) + co-located test file
- 1 schedule management file (`cleanupExpiredOverridesFromSchedule.ts`) + co-located test file
- 4 availability query files + co-located test files (8 files total)
- 1 integration test file (`__test__/integration.test.ts`)

**Note:** All implementation files have co-located test files following the pattern `filename.test.ts`.

**Files to Modify: 3**

- `src/index.ts` (replace placeholder)
- `README.md` (add documentation)
- `package.json` (verify dependencies)

**Key Benefits of This Structure:**

- **Tree-shaking friendly**: Each function in its own file for optimal bundler optimization
- **Type safety**: Discriminated union ValidationError with structured data per error type
- **Clear organization**: Easy to find and maintain individual functions
- **Type centralization**: All public types in `types.ts`, all enums in `constants.ts`
- **Testability**: Each function can be tested in isolation
- **Import clarity**: Users import exactly what they need
- **Refactoring safety**: Enums prevent magic strings and enable safe refactoring

**Implementation Order:**

1. Public constants file (`constants.ts`)
2. Public types file (`types.ts`)
3. Internal utility functions (7 files)
4. Internal validation helpers (6 files)
5. Public validation function + test
6. Schedule management function + test
7. Availability query functions + tests (4 functions)
8. Integration tests
9. Main export module (`index.ts`)
10. Documentation updates
