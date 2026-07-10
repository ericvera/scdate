# v5 Migration Notes (draft — planned breaking changes)

> Status: **planning document**. These changes are not yet implemented. This
> note captures the agreed design for the next major version so the migration
> path is defined before the work starts. Fold the relevant parts into the v5
> release notes when the version ships.

## Summary

v5 changes time-range semantics from **inclusive** (`to` is the last available
minute) to **half-open** (`from` inclusive, `to` exclusive — the instant
availability ends). This matches the convention used by iCalendar
(RFC 5545 / RFC 7953 `DTEND`), spatie/opening-hours, opening_hours.js,
later.js, and Luxon intervals.

What it eliminates:

- The `+1 minute` result shape (`17:01` as "next unavailable") and its
  coupling to minute granularity.
- The `timeZone` parameter on next-unavailable queries (no more DST-safe
  minute arithmetic — every returned boundary is a schedule-listed time).
- The `23:59` full-day wart (`00:00`–`23:59` becomes `00:00`–`00:00`).
- Range splitting at `23:59`/`00:00` in `getAvailableRangesFromSchedule`
  output for consecutive full days and cross-midnight ranges.

## New semantics

- A rule `{ from: '09:00', to: '17:00' }` is available for
  `09:00 <= t < 17:00`. The `17:00` minute is NOT available.
- Cross-midnight is unchanged mechanically: `from > to` wraps past midnight
  (`22:00`–`02:00` is available `22:00 <= t` or `t < 02:00` next day).
- `from === to` is defined as a full 24-hour range (duration
  `(to - from) mod 24h`, with `0` meaning 24h). Full day = `00:00`–`00:00`.
  (Decision to confirm at implementation time; the alternative is keeping
  full-day special-cased.)
- `AvailabilityRange.to` becomes exclusive as well.
- Rule adjacency is `a.to === b.from` (no gap, no overlap). Overlap
  validation becomes `a.to > b.from` on the same weekday instead of
  +1-minute probing.

## API changes

### Removed

| Method                                                                | Replacement                                                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `getNextUnavailableFromSchedule(schedule, timeZone, from, maxDays)`   | `getNextAvailabilityRangeFromSchedule(schedule, from, maxDays)` → read `range.to`   |
| `getNextUnavailableFromSchedules(schedules, timeZone, from, maxDays)` | `getNextAvailabilityRangeFromSchedules(schedules, from, maxDays)` → read `range.to` |

### Deprecated (kept as one-line conveniences, may be removed in v6)

| Method                                                    | Replacement                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `getNextAvailableFromSchedule(schedule, from, maxDays)`   | `range.from` (or `from` when already inside the range)                       |
| `getNextAvailableFromSchedules(schedules, from, maxDays)` | New multi-range result carries both `range` and `unavailableScheduleIndexes` |

### Added

| Method                                                                             | Returns                                                                                                                                      |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `getNextAvailabilityRangeFromSchedule(schedule, fromTimestamp, maxDaysToSearch)`   | `AvailabilityRange \| undefined` — the range containing `fromTimestamp`, or the next one to begin within the window                          |
| `getNextAvailabilityRangeFromSchedules(schedules, fromTimestamp, maxDaysToSearch)` | `{ range: AvailabilityRange \| undefined, unavailableScheduleIndexes: number[] }` — indexes are the schedules unavailable at `fromTimestamp` |

"Which schedule ends the availability" is answered by
`getUnavailableScheduleIndexes(schedules, range.to)` — valid because
`range.to` is now the first unavailable instant.

### Unchanged signatures (semantics shift underneath)

`isScheduleAvailable`, `areSchedulesAvailable`,
`getUnavailableScheduleIndexes`, `getAvailableRangesFromSchedule`,
`getApplicableRuleForDate`, `isInOvernightSpillover`, `validateSchedule`,
`cleanupExpiredOverridesFromSchedule`, `AlwaysAvailableSchedule`,
`NeverAvailableSchedule`.

## Stored-data migration checklist

Run against every persisted schedule before upgrading:

1. **End-of-day sentinels.** Any rule with `to: '23:59'` meaning "through end
   of day" → rewrite to `to: '00:00'` (now a cross-midnight/full-day form).
   Skip if no such rows exist.
2. **Adjacent ranges (split shifts).** Under v4, back-to-back ranges are
   stored as `to: '12:00'` + `from: '12:01'`. Under v5 adjacency is
   `to: '12:00'` + `from: '12:00'`; unmigrated data develops a one-minute
   hole. Find every rule whose `from` equals another same-day rule's `to`
   plus one minute and normalize `from` back by one minute.
3. **Closing-time intent (behavioral, no data change).** Every `to` now ends
   availability one minute earlier than v4 evaluated it.
   `isScheduleAvailable(s, '...T17:00')` flips from `true` to `false` for a
   `09:00`–`17:00` rule. This usually matches configured human intent
   ("closes at 17:00") but must be verified against app-level tests,
   snapshots, and UI copy that compensated for inclusive ends (e.g. code
   doing `-1 minute` for display).
4. **Overrides need no migration** — they are date-based (`from`/`to` dates
   stay inclusive; only _time_ ranges change convention).

## Caller-code migration examples

```typescript
// v4: "available until" required trimming the +1 minute
const nextUnavailable = getNextUnavailableFromSchedule(s, tz, now, 30) // 17:01

// v5: the boundary is the answer, no timeZone
const range = getNextAvailabilityRangeFromSchedule(s, now, 30)
range?.to // 17:00
```

```typescript
// v4: two calls to render "available Monday 11:00 until 14:00"
const { timestamp } = getNextAvailableFromSchedules(schedules, now, 30)
const { timestamp: until } = getNextUnavailableFromSchedules(
  schedules,
  tz,
  timestamp,
  30,
)

// v5: one call
const { range, unavailableScheduleIndexes } =
  getNextAvailabilityRangeFromSchedules(schedules, now, 30)
// range.from, range.to, and why-blocked-now, together
```
