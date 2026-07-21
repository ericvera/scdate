# Goals

## Original description

support a short form of time that shows as 9pm or 9:32am (no spacing between number and am/pm and :00 removed).

## Refined scope (after codebase review)

The requested compact time format already exists for `STime`: `getCompact12HourTimeString` in `packages/scdate/src/sTime.ts` (shipped in v6.0.0, tested, documented). This work **extends compact formatting to `STimestamp`**.

### Deliverable

New exported function in `packages/scdate/src/sTimestamp.ts`:

```
getCompactTimestampString(timestamp, timeZone, locale, options): string
```

- Parallel to the existing `getShortTimestampString`: same date part (via `getShortDateString`), but the time part uses `getCompact12HourTimeString` instead of `get12HourTimeString`.
- Example outputs: `Today at 8am`, `dom, 11 sept 22 8:32am`.
- Options interface (new, e.g. `STimestampCompactStringOptions`): `includeWeekday` and `onTodayAtText` (as in `STimestampShortStringOptions`), plus optional `onMidnightText` / `onNoonText` passed through to the compact time formatter (so e.g. "Today at midnight" is expressible).

### In scope

- The new function + its options interface in `packages/scdate/src/sTimestamp.ts`.
- Unit tests in `packages/scdate/src/sTimestamp.test.ts` (colocated, vitest, run via `yarn test:utc`).
- README entry in `packages/scdate/README.md` alongside `getShortTimestampString`.

### Out of scope

- No changes to `getShortTimestampString` or any existing function's output.
- No changes to `scschedule`.
- No new standalone time-part helper (already composable via `getCompact12HourTimeString(getTimeFromTimestamp(ts))`).

## Decisions (user-confirmed)

1. Shape: new parallel function `getCompactTimestampString` (not a breaking change to `getShortTimestampString`).
2. Options: `includeWeekday`, `onTodayAtText`, plus optional `onMidnightText`/`onNoonText`.
3. Scope: scdate only — function, tests, README.
