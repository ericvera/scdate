# 01_01 Add compareDates, compareTimes and compareTimestamps

## Goal

Add three exported comparator functions to the `scdate` package that order two values and return `-1`, `0` or `1` in ascending order, so callers can sort `SDate | string` (and time/timestamp) values without normalizing them first.

## Files to modify/create

All under `/Users/eric/Code/scdate/packages/scdate/`.

- `src/sDate.ts` — add `compareDates`
- `src/sTime.ts` — add `compareTimes`
- `src/sTimestamp.ts` — add `compareTimestamps`
- `README.md` — document them

Tests (do not count): `src/sDate.test.ts`, `src/sTime.test.ts`, `src/sTimestamp.test.ts`.

## Background

- First task of the run. Repo is a yarn monorepo; `scdate` is at `packages/scdate`. Everything in `src/sDate.ts`, `src/sTime.ts`, `src/sTimestamp.ts` is re-exported by `export *` in `src/index.ts:3-5`, so new exports need no change there.
- Value classes: `SDate` (`src/internal/SDate.ts`, field `date`, `YYYY-MM-DD`), `STime` (`src/internal/STime.ts`, field `time`, `HH:MM`), `STimestamp` (`src/internal/STimestamp.ts`, field `timestamp`, `YYYY-MM-DDTHH:MM`). The string aliases `SDateString`, `STimeString`, `STimestampString` are plain `string` (`src/types.ts`). ISO strings sort chronologically as strings.
- Pattern to follow: `isBeforeDate` at `src/sDate.ts:597`, `isBeforeTime` at `src/sTime.ts:303`, `isBeforeTimestamp` at `src/sTimestamp.ts:536`. They take `S*String | S*` for both args, normalize through the factory (`sDate`, `sTime`, `sTimestamp`), which validates and throws, and compare the string fields with `<`. Copy their JSDoc style (`@param date1 The first date to compare. It can be an SDate or a string in the YYYY-MM-DD format.`).
- Placement: in each file's `--- Comparisons ---` section, right after the last comparison function: after `isSameDateOrAfter` (`src/sDate.ts:654-662`), after `isSameTimeOrBefore` (`src/sTime.ts:322-330`), after `isSameTimestampOrAfter` (end of `src/sTimestamp.ts`).
- Design decisions: return type is the literal union `-1 | 0 | 1`; ascending order (first arg earlier returns `-1`); no comparator for `SWeekdays`; `compareTimestamps` orders wall clocks and is meaningful within one zone only, the same limit `isBeforeTimestamp` has. A later task (01_02) makes `valueOf()` on the classes throw and its error message names `compareDates()`, `compareTimes()`, `compareTimestamps()`, so the names must be exactly these.

## Guides

None. The mise config has no Skills & guides entries.

## Implementation details

1. In `src/sDate.ts`:

   ```ts
   /**
    * Compares two dates for sorting. Returns -1 when the first date is before
    * the second, 1 when it is after, and 0 when both are the same date. Can be
    * passed directly to `Array.prototype.sort`.
    *
    * @param date1 ... (same wording as isBeforeDate)
    * @param date2 ...
    *
    * @example
    * ```ts
    * ['2024-03-01', '2024-01-15'].sort(compareDates)
    * //=> ['2024-01-15', '2024-03-01']
    * ```
    */
   export const compareDates = (
     date1: SDateString | SDate,
     date2: SDateString | SDate,
   ): -1 | 0 | 1 => {
     const value1 = sDate(date1).date
     const value2 = sDate(date2).date

     if (value1 < value2) {
       return -1
     }

     if (value1 > value2) {
       return 1
     }

     return 0
   }
   ```

   Use `if` blocks with braces (`curly` is enforced), not nested ternaries.
2. Same for `compareTimes(time1: STimeString | STime, time2: STimeString | STime)` in `src/sTime.ts` using `sTime(...).time`, and `compareTimestamps(timestamp1, timestamp2)` in `src/sTimestamp.ts` using `sTimestamp(...).timestamp`. In the `compareTimestamps` JSDoc, note that it compares wall-clock values and is only meaningful for timestamps in the same time zone.
3. README (`/Users/eric/Code/scdate/packages/scdate/README.md`):
   - Add `const order = compareDates(date1, date2) // -1, 0 or 1 (use as a sort comparator)` after the `isSameDateOrAfter` line (line 114) in the Date comparison block. Same for `compareTimes(time1, time2)` after line 193 and `compareTimestamps(ts1, ts2)` after line 257.
   - Add one bullet to the Date "Important Behaviors and Edge Cases" list: **`compareDates(date1, date2)` / `compareTimes` / `compareTimestamps`**: return `-1`, `0` or `1` in ascending order and can be passed to `Array.prototype.sort` directly (`dates.sort(compareDates)`) or wrapped (`items.sort((a, b) => compareDates(a.from, b.from))`). `compareTimestamps` compares wall-clock values, so it is only meaningful for timestamps in the same time zone. Put the time and timestamp mention in their own sections' bullet lists if that reads better; one bullet per section is fine.

## Gotchas

- Validate both arguments through the factories before comparing (call `sDate(date1)` before `sDate(date2)`) so the first invalid argument is the one reported, matching `isBeforeDate`.
- Do not add `compareWeekdays`.
- `exactOptionalPropertyTypes` and the rest of `@tsconfig/strictest` are on; explicit return types are expected.
- Comments go above code, never inline (`line-comment-position`), except in README code blocks.

## Verification

Tests to write, each as a new `describe` placed right after the corresponding `isSame*OrAfter`/`isSame*OrBefore` describe (find with grep, e.g. `describe('isSameDateOrAfter'` at `src/sDate.test.ts:1188`), following the style of `describe('isBeforeDate'` at `src/sDate.test.ts:1077`:

- `describe('compareDates')` in `src/sDate.test.ts`:
  - returns -1 when the first is before (mix an `SDate` and a string), 1 when after, 0 when the same date.
  - sorts as a comparator: `[sDate('2024-03-01'), '2023-12-31', '2024-01-15'].sort(compareDates)` then `.map((d) => sDate(d).date)` equals `['2023-12-31', '2024-01-15', '2024-03-01']` (inline snapshot or `toEqual`).
  - works wrapped: an array of `{ from: ... }` objects sorted with `(a, b) => compareDates(a.from, b.from)`.
  - throws for invalid first date and invalid second date, asserted with `toThrowErrorMatchingInlineSnapshot` (never `.toThrow(...)`).
- `describe('compareTimes')` in `src/sTime.test.ts` and `describe('compareTimestamps')` in `src/sTimestamp.test.ts`: the same cases with times (`'09:30'`, `'14:00'`) and timestamps (include two timestamps on the same date with different times, and two on different dates).
- Do not use `toEqual` to compare class instances to strings; map to the string field first.

Commands, all from `/Users/eric/Code/scdate`, all must pass:

- `yarn build`
- `yarn lint`
- `yarn test:utc`
- `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test`
- `yarn prettier --write .` before finishing.
