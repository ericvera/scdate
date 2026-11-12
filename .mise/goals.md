Investigate the following tasks. Do not take them as required. Investigate first whether they make sense from your own critical perspective.

6hgf92XmJJj6953m [infra] add valueOf to scdate SDate, STime and STimestamp so dates sort and compare as strings
6hgff4967VPCX9fm [infra] add an option to scdate getFullDateString to drop the year and the comma

## Investigation

Not a bug fix. Nothing to reproduce. All paths below are under `/Users/eric/Code/scdate/packages/scdate`.

### Task 1, valueOf — partly sound, and the task title overclaims

- The classes are `src/internal/SDate.ts:6`, `src/internal/STime.ts:6` and `src/internal/STimestamp.ts:6`. Each has only a readonly string field and `toJSON()` (`SDate.ts:15`). `SWeekdays` has the same shape (`src/internal/SWeekdays.ts:19`) but is out of scope. Follow the `toJSON` pattern.
- The classes are exported as types only (`src/index.ts:8-11`). Adding a method still changes the public API, but it is additive and easy to undo.
- The existing comparisons already use plain string `<`/`<=` on `.date` (`src/sDate.ts:605`, `:624`). `valueOf` would let users write `a < b` on instances. Checked: `tsc --strict` accepts `<` between class instances when `valueOf` returns a string.
- Checked in node that `valueOf` does NOT fix: `[...].sort()` with no comparator (it calls `toString` and gets `"[object Object]"`), `a == b` and `a === b` (still identity), template literals and `String(x)`, and `a - b` (NaN). "Sort as strings" only works through a comparator using `<`. If comparator-less sorting is the goal, `toString()` is also needed.
- Tests belong next to the existing `describe('JSON.stringify')` blocks: `src/sDate.test.ts:90`, `src/sTime.test.ts:80`, `src/sTimestamp.test.ts:97`.
- `STimestamp` is a `YYYY-MM-DDTHH:MM` wall clock with no zone. String order is right only within one zone. That is the same limit `isBeforeTimestamp` already has.

### Task 2, getFullDateString option — sound, with one open wording point

- `getFullDateString` is at `src/sDate.ts:370`. It takes `(date, locale)` with no options and uses `dateStyle: 'full'` (`:377-380`). `dateStyle` cannot be combined with a year-less field set, so dropping the year means switching to `weekday: 'long', month: 'long', day: 'numeric'`. Precedent for an options interface: `SDateShortStringOptions` (`src/sDate.ts:29`), passed as the 4th arg of `getShortDateString` (`:415`).
- "The comma" is ambiguous. Intl output without the year, checked in node: en `Friday, February 5`; es `viernes, 5 de febrero`; de `Freitag, 5. Februar`; fr `vendredi 5 février`. Dropping the year removes the year's comma in en. The comma after the weekday stays, and whether it appears depends on the locale. Removing it needs string post-processing or `formatToParts`, which is fragile across locales.
- Keep the new parameter optional so existing 2-arg callers (`README.md:122`, tests at `src/sDate.test.ts:726-755`) keep working. Under `exactOptionalPropertyTypes`, use a conditional spread or `undefined` fields the way `getShortDateString` does (`:430-434`).
- Tests go in `describe('getFullDateString')` at `src/sDate.test.ts:726`, as inline snapshots with es and en.
- Update the README Date formatting section (`README.md:121-126`).
- No callers in `scschedule` or `scdate-testing` for either task.

## Open questions

1. Task 1 scope: `valueOf` alone makes `a < b` work on instances but not `.sort()` with no comparator, nor `==`/`===`. Add `valueOf` + `toString`, `valueOf` only, or drop the task?
2. Task 2: does "drop the comma" mean only the comma before the year (plain Intl output without the year), or the weekday comma too?
