# 01_02 Add toString() and a throwing valueOf() to the value classes

## Goal

Give `SDate`, `STime`, `STimestamp` and `SWeekdays` a `toString()` that returns their string form and a `valueOf()` that throws a `TypeError`, the way TC39 Temporal objects behave. String contexts (template literals, `String(x)`, object keys, comparator-less `.sort()`) get the ISO string; implicit primitive coercion (`<`, `>`, `==` against a primitive, `+`, `Number(x)`) throws instead of silently producing a wrong result. This is the breaking change of the release.

## Files to modify/create

All under `/Users/eric/Code/scdate/packages/scdate/`.

- `src/internal/SDate.ts`
- `src/internal/STime.ts`
- `src/internal/STimestamp.ts`
- `src/internal/SWeekdays.ts`
- `README.md`

Tests (do not count): `src/sDate.test.ts`, `src/sTime.test.ts`, `src/sTimestamp.test.ts`, `src/sWeekdays.test.ts`.

## Background

- Task 01_01 added `compareDates` (`src/sDate.ts`), `compareTimes` (`src/sTime.ts`) and `compareTimestamps` (`src/sTimestamp.ts`), each returning `-1 | 0 | 1`. The error messages below name them.
- Each class today has one readonly string field and `toJSON()` returning it: `SDate.date` (`src/internal/SDate.ts:15`), `STime.time` (`src/internal/STime.ts:15`), `STimestamp.timestamp` (`src/internal/STimestamp.ts:15`), `SWeekdays.weekdays` (`src/internal/SWeekdays.ts:19`). Follow the `toJSON()` pattern and put the new methods right after it.
- The classes are exported as types only (`src/index.ts:8-11`); users get instances from factories (`sDate`, `sTime`, `sTimestamp`, `sWeekdays`).
- Equality helpers the messages point to already exist: `isSameDate` (`src/sDate.ts`), `isSameTime` (`src/sTime.ts`), `isSameTimestamp` (`src/sTimestamp.ts`), `areWeekdaysEqual` (`src/sWeekdays.ts`).
- Design decisions:
  - `valueOf(): never` (as in Temporal's TS declarations). No `Symbol.toPrimitive`. JS calls `valueOf` first for the `default`/`number` hints (`==`, `+`, `<`, `Number()`) and `toString` first for the `string` hint (template literals, `String()`, property keys, default `.sort()`), so these two methods alone give the intended behavior. Verified in node.
  - Checked with tsc: `a < b` and `a == b` between instances still type-check, so they fail at runtime, not compile time. A hand-built object literal typed as `SDate` (`{ date, toJSON }`) no longer type-checks; that is expected and part of the breaking change.
  - Nothing in `packages/scdate/src`, `packages/scschedule/src` or `packages/scdate-testing/src` coerces an instance implicitly or calls `.valueOf()` on one (grep checked). scschedule calls `.toJSON()` explicitly, which is unaffected. Vitest's `toEqual` only calls `valueOf` on Boolean/String/Number/Date objects, so existing instance comparisons in tests keep working.
  - `fast-deep-equal` calls `a.valueOf()` on objects that override it, so deep-equal on two instances throws (Temporal has the same behavior). Document it, do not work around it.

## Guides

None. The mise config has no Skills & guides entries.

## Implementation details

1. In each class, after `toJSON()`, add (SDate shown):

   ```ts
   /**
    * Returns the date in the YYYY-MM-DD format. Used by template literals and
    * `String(value)`.
    */
   public toString(): string {
     return this.date
   }

   /**
    * Always throws. SDate cannot be converted to a primitive value, so `<`,
    * `>`, `==` against a string and `+` throw instead of comparing or
    * concatenating silently. Use `compareDates`, `isSameDate` or
    * `String(value)` instead.
    */
   public valueOf(): never {
     throw new TypeError(
       'SDate cannot be converted to a primitive value. Use compareDates() or isSameDate() to compare dates, or String(value) to get the YYYY-MM-DD string.',
     )
   }
   ```

2. Exact messages:
   - SDate: `SDate cannot be converted to a primitive value. Use compareDates() or isSameDate() to compare dates, or String(value) to get the YYYY-MM-DD string.`
   - STime: `STime cannot be converted to a primitive value. Use compareTimes() or isSameTime() to compare times, or String(value) to get the HH:MM string.`
   - STimestamp: `STimestamp cannot be converted to a primitive value. Use compareTimestamps() or isSameTimestamp() to compare timestamps, or String(value) to get the YYYY-MM-DDTHH:MM string.`
   - SWeekdays: `SWeekdays cannot be converted to a primitive value. Use areWeekdaysEqual() to compare weekdays, or String(value) to get the SMTWTFS string.`
3. README (`/Users/eric/Code/scdate/packages/scdate/README.md`): add a `### String Conversion and Comparison` subsection under `## Design Decisions` (after `### ISO 8601 Format`, before `### Minute-Level Precision`), covering:
   - `toString()`, template literals, `String(value)`, object keys and comparator-less `.sort()` give the ISO string (`SMTWTFS` for weekdays). `JSON.stringify` is unchanged.
   - `valueOf()` throws a `TypeError`, so `<`, `>`, `<=`, `>=`, `==` against a string, `+` and `Number(value)` throw. Use `compareDates`/`compareTimes`/`compareTimestamps` to order, `isSameDate`/`isSameTime`/`isSameTimestamp`/`areWeekdaysEqual` to test equality. `===` and `==` between two instances compare identity, as with any object.
   - Same design as TC39 Temporal (`Temporal.PlainDate` has `toString()`, `compare()` and a throwing `valueOf()`).
   - Deep-equality helpers that call `valueOf()` on objects overriding it (for example `fast-deep-equal`) throw when given two instances; compare the string forms instead.
   - Adjust the existing "Direct comparison" bullet in `### ISO 8601 Format` if needed so it does not suggest comparing instances with `<` (it refers to strings, so a short clarification is enough).

## Gotchas

- Keep `toJSON()` as is; `JSON.stringify` snapshots must not change.
- `valueOf` must be declared returning `never`, not `string`.
- Lint is typescript-eslint `strictTypeChecked`. In tests, do not use template literals with an instance (`restrict-template-expressions` flags objects); use `String(x)` and `x.toString()`. `x == 'string'` does not type-check (TS2367, no overlap) and `x + 1` is flagged by `restrict-plus-operands`; test coercion with `x < y`, `Number(x)` and `x.valueOf()`. If a rule still fires on a deliberate coercion test, add a targeted `// eslint-disable-next-line <rule>` on its own line above; never disable file-wide.
- Comments go above code, never inline (`line-comment-position`).
- If any existing test or scschedule code breaks because it coerced an instance, report it rather than weakening the guard; the grep found none.

## Verification

Tests to write, in a new `describe('string conversion')` placed right after the `describe('JSON.stringify')` block in each file (`src/sDate.test.ts:90`, `src/sTime.test.ts:80`, `src/sTimestamp.test.ts:97`, `src/sWeekdays.test.ts:67`):

- `toString()` and `String(x)` return the string form (inline snapshot).
- comparator-less sort uses the string form: `[sDate('2024-03-01'), sDate('2023-12-31')].sort().map(String)` gives `['2023-12-31', '2024-03-01']` (dates, times, timestamps; for weekdays only `String`/`toString`).
- `x.valueOf()` throws, asserted with `toThrowErrorMatchingInlineSnapshot` (never `.toThrow(...)`), which captures the exact message.
- `x < y` between two instances throws (`toThrowErrorMatchingInlineSnapshot`), and `Number(x)` throws.
- `JSON.stringify` existing tests stay unchanged and passing.

Commands, all from `/Users/eric/Code/scdate`, all must pass:

- `yarn build`
- `yarn lint`
- `yarn test:utc` (includes scschedule and scdate-testing suites, which use instances heavily)
- `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test`
- `yarn prettier --write .` before finishing.
