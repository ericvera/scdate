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

## Verdict against the full notes

Both tasks make sense. The notes settle the two points the titles left open, and they miss five things.

- Task 1's call site sorts with a comparator, so `valueOf()` covers it: `a.from < b.from` and `a.from.valueOf()` both work on `SDate | string`. `a < b` between instances already compiles today and is always false, so this turns a silently wrong expression into a correct one.
- Task 2's comma is the one after the weekday, and it has to go: the target is `sábado 1 de febrero`. Dropping the year alone leaves `sábado, 1 de febrero`.
- Missed 1: the `==` call-out is half the story. `instance == 'iso-string'` becomes true, but `instanceA == instanceB` stays an identity check, so two equal dates are `<=` and `>=` each other and still not `==`. JS `Date` has the same wart.
- Missed 2: the title says "sort", but with `valueOf()` alone `.sort()` with no comparator still does not order instances. That takes `toString()`.
- Missed 3: `weekdaySeparator` needs a rule for locales that put nothing after the weekday (weekday last, as in ja).
- Missed 4: the notes cite scdate 7.1.2. This repository is at 8.0.0, so the Okven bump crosses a major (date-fns-tz subpath import; vitest 5 for scdate-testing).
- Missed 5: `valueOf()` without `toString()` leaves the two string coercions disagreeing. `sdate + ''` gives the ISO string and a template literal gives `[object Object]`.

## Breaking change

The owner's call, 2026-11-12: task 1 is a breaking change.

- Results change silently for code that already runs: `instance == 'iso-string'` goes from false to true, `instance + x` from `[object Object]…` to the ISO string, `<` and `>` between instances from always false to a real comparison, and `new Date(instance)` from an invalid date to a parsed one.
- `valueOf(): string` becomes a required member of the exported types, so an object built by hand to the `SDate` shape is expected to stop type-checking. Not yet confirmed with tsc. The spec confirms it.
- It ships as `feat!`, a major release. The squash commit carries a `BREAKING CHANGE:` footer of one or two sentences, which is what puts the notes' call-outs into the generated release notes.
- Task 2 is not breaking on its own. It rides in the same release.

## Open questions

1. Proposed, pending the owner's approval: add `toString()` alongside `valueOf()`, and cover `SWeekdays` alongside the three named classes. Both were out of scope in the first proposal.

## Assumptions

- Task 1 adds `valueOf()` and `toString()` to `SDate`, `STime`, `STimestamp` and `SWeekdays`, each returning the same string `toJSON()` returns. `toString()` is in because a later addition would change template-literal output and need a second breaking release, and because without it the coercions disagree (Missed 5). `SWeekdays` is in so all four value classes coerce the same way in the one major.
- The README documents the comparison semantics: `<`, `>`, `<=`, `>=` work on instances and on `SDate | string` unions; `instance == 'iso-string'` is true; `==` and `===` between two instances stay identity checks, so equality still goes through the `isSame*` functions; `instance + 1` concatenates; template literals, `String()` and `.sort()` with no comparator use the string form; ordering `SWeekdays` values is defined but means nothing; `STimestamp` order is only meaningful within one zone.
- Task 2 adds an optional third argument to `getFullDateString`, an options object with `includeYear?: boolean` and `weekdaySeparator?: string`, following `SDateShortStringOptions`. With no options the output is byte-identical to today's, and the existing snapshots stay untouched.
- `includeYear: false` formats the full weekday, the full month and the day, with no year.
- `weekdaySeparator` replaces the text Intl puts between the weekday and what follows it, found structurally with `formatToParts` and not by searching the string. `' '` gives `sábado 1 de febrero`. It works with or without the year. Where the locale puts nothing after the weekday, it does nothing.
- Tests cover en and es, matching the existing `getFullDateString` tests.
- Both tasks ship together on this branch as one PR.

## Out of scope

- Everything on the Okven side: bumping scdate, simplifying the comparison call sites, and replacing the Intl formatters in `formatPopUpNotice.ts` and `toPopUpDayParts.ts`. It is a different repository, and it depends on the release that merging this PR publishes. It becomes its own run in Okven afterwards.
- Any other punctuation or formatting change to `getFullDateString` or `getShortDateString`.

## Proposal

- Issue: scdate makes callers normalize `SDate | string` values before comparing them (`sDate(x).date`), and it cannot produce a year-less, comma-less full date such as `sábado 1 de febrero`.
- Approach: add `valueOf()` and `toString()` returning the string form to `SDate`, `STime`, `STimestamp` and `SWeekdays`; add an optional `{ includeYear?, weekdaySeparator? }` third argument to `getFullDateString` with today's output as the default; document the comparison semantics in the README; ship as `feat!` with a `BREAKING CHANGE:` footer.
- Skips: nothing. Spec and critic both run, because the public API of a published package changes.
