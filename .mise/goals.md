Investigate the following tasks. Do not take them as required. Investigate first whether they make sense from your own critical perspective.

6hgf92XmJJj6953m [infra] add valueOf to scdate SDate, STime and STimestamp so dates sort and compare as strings
6hgff4967VPCX9fm [infra] add an option to scdate getFullDateString to drop the year and the comma

## Task notes

The owner's full notes for the two tasks, verbatim. They are context, not requirements.

### 6hgf92XmJJj6953m [infra] add valueOf to scdate SDate, STime and STimestamp so dates sort and compare as strings

SDate (scdate 7.1.2) has toJSON() but no valueOf(), so code that sorts or compares a SDate | SDateString value has to normalize first: sDate(override.from).date. Example: hosting/utils/pop-up/selectSingleDayOverrides.ts sort.

Change scdate (github.com/ericvera/scdate) to add valueOf() returning the ISO string (YYYY-MM-DD, and the same idea for STime and STimestamp). Then value.valueOf() type-checks on the union (strings already have valueOf(): string), and < / > compare correctly because ISO strings sort in order.

Call out in the release notes: loose equality starts coercing (someSDate == '2025-01-24' becomes true), and sdate + 1 becomes string concatenation. ===, JSON and template literals are unaffected. After the release, bump scdate in Okven and simplify call sites like the one above.

Source: Delta Review note on feat/pop-up-config, hosting/utils/pop-up/selectSingleDayOverrides.ts.

### 6hgff4967VPCX9fm [infra] add an option to scdate getFullDateString to drop the year and the comma

scdate 7.1.2's getFullDateString(date, 'es') always returns "viernes, 5 de febrero de 2021" (comma and year), and getShortDateString abbreviates ("vie, 5 feb"). Spanish sentences in Okven need "sábado 1 de febrero" (full weekday and month, no comma, no year; rule in docs/design/spanish-voice.md), so Okven builds it with a module-level Intl.DateTimeFormat instead.

Change scdate (github.com/ericvera/scdate) to add options to getFullDateString, e.g. { includeYear?: boolean, weekdaySeparator?: string }, then release, bump it in Okven and replace the Intl formatters that build sentence dates: functions/src/utils/order-notification/internal/formatPopUpNotice.ts (DayMonthFormatter) and hosting/utils/pop-up/internal/toPopUpDayParts.ts (the Sentence style).

Source: Delta Review note on feat/pop-up-config, formatPopUpNotice.ts.

## Investigation

Run against the two task titles, before the full notes arrived. Not a bug fix. Nothing to reproduce. All paths below are under `/Users/eric/Code/scdate/packages/scdate`.

### Task 1, valueOf — partly sound, and the task title overclaims

- The classes are `src/internal/SDate.ts:6`, `src/internal/STime.ts:6` and `src/internal/STimestamp.ts:6`. Each has only a readonly string field and `toJSON()` (`SDate.ts:15`). `SWeekdays` has the same shape (`src/internal/SWeekdays.ts:19`) but is out of scope. Follow the `toJSON` pattern.
- The classes are exported as types only (`src/index.ts:8-11`). Adding a method still changes the public API, but it is additive and easy to undo.
- The existing comparisons already use plain string `<`/`<=` on `.date` (`src/sDate.ts:605`, `:624`). `valueOf` would let users write `a < b` on instances. Checked: `tsc --strict` accepts `<` between class instances when `valueOf` returns a string.
- Checked in node that `valueOf` does NOT fix: `[...].sort()` with no comparator (it calls `toString` and gets `"[object Object]"`), `a == b` and `a === b` between two instances (still identity), template literals and `String(x)`, and `a - b` (NaN). "Sort as strings" only works through a comparator using `<`. If comparator-less sorting is the goal, `toString()` is also needed.
- Tests belong next to the existing `describe('JSON.stringify')` blocks: `src/sDate.test.ts:90`, `src/sTime.test.ts:80`, `src/sTimestamp.test.ts:97`.
- `STimestamp` is a `YYYY-MM-DDTHH:MM` wall clock with no zone. String order is right only within one zone. That is the same limit `isBeforeTimestamp` already has.

### Task 2, getFullDateString option — sound, with one open wording point

- `getFullDateString` is at `src/sDate.ts:370`. It takes `(date, locale)` with no options and uses `dateStyle: 'full'` (`:377-380`). `dateStyle` cannot be combined with a year-less field set, so dropping the year means switching to `weekday: 'long', month: 'long', day: 'numeric'`. Precedent for an options interface: `SDateShortStringOptions` (`src/sDate.ts:29`), passed as the 4th arg of `getShortDateString` (`:415`).
- "The comma" is ambiguous in the title. Intl output without the year, checked in node: en `Friday, February 5`; es `viernes, 5 de febrero`; de `Freitag, 5. Februar`; fr `vendredi 5 février`. Dropping the year removes the year's comma in en. The comma after the weekday stays, and whether it appears depends on the locale. Removing it needs string post-processing or `formatToParts`, which is fragile across locales.
- Keep the new parameter optional so existing 2-arg callers (`README.md:122`, tests at `src/sDate.test.ts:726-755`) keep working. Under `exactOptionalPropertyTypes`, use a conditional spread or `undefined` fields the way `getShortDateString` does (`:430-434`).
- Tests go in `describe('getFullDateString')` at `src/sDate.test.ts:726`, as inline snapshots with es and en.
- Update the README Date formatting section (`README.md:121-126`).
- No callers in `scschedule` or `scdate-testing` for either task.

### History and comparator check

Run after the owner recalled removing `toString()` from the classes.

- No commit on any branch ever defined `toString()`, `valueOf()` or `Symbol.toPrimitive` on `SDate`, `STime`, `STimestamp` or `SWeekdays` (`git log --all`, renames followed). Nothing was added, so nothing was removed, and there is no removal reason to find.
- Since the first commit (ec6f42f, "feat: initial implementation", 2024-04-24) each class's only serialization method has been `toJSON()`. The class files were only touched by ec6f42f, df06dc5 (nodenext resolution) and 043cd2f (monorepo move).
- The pickaxe hits for `toString()` and `valueOf()` (ec6f42f, cf6c68e, 30cd27c, 316bd52) are calls on numbers or `Date` inside helpers, such as `hours.toString()` and `isNaN(date.valueOf())`.
- No tracked README mentions them and no tracked CHANGELOG exists.
- Today's source has no exported comparator returning negative, zero or positive. Nothing in `packages/*/src` matches `compare*` or `sort*`.
- Closest existing function: `getDaysBetweenDates(date1, date2)` at `src/sDate.ts:337`, which returns `date2 - date1` in days. As a comparator it sorts descending, covers dates only and rounds to whole days.
- The `isBefore*`, `isSame*` and `isAfter*` functions all return boolean and take `S*String | S*` for both arguments. Dates: `isSameDate` `sDate.ts:578`, `isBeforeDate` `:597`, `isSameDateOrBefore` `:616`, `isAfterDate` `:635`, `isSameDateOrAfter` `:654`. Times: `isSameTime` `sTime.ts:246`, `isAfterTime` `:265`, `isSameTimeOrAfter` `:284`, `isBeforeTime` `:303`, `isSameTimeOrBefore` `:322`. Timestamps: `isSameTimestamp` `sTimestamp.ts:517`, `isBeforeTimestamp` `:536`, `isSameTimestampOrBefore` `:555`, `isAfterTimestamp` `:574`, `isSameTimestampOrAfter` `:593`.
- `SDateString`, `STimeString` and `STimestampString` are plain `string` aliases (`src/types.ts:8`, `:17`, `:26`). Everything is re-exported through `src/index.ts:3-6`.

## Verdict against the full notes

Task 2 makes sense as noted. Task 1 names a real gap and the wrong fix.

- Task 1's premise is half right. Comparing a `SDate | SDateString` value needs no normalizing today: `isBeforeDate`, `isSameDate` and their siblings take the union. Sorting is the gap, because nothing returns an ordering.
- `valueOf()` would close the gap by making the classes coerce to strings. That is the faulty equality and addition the owner wants to avoid: `instance == 'iso-string'` becomes true while `instanceA == instanceB` stays an identity check, and `instance + 1` concatenates. Leaving out `toString()` prevents neither, because `==` and `+` ask for `valueOf()` first. Today, with neither method, nothing coerces.
- `valueOf()` is also a breaking change (the owner's call, 2026-11-12). Results change silently for code that already runs, and `valueOf(): string` becomes a required member of the exported types, so a hand-built `SDate`-shaped object is expected to stop type-checking (not confirmed with tsc).
- Comparator functions close the same gap with no coercion and no breaking release, in the style the library already has. TC39's Temporal made the same choice: `Temporal.PlainDate.compare`, and a `valueOf()` that throws.
- Task 2's comma is the one after the weekday, and it has to go: the target is `sábado 1 de febrero`. Dropping the year alone leaves `sábado, 1 de febrero`.
- `weekdaySeparator` needs a rule for locales that put nothing after the weekday (weekday last, as in ja). The notes give none.
- The notes cite scdate 7.1.2. This repository is at 8.0.0, so the Okven bump crosses a major (date-fns-tz subpath import; vitest 5 for scdate-testing).

## Assumptions

- Task 1 is solved with comparator functions instead of `valueOf()`. Proposed by the driver, pending the owner's approval.
- It adds `compareDates`, `compareTimes` and `compareTimestamps`, named after the existing `isBeforeDate` family. Each takes `S*String | S*` for both arguments, validates the way the `isBefore*` functions do, and returns -1, 0 or 1 in ascending order. It works as an `Array.prototype.sort` comparator directly or wrapped: `(a, b) => compareDates(a.from, b.from)`.
- `compareTimestamps` orders wall clocks, so it is only meaningful within one zone, the same limit `isBeforeTimestamp` has. There is no comparator for `SWeekdays`.
- The classes do not change. No `valueOf()`, `toString()` or `Symbol.toPrimitive`. `a < b` between instances stays what it is today: it compiles and is always false.
- The README documents the comparators next to the existing comparison functions.
- Task 2 adds an optional third argument to `getFullDateString`, an options object with `includeYear?: boolean` and `weekdaySeparator?: string`, following `SDateShortStringOptions`. With no options the output is byte-identical to today's, and the existing snapshots stay untouched.
- `includeYear: false` formats the full weekday, the full month and the day, with no year.
- `weekdaySeparator` replaces the text Intl puts between the weekday and what follows it, found structurally with `formatToParts` and not by searching the string. `' '` gives `sábado 1 de febrero`. It works with or without the year. Where the locale puts nothing after the weekday, it does nothing.
- Tests cover en and es for `getFullDateString`, matching its existing tests.
- The release is a `feat` and a minor. Nothing in either task is breaking.
- Both tasks ship together on this branch as one PR.

## Out of scope

- `valueOf()`, `toString()` and any other implicit coercion on the classes.
- Everything on the Okven side: bumping scdate, changing the sort in `selectSingleDayOverrides.ts` to use `compareDates`, and replacing the Intl formatters in `formatPopUpNotice.ts` and `toPopUpDayParts.ts`. It is a different repository, and it depends on the release that merging this PR publishes. It becomes its own run in Okven afterwards.
- Any other punctuation or formatting change to `getFullDateString` or `getShortDateString`.

## Proposal

- Issue: scdate has no way to sort `SDate | string` values without normalizing them first (`sDate(x).date`), and it cannot produce a year-less, comma-less full date such as `sábado 1 de febrero`.
- Approach: add `compareDates`, `compareTimes` and `compareTimestamps` (take `S*String | S*`, return -1, 0 or 1) in place of `valueOf()`, leaving the classes without implicit coercion; add an optional `{ includeYear?, weekdaySeparator? }` third argument to `getFullDateString` with today's output as the default; document both in the README; ship as a non-breaking `feat`.
- Skips: nothing. Spec and critic both run, because the public API of a published package changes.
