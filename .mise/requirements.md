# Requirements

This document specifies the user-facing requirements for `getCompactTimestampString`, a compact 12-hour timestamp formatter in `packages/scdate`.

## 1. Function surface

- **REQ-API-1:** The package MUST export a function `getCompactTimestampString(timestamp, timeZone, locale, options)` from `packages/scdate/src/sTimestamp.ts` (and thus from the package root via the existing `export * from './sTimestamp.js'`).
- **REQ-API-2:** The `timestamp` parameter MUST accept an `STimestamp` instance or an `STimestampString` (`YYYY-MM-DDTHH:MM`), matching every other timestamp function.
- **REQ-API-3:** The `timeZone` and `locale` parameters MUST have the same meaning as in `getShortTimestampString`: `timeZone` drives both the today-comparison and the current-year check (which decides whether the 2-digit year appears in the date text), and `locale` drives the date text formatting.
- **REQ-API-4:** The package MUST export a new options interface `STimestampCompactStringOptions` with: `includeWeekday: boolean` (required), `onTodayAtText: () => string` (required), `onMidnightText?: () => string` (optional), `onNoonText?: () => string` (optional).

## 2. Output format

- **REQ-FMT-1:** The output MUST be `<dateText> <timeText>` where `<dateText>` is exactly what `getShortDateString` produces for the timestamp's date part with `{ includeWeekday, onTodayText: onTodayAtText }` — identical to the date part of `getShortTimestampString`.
- **REQ-FMT-2:** `<timeText>` MUST be the compact 12-hour form of the timestamp's time part as produced by `getCompact12HourTimeString`: lowercase `am`/`pm`, no space before the period, minutes omitted when `:00` (e.g. `8am`, `9:32am`, `11:45pm`).
- **REQ-FMT-3:** When the timestamp falls on today (in `timeZone`) and `onTodayAtText` returns e.g. `Today at`, the output MUST read like `Today at 8am`.
- **REQ-FMT-4:** When the time part is exactly `00:00` and `onMidnightText` is provided, its return value MUST replace the entire time text (e.g. `Today at midnight`); likewise `onNoonText` for exactly `12:00`. When these callbacks are absent, midnight MUST render as `12am` and noon as `12pm`.
- **REQ-FMT-5:** Times other than exactly `00:00`/`12:00` MUST NOT trigger the midnight/noon callbacks (e.g. `00:01` renders `12:01am`).

## 3. Preserved behavior

- **REQ-PRES-1:** The output of `getShortTimestampString`, `getCompact12HourTimeString`, and every other existing exported function MUST be unchanged.
- **REQ-PRES-2:** The new function MUST NOT mutate its inputs (all scdate values are immutable) and MUST validate inputs the same way as existing timestamp functions, with existing behavior as the oracle: invalid timestamp strings throw as `sTimestamp` already does, and invalid `timeZone`/`locale` values behave as they do in `getShortTimestampString` (no new validation added).

## 4. Documentation and tests

- **REQ-DOC-1:** `packages/scdate/README.md` MUST document the new function and its options alongside `getShortTimestampString`, including a compact example output.
- **REQ-TEST-1:** Unit tests MUST live in `packages/scdate/src/sTimestamp.test.ts` and cover: today vs non-today dates, `:00` minutes elision, non-zero minutes, an am time and a pm time away from the noon/midnight specials (e.g. `09:32` → `9:32am`, `21:00` → `9pm`), near-boundary times that must NOT trigger the callbacks (`00:01`, `12:01`), midnight/noon with and without callbacks, `includeWeekday` on/off, and string vs `STimestamp` input.

## Out of Scope

- Any change to `getShortTimestampString` or other existing functions' output.
- Any change to `packages/scschedule`.
- A standalone compact-time-of-timestamp helper (composable today via `getCompact12HourTimeString(getTimeFromTimestamp(ts))`).
- Locale-aware formatting of the time part (the compact time is intentionally English-style `am`/`pm`, matching `getCompact12HourTimeString`).

## Assumptions

- The options object is required (like `getShortTimestampString`'s), with `includeWeekday` and `onTodayAtText` required members — parity beats optionality here.
- `onMidnightText`/`onNoonText` replace only the time text; the date text still precedes it (so `Today at midnight` arises from `onTodayAtText` + `onMidnightText`, matching REQ-FMT-1/4 composition).
- The separator between date and time text is a single space, as in `getShortTimestampString`.
- Interface name `STimestampCompactStringOptions` follows the existing `STimestampShortStringOptions` naming pattern.
