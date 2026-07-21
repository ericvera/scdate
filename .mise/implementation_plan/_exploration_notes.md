# Exploration notes

## Key files

- `packages/scdate/src/sTimestamp.ts` — target file. Existing parallel: `getShortTimestampString` (line ~296) builds `${dateText} ${timeText}` from `getShortDateString(date, timeZone, locale, { includeWeekday, onTodayText: options.onTodayAtText })` and `get12HourTimeString(time)`. Uses `getDateFromTimestamp` (line ~242) and `getTimeFromTimestamp` (line ~256). Options interface `STimestampShortStringOptions` (line ~23): `includeWeekday: boolean`, `onTodayAtText: () => string` — both required, TSDoc on each member.
- `packages/scdate/src/sTime.ts` — `getCompact12HourTimeString(time, options?)` (line ~156), options `STimeCompact12HourStringOptions` (line ~14): `onMidnightText?: () => string`, `onNoonText?: () => string`. Callback fires only when `sTimeValue.time === '00:00'` / `'12:00'` exactly and replaces the whole time text.
- `packages/scdate/src/index.ts` — `export * from './sTimestamp.js'` (line 5); no index change needed.
- `packages/scdate/src/sTimestamp.test.ts` — colocated vitest tests. Pattern for `getShortTimestampString` (line 409–478): `setFakeTimer('2021-08-10T08:00')` from `./__test__/setFakeTimer.js`, `TestLocalTimeZone` from `./__test__/constants.js`, `toMatchInlineSnapshot`, `beforeEach(() => vi.useRealTimers())` already at top. Invalid-input tests use `toThrowErrorMatchingInlineSnapshot`.
- `packages/scdate/README.md` — usage example around line 172 (compact time), API reference list entry for `getShortTimestampString`; new entry goes alongside it (timestamp section, ~line 199 region documents compact time formatter style).

## Conventions

- Prettier: no semicolons, single quotes, 2-space. Arrow-function exports with TSDoc on every export.
- Section banner comments in source files (`/** --- Getters --- */` etc.); `getShortTimestampString` sits at the end of the getters section, before `--- Operations ---`.
- Quality commands: Format `yarn prettier --write .`; Check `yarn build` then `yarn lint`; Unit tests `yarn test:utc`.
