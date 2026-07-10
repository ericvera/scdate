# Migrating scschedule from v5 to v6

v6 changes time-range semantics from **inclusive** (`to` was the last
available minute) to **half-open** (`from` inclusive, `to` exclusive — the
instant availability ends). This matches the convention used by iCalendar
(RFC 5545 / RFC 7953 `DTEND`), spatie/opening-hours, opening_hours.js,
later.js, and Luxon intervals. No scschedule function takes a time zone
anymore: every returned boundary is a schedule-listed time, so there is no
DST-sensitive minute arithmetic.

(v5's only breaking change was requiring Node.js >= 24, so the "v5" behavior
described below has been in place since v4.)

## Breaking changes to the published v5 API

### Time ranges are now half-open

- `{ from: '09:00', to: '17:00' }` is available for `09:00 <= t < 17:00`.
  The `17:00` minute is no longer available —
  `isScheduleAvailable(s, '...T17:00')` flips from `true` to `false`.
- A `to` of `00:00` means "until the end of the day" (`22:00`–`00:00` ends
  exactly at midnight, no spillover). `00:00`–`00:00` is a full day and
  replaces the v5 `00:00`–`23:59` idiom.
- `from` equal to `to` (other than `00:00`) covers a full 24 hours.
- Adjacent ranges share a boundary: `09:00`–`12:00` + `12:00`–`17:00` is now
  valid (no overlap error) and forms one contiguous period.

### `getNextUnavailableFromSchedule` removed

Replaced by `getNextAvailabilityRangeFromSchedule(schedule, fromTimestamp,
maxDaysToSearch)`, which returns `{ available, range }` — whether the
schedule is available at `fromTimestamp`, and the availability range
(`{ from, to }`) containing `fromTimestamp` or the next one to begin.
`range.to` is the first unavailable instant (v5 returned that instant plus
one minute), and is `undefined` when availability does not end within the
search window. The `timeZone` parameter is gone.

```typescript
// v5
const nextUnavailable = getNextUnavailableFromSchedule(s, tz, now, 30) // 17:01

// v6
const { available, range } = getNextAvailabilityRangeFromSchedule(s, now, 30)
range?.to // 17:00
```

### `getAvailableRangesFromSchedule` output changed

`AvailabilityRange.to` is now exclusive. Full days are emitted as `00:00` to
the next day's `00:00` (previously `00:00`–`23:59`).

### `isValidTimeZone` re-export removed

Import it from `scdate` instead. No scschedule function takes a time zone
anymore (schedules are wall-clock definitions), so the re-export no longer
belongs to this package's surface. Time zones are only needed to produce
query timestamps with scdate (e.g., `getTimestampNow(timeZone)`).

### Unchanged signatures (semantics shift underneath)

`isScheduleAvailable`, `getNextAvailableFromSchedule` (kept as a
convenience — equivalent to reading `range.from`), `getApplicableRuleForDate`,
`isInOvernightSpillover`, `validateSchedule`,
`cleanupExpiredOverridesFromSchedule`. All boundary checks follow the
half-open rule (e.g. spillover from `22:00`–`02:00` ends at `02:00`, not
`02:01`).

## Stored-data migration checklist

Run against every persisted schedule before upgrading:

1. **End-of-day sentinels.** Any rule with `to: '23:59'` meaning "through end
   of day" → rewrite to `to: '00:00'`. Skip if no such rows exist.
2. **Adjacent ranges (split shifts).** v5 back-to-back ranges are stored as
   `to: '12:00'` + `from: '12:01'`. v6 adjacency is `to: '12:00'` +
   `from: '12:00'`; unmigrated data develops a one-minute hole. Find every
   rule whose `from` equals another same-day rule's `to` plus one minute and
   move `from` back by one minute.
3. **Closing-time intent (behavioral, no data change).** Every `to` now ends
   availability one minute earlier than v5 evaluated it. This usually matches
   configured human intent ("closes at 17:00") but verify app-level tests,
   snapshots, and UI copy that compensated for inclusive ends (e.g. code
   doing `-1 minute` for display).
4. **Overrides need no migration** — they are date-based (`from`/`to` dates
   stay inclusive; only _time_ ranges change convention).

## New in v6 (no migration needed)

Multi-schedule (layered availability) queries — schedules combine by
intersection (e.g. business hours ∩ menu ∩ item):

- `areSchedulesAvailable(schedules, timestamp)`
- `getUnavailableScheduleIndexes(schedules, timestamp)` — which schedules
  block availability at a point in time
- `getNextAvailabilityRangeFromSchedules(schedules, fromTimestamp,
maxDaysToSearch)` — whether everything is available at `fromTimestamp`, the
  intersected availability range, and the indexes blocking at `fromTimestamp`
- `AlwaysAvailableSchedule` / `NeverAvailableSchedule` frozen constants
