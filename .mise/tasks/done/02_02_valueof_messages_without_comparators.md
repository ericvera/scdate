# 02_02 Drop comparator names from valueOf() errors and class JSDoc

## Goal

Rewrite the `valueOf()` `TypeError` messages and the `toString()`/`valueOf()` JSDoc on `SDate`, `STime` and `STimestamp` so they no longer name `compareDates()`, `compareTimes()` or `compareTimestamps()`, which task 02_01 removed. The messages point at the `isSame*`/`isBefore*`/`isAfter*` functions and `String(value)` instead.

## Files to modify/create

All under `/Users/eric/Code/scdate/packages/scdate/`.

- `src/internal/SDate.ts`
- `src/internal/STime.ts`
- `src/internal/STimestamp.ts`

Tests (do not count): `src/sDate.test.ts`, `src/sTime.test.ts`, `src/sTimestamp.test.ts`.

## Background

- Task 01_02 (in `.mise/tasks/done/`) gave each value class a `toString()` returning its ISO string and a `valueOf(): never` that throws a `TypeError` (Temporal's shape). Task 02_01 deleted `compareDates`, `compareTimes` and `compareTimestamps` from `src/sDate.ts`, `src/sTime.ts`, `src/sTimestamp.ts` and from the README, and documented sorting as `String(value)` with `.sort()` or `localeCompare`.
- Current code to change:
  - `src/internal/SDate.ts:29-41`: the `valueOf` JSDoc says ``Use `compareDates` to order or sort, `isSameDate`, `isBeforeDate` or `isAfterDate` to compare, or `String(value)` to get the string.`` and the message is `SDate cannot be converted to a primitive value. Use compareDates() or isSameDate() to compare dates, or String(value) to get the YYYY-MM-DD string.`
  - `src/internal/STime.ts:28-40`: same with `compareTimes`, `isSameTime`, `HH:MM`.
  - `src/internal/STimestamp.ts:29-41`: same with `compareTimestamps`, `isSameTimestamp`, `YYYY-MM-DDTHH:MM`.
  - `src/internal/SWeekdays.ts` never named a comparator (its message names `areWeekdaysEqual()`). Leave it unchanged.
- Inline snapshots that hold the old messages (3 per file): `src/sDate.test.ts:117`, `:126`, `:129`; `src/sTime.test.ts:106`, `:115`, `:118`; `src/sTimestamp.test.ts:132`, `:141`, `:144` (line numbers before 02_01; those blocks sit near the top of each file, above where 02_01 deleted code, so they should not have moved).

## Guides

None. The mise config has no Skills & guides entries.

## Implementation details

- New messages, exact text:
  - SDate: `SDate cannot be converted to a primitive value. Use isSameDate(), isBeforeDate() or isAfterDate() to compare dates, or String(value) to get the YYYY-MM-DD string, which sorts in date order.`
  - STime: `STime cannot be converted to a primitive value. Use isSameTime(), isBeforeTime() or isAfterTime() to compare times, or String(value) to get the HH:MM string, which sorts in time order.`
  - STimestamp: `STimestamp cannot be converted to a primitive value. Use isSameTimestamp(), isBeforeTimestamp() or isAfterTimestamp() to compare timestamps, or String(value) to get the YYYY-MM-DDTHH:MM string, which sorts in time order.`
- New last sentence of each `valueOf` JSDoc (SDate shown; the others use their own function names):
  ``Use `isSameDate`, `isBeforeDate` or `isAfterDate` to compare, or `String(value)` to get the string, which sorts with `.sort()` or `localeCompare`.``
  Keep the rest of the JSDoc as is, rewrapped at the existing width.
- The `toString()` JSDoc mentions `.sort()` without a comparator; that is accurate and stays.
- Update the nine inline snapshots to the new messages. Either edit them by hand or run `yarn vitest -u` scoped to the three test files from `packages/scdate`, then read the diff to confirm only those strings changed.

## Gotchas

- The tests assert with `toThrowErrorMatchingInlineSnapshot`; keep that form (never `.toThrow(...)`).
- Keep `valueOf(): never` and the `TypeError` type unchanged; only the strings change.
- Prettier may rewrap the long strings in the test files; run the Format command (`yarn prettier --write .`).

## Verification

- Check: `yarn build`, `yarn lint`.
- Unit tests: `yarn test:utc`, plus `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test`.
- Tests this task changes: the nine `valueOf` inline snapshots listed above, now asserting the new messages.
- Substitute check: `grep -rn "compareDates\|compareTimes\|compareTimestamps" /Users/eric/Code/scdate/packages /Users/eric/Code/scdate/README.md --include='*.ts' --include='*.md' --exclude-dir=node_modules --exclude-dir=dist` returns nothing.
