# Implementation Plan

## Summary

Add `getCompactTimestampString` to `packages/scdate` — a compact 12-hour counterpart to the existing `getShortTimestampString` that renders the time part as `8am` / `9:32am` (lowercase am/pm, no space, `:00` elided) instead of `8:00 AM`. Ships with unit tests and a README entry; no existing function changes.

## Design

One new exported function plus one new options interface in `packages/scdate/src/sTimestamp.ts`, composed entirely from existing building blocks:

```
getCompactTimestampString(timestamp, timeZone, locale, options)
  ├─ getDateFromTimestamp(ts)  → SDate
  ├─ getTimeFromTimestamp(ts)  → STime
  ├─ dateText = getShortDateString(date, timeZone, locale,
  │              { includeWeekday, onTodayText: options.onTodayAtText })
  ├─ timeText = getCompact12HourTimeString(time,
  │              { onMidnightText, onNoonText })   ← only new wiring
  └─ return `${dateText} ${timeText}`
```

`STimestampCompactStringOptions` = `{ includeWeekday: boolean; onTodayAtText: () => string; onMidnightText?: () => string; onNoonText?: () => string }` — the first two mirror `STimestampShortStringOptions` (required), the last two pass through to `getCompact12HourTimeString` (optional). No data-model, index, or build changes; `export * from './sTimestamp.js'` in `index.ts` already surfaces the new symbols.

## Assumptions

- The function sits directly after `getShortTimestampString` in the getters section, and the options interface after `STimestampShortStringOptions`, following the file's organization.
- Tests use inline snapshots and `setFakeTimer`, matching the `getShortTimestampString` describe block.
- Test exception applies (from `.claude/mise-config.md`): no e2e infrastructure exists — verification is unit tests plus the quality commands.

## Phases

- **Phase 1: Implement** — the function, its options interface, unit tests, and README documentation, all in one green task.

## Phase Rationale

The change is a single self-contained composition of existing helpers; splitting implementation from tests or docs would create no independently useful intermediate state.

## Task Index

| File                                | Task                                             | Phase | Requirements                                                     |
| ----------------------------------- | ------------------------------------------------ | ----- | ---------------------------------------------------------------- |
| `01_01_compact_timestamp_string.md` | Add `getCompactTimestampString` + tests + README | 1     | REQ-API-1..4, REQ-FMT-1..5, REQ-PRES-1..2, REQ-DOC-1, REQ-TEST-1 |
