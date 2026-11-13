# 02_01 Remove compareDates, compareTimes and compareTimestamps

## Goal

Delete the three comparator functions `compareDates`, `compareTimes` and `compareTimestamps` from the `scdate` package, with their tests and every mention in the package README, and document sorting as `String(value)` with `.sort()` or `localeCompare`. The owner decided they are not needed now that the value classes have `toString()`, and removing them after publishing would be a breaking change. They have never been published, so removing them now breaks nobody.

## Files to modify/create

All under `/Users/eric/Code/scdate/packages/scdate/`.

- `src/sDate.ts` — delete `compareDates`
- `src/sTime.ts` — delete `compareTimes`
- `src/sTimestamp.ts` — delete `compareTimestamps`
- `README.md` — remove every comparator mention, document sorting by string form

Tests (do not count): `src/sDate.test.ts`, `src/sTime.test.ts`, `src/sTimestamp.test.ts`.

## Background

- Yarn monorepo, `scdate` at `packages/scdate`. `src/index.ts` re-exports these modules with `export *`, so removing the functions needs no change there.
- Earlier tasks on this branch (in `.mise/tasks/done/`): 01_01 added the comparators; 01_02 gave `SDate`, `STime`, `STimestamp` and `SWeekdays` (`src/internal/*.ts`) a `toString()` that returns the ISO string and a `valueOf()` that throws a `TypeError`; 01_03 added options to `getFullDateString`. Because of `toString()`, comparator-less `.sort()` already orders instances and ISO strings together (tested in `describe('toString and valueOf')`-style blocks near `src/sDate.test.ts:107`, `src/sTime.test.ts:96`, `src/sTimestamp.test.ts:116` — these stay).
- What to delete in source (whole JSDoc block plus function, and the blank line before it):
  - `compareDates`: JSDoc starting `Compares two dates for sorting` at `src/sDate.ts:717`, function ends at `:748`, just before `isDateToday`'s JSDoc.
  - `compareTimes`: JSDoc at `src/sTime.ts:332`, function ends at `:364`, just before `isTimePM`'s JSDoc.
  - `compareTimestamps`: JSDoc at `src/sTimestamp.ts:603`, function runs to the end of the file (`:636`). The file must still end with `}` of `isSameTimestampOrAfter` and a newline.
- What to delete in tests:
  - The `compareDates` import (`src/sDate.test.ts:14`) and `describe('compareDates')` (`:1323` to its closing `})` before `describe('isDateToday')`).
  - The `compareTimes` import (`src/sTime.test.ts:7`) and `describe('compareTimes')` (`:636` to its closing `})` before `describe('isTimePM')`).
  - The `compareTimestamps` import (`src/sTimestamp.test.ts:13`) and `describe('compareTimestamps')` (`:1052` to the end of the file).
- Design decisions reaching this task:
  - Sorting is documented as the string form: `.sort()` with no comparator sorts instances and ISO strings alike (it calls `toString()`), and a wrapped comparator uses `String(...)` with `localeCompare`, e.g. `items.sort((a, b) => String(a.from).localeCompare(String(b.from)))`. ISO strings are fixed-width, so string order is chronological order. Timestamps are wall clocks, so their string order is only meaningful within one time zone (the same limit as `isBeforeTimestamp`).
  - The `valueOf()` error messages and the class JSDoc in `src/internal/SDate.ts`, `STime.ts`, `STimestamp.ts` still name the removed functions. Task 02_02 fixes those and their inline snapshots. Do not touch `src/internal/` or the `valueOf` snapshot strings in this task.

## Guides

None. The mise config has no Skills & guides entries.

## Implementation details

1. Delete the three functions and their JSDoc as listed above.
2. Delete the three test imports and `describe` blocks as listed above.
3. `README.md` (`packages/scdate/README.md`) edits. Line numbers are from before this task:
   - `:115`, `:204`, `:270`: delete the `const order = compare...(...) // -1, 0 or 1 (use as a sort comparator)` line in each code block.
   - `:151`, `:216`, `:283`: delete the `- **\`compareDates(...)\`**`, `compareTimes`, `compareTimestamps` bullets with one adjacent blank line each, leaving single blank lines between the remaining bullets.
   - `:368` ("Direct comparison" bullet): replace `(compare instances with the comparison helpers, see below)` with `(get an instance's string with \`String(value)\`, see below)`.
   - `:374`: replace `Use \`compareDates\`, \`compareTimes\` and \`compareTimestamps\` to order values, and` with `Use \`String(value)\` to order values (see below), and`.
   - `:382`: replace the bullet with: `- To order or sort, use the string form. \`.sort()\` with no comparator sorts instances and ISO strings alike, and a comparator compares strings with \`localeCompare\` (for example \`items.sort((a, b) => String(a.from).localeCompare(String(b.from)))\`). Timestamps are wall clocks, so their order is only meaningful within one time zone.`
   - `:392` in the example: replace `compareDates(a, b) // 1` with `String(a).localeCompare(String(b)) // 1`.
   - `:396`: replace `has \`toString()\`, \`compare()\` and a throwing \`valueOf()\`` with `has \`toString()\` and a throwing \`valueOf()\``.
   - `:406`: replace `replace with \`compare*\`, \`isBefore*\`, \`isAfter*\` or \`isSame*\`.` with `replace with \`isBefore*\`, \`isAfter*\` or \`isSame*\`, or compare \`String(value)\`.`
   - `:409`: replace `use \`compareDates\`, \`compareTimes\` or \`compareTimestamps\`.` with `use \`.sort()\` with no comparator, or compare \`String(value)\` with \`localeCompare\`.`
4. Run the Format command (`yarn prettier --write .`) so the README table and lists stay formatted.

## Gotchas

- `exactOptionalPropertyTypes` and lint (`yarn lint`) may flag an unused import left behind; remove each test file's comparator import.
- Do not remove the existing "sorts by the string form without a comparator" tests or the `toString`/`valueOf` tests; they back the new README guidance.
- Leave the `isBefore*`/`isSame*` JSDoc `@param ... to compare` lines alone; they are not comparator mentions.
- `packages/scdate/dist` is untracked build output; `yarn build` regenerates it. Do not edit it.
- After this task the `valueOf` error messages still say `compareDates()` etc. That is expected; 02_02 changes them. The suite stays green because the snapshots still match.

## Verification

- Check: `yarn build`, `yarn lint`.
- Unit tests: `yarn test:utc`, plus `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test`.
- No new tests (this task only deletes code; the existing string-form sort tests cover the documented replacement).
- Substitute check: `cd /Users/eric/Code/scdate/packages/scdate && grep -n "compareDates\|compareTimes\|compareTimestamps\|compare\*\|compare()" src/sDate.ts src/sTime.ts src/sTimestamp.ts README.md` returns nothing, and the same grep over `src/sDate.test.ts src/sTime.test.ts src/sTimestamp.test.ts` matches only the `valueOf` snapshot lines containing `cannot be converted to a primitive value` (left for 02_02).
