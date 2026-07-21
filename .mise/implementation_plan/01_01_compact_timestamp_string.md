# Task 1.1: Add `getCompactTimestampString` with tests and README entry

## Goal

Add a compact 12-hour timestamp formatter to `packages/scdate`: same date part as the existing `getShortTimestampString`, but the time renders as `8am` / `9:32am` / `11:45pm` (lowercase `am`/`pm`, no space before the period, minutes elided when `:00`). Cover it with unit tests and document it in the package README.

## Requirements addressed

REQ-API-1, REQ-API-2, REQ-API-3, REQ-API-4, REQ-FMT-1, REQ-FMT-2, REQ-FMT-3, REQ-FMT-4, REQ-FMT-5, REQ-PRES-1, REQ-PRES-2, REQ-DOC-1, REQ-TEST-1

## Background

`scdate` is an immutable date/time library. `STimestamp` wraps a timezone-naive `YYYY-MM-DDTHH:MM` string. In `packages/scdate/src/sTimestamp.ts`:

- `getShortTimestampString(timestamp, timeZone, locale, options)` (~line 296) is the model to parallel. It converts the timestamp via `getDateFromTimestamp` (~line 242) and `getTimeFromTimestamp` (~line 256), builds `dateText` with `getShortDateString(date, timeZone, locale, { includeWeekday: options.includeWeekday, onTodayText: options.onTodayAtText })`, builds `timeText` with `get12HourTimeString(time)`, and returns `` `${dateText} ${timeText}` ``.
- Its options interface `STimestampShortStringOptions` (~line 23) has required members `includeWeekday: boolean` and `onTodayAtText: () => string`, each with a TSDoc comment.

In `packages/scdate/src/sTime.ts`:

- `getCompact12HourTimeString(time, options?)` (~line 156) produces the compact time text. Its options interface `STimeCompact12HourStringOptions` (~line 14) has optional `onMidnightText?: () => string` and `onNoonText?: () => string`; each callback fires only when the time is exactly `00:00` / `12:00` and its return value replaces the entire time text. Without callbacks, midnight renders `12am` and noon `12pm`; `00:01` renders `12:01am`.

`packages/scdate/src/index.ts` line 5 already has `export * from './sTimestamp.js'`, so new exports surface automatically.

Style: arrow-function `export const`, TSDoc on every export (with `@param` lines and `@example` blocks — copy the tone of `getShortTimestampString`'s TSDoc), no semicolons, single quotes.

## Files to modify/create

- `packages/scdate/src/sTimestamp.ts` — add `STimestampCompactStringOptions` interface (after `STimestampShortStringOptions`) and `getCompactTimestampString` (directly after `getShortTimestampString`, still in the getters section before the `--- Operations ---` banner). Import `getCompact12HourTimeString` from `./sTime.js` (extend the existing import at line 17).
- `packages/scdate/src/sTimestamp.test.ts` — new `describe('getCompactTimestampString', ...)` block after the `getShortTimestampString` block (ends ~line 478); add the new function to the existing import list from `./sTimestamp.js`.
- `packages/scdate/README.md` — usage example near the existing `getShortTimestampString` usage example (~line 234) and an API-reference bullet modeled on the `getCompact12HourTimeString` bullet (~line 199), placed in the timestamp section's bullet list (~lines 249–255).

## Implementation details

1. Define `STimestampCompactStringOptions`: `includeWeekday: boolean` and `onTodayAtText: () => string` (TSDoc mirroring `STimestampShortStringOptions`), plus `onMidnightText?: () => string` and `onNoonText?: () => string` (TSDoc mirroring `STimeCompact12HourStringOptions` — note they replace the default `12am`/`12pm` text for exact midnight/noon).
2. Implement `getCompactTimestampString(timestamp: STimestampString | STimestamp, timeZone: string, locale: Intl.LocalesArgument, options: STimestampCompactStringOptions): string` exactly like `getShortTimestampString`, except the time text comes from `getCompact12HourTimeString(time, { onMidnightText: options.onMidnightText, onNoonText: options.onNoonText })`.
3. Keep the `` `${dateText} ${timeText}` `` single-space join.
4. Add no validation of your own — `sTimestamp` and `getShortDateString` already throw on invalid timestamp/timeZone (existing behavior is the oracle).
5. Tests: follow the `getShortTimestampString` describe block pattern (`setFakeTimer('2021-08-10T08:00')` from `./__test__/setFakeTimer.js`, `TestLocalTimeZone` from `./__test__/constants.js`, `toMatchInlineSnapshot`). Cover at least:
   - Today + `:00` elision: fake timer `2021-08-10T08:00`, timestamp `2021-08-10T08:00`, expect `Today at 8am` (pass an `STimestamp` instance here to cover instance input).
   - Today + non-zero minutes am: `2021-08-10T09:32` → `Today at 9:32am` (string input).
   - Non-today pm with `:00` elision: `2022-09-11T21:00`, locale `es`, `includeWeekday: true` → snapshot like `dom, 11 sept 22 9pm`.
   - Non-today, `includeWeekday: false`, same year, locale `'es'`: `2021-08-11T08:00` → `11 ago 8am` style snapshot.
   - Midnight without callback: `2021-08-11T00:00` → time text `12am`; noon without callback: `2021-08-11T12:00` → `12pm`.
   - Midnight with `onMidnightText: () => 'midnight'` on today → `Today at midnight`; noon with `onNoonText: () => 'noon'`.
   - Near-boundary non-firing: `2021-08-10T00:01` → `12:01am`, `2021-08-10T12:01` → `12:01pm` (callbacks provided but not fired).
   - Invalid timestamp string (`'2021-08-10T08:00:00'`) and invalid time zone (`'Puerto Rico'`) throw — use `toThrowErrorMatchingInlineSnapshot` like the existing tests at lines 457–477.
6. README: add a one-line usage example (e.g. `getCompactTimestampString(ts, 'America/Puerto_Rico', 'en', { includeWeekday: false, onTodayAtText: () => 'Today at' }) //=> 'Today at 8am'`) and an API bullet describing options — model it on the existing `getCompact12HourTimeString` bullet (~line 199) and the `getShortTimestampString` documentation.

## Testing suggestions

- Run `yarn test:utc` (fixed timezone; inline snapshots depend on it).
- Test exception (from `.claude/mise-config.md`): no e2e infrastructure exists — verification is unit tests plus manual verification; no e2e task applies.

## Gotchas

- Snapshots are timezone-sensitive (locale is an explicit parameter): run tests only via `yarn test:utc` (TZ=Etc/Universal), not bare `vitest`.
- `setFakeTimer` sets "now" — required for any `Today at` expectation; non-today expectations still need it so the year-elision (`22` suffix) is deterministic.
- The midnight/noon callbacks replace only the **time** text — the date text (e.g. `Today at`) still precedes it.
- Pass the two optional callbacks through even when `undefined` (a single options object literal is fine — `getCompact12HourTimeString` checks truthiness).
- Prettier config: no semicolons, single quotes — run `yarn prettier --write .` before finishing.

## Verification checklist

- [ ] `yarn test:utc` green, including the new describe block covering every REQ-TEST-1 case
- [ ] `yarn build` and `yarn lint` green
- [ ] `getShortTimestampString` tests untouched and green (REQ-PRES-1)
- [ ] README shows the new function with a compact example
- [ ] E2e: not applicable — Test exception "no e2e infrastructure exists" (unit tests + manual verification instead)
