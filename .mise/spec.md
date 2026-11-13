# Spec: comparators, coercion guard, getFullDateString options

All source paths are under `packages/scdate/`.

## What

- `compareDates`, `compareTimes` and `compareTimestamps` order two `S*String | S*` values and return `-1`, `0` or `1` (ascending). They validate both arguments the way `isBeforeDate` and its siblings do, and work directly as `Array.prototype.sort` comparators or wrapped (`(a, b) => compareDates(a.from, b.from)`).
- `SDate`, `STime`, `STimestamp` and `SWeekdays` each gain `toString()`, returning the same string `toJSON()` returns, and a `valueOf()` that throws a `TypeError` naming the alternatives (Temporal's shape). Result:
  - Use the string form: template literals, `String(x)`, `x.toString()`, object keys, comparator-less `.sort()`.
  - Throw: `<`, `>`, `<=`, `>=`, `==` against a primitive, `+`, `Number(x)`, unary `+x`, explicit `x.valueOf()`.
  - Unchanged: `===`, `==` between two instances (identity), `JSON.stringify`.
- `getFullDateString(date, locale, options?)` takes an optional `SDateFullStringOptions` (`includeYear?: boolean`, `weekdaySeparator?: string`). With no options, or options that request nothing, output is byte-identical to today's. `getFullDateString('2025-02-01', 'es', { includeYear: false, weekdaySeparator: ' ' })` returns `sábado 1 de febrero`.
- The package README documents all three.
- Ships as one PR, squash-merged as `feat!` with a one-or-two-sentence `BREAKING CHANGE:` footer about the coercion change. That major release is the only breaking change.

## Design

### Comparators (task 01_01)

- `compareDates` in `src/sDate.ts`, `compareTimes` in `src/sTime.ts`, `compareTimestamps` in `src/sTimestamp.ts`, each placed in the file's `--- Comparisons ---` section after the last `isSame*OrAfter`/`isSame*OrBefore` function. They are exported through the existing `export *` in `src/index.ts`, so `index.ts` is untouched.
- Shape (dates shown, the other two are the same with their factory and field):

  ```ts
  export const compareDates = (
    date1: SDateString | SDate,
    date2: SDateString | SDate,
  ): -1 | 0 | 1 => {
    const value1 = sDate(date1).date
    const value2 = sDate(date2).date
    if (value1 < value2) { return -1 }
    if (value1 > value2) { return 1 }
    return 0
  }
  ```

- Validation comes from the `sDate`/`sTime`/`sTimestamp` factories, first argument first, so error messages match the `isBefore*` functions.
- `compareTimestamps` orders wall clocks, meaningful within one zone only (the same limit as `isBeforeTimestamp`). No comparator for `SWeekdays`.

### Coercion guard (task 01_02)

- Each of `src/internal/SDate.ts`, `STime.ts`, `STimestamp.ts`, `SWeekdays.ts` gets, after `toJSON()`:

  ```ts
  public toString(): string {
    return this.date
  }

  public valueOf(): never {
    throw new TypeError('...')
  }
  ```

- `valueOf(): never` matches Temporal's type declarations. Checked with tsc: `a < b` and `a == b` between instances still type-check (so they throw at runtime, not at compile time), and a hand-built object literal typed as `SDate` (`{ date, toJSON }`) stops type-checking (`Type 'Object' is not assignable to type 'never'` on `valueOf`). That is part of the breaking change.
- No `Symbol.toPrimitive`. JS calls `valueOf` first for the `default` and `number` hints and `toString` first for the `string` hint, which gives the behavior listed under What (verified in node).
- Error messages (exact text, one per class):
  - SDate: `SDate cannot be converted to a primitive value. Use compareDates() or isSameDate() to compare dates, or String(value) to get the YYYY-MM-DD string.`
  - STime: `STime cannot be converted to a primitive value. Use compareTimes() or isSameTime() to compare times, or String(value) to get the HH:MM string.`
  - STimestamp: `STimestamp cannot be converted to a primitive value. Use compareTimestamps() or isSameTimestamp() to compare timestamps, or String(value) to get the YYYY-MM-DDTHH:MM string.`
  - SWeekdays: `SWeekdays cannot be converted to a primitive value. Use areWeekdaysEqual() to compare weekdays, or String(value) to get the SMTWTFS string.`
- Risks checked:
  - Nothing in `packages/scdate/src`, `packages/scschedule/src` or `packages/scdate-testing/src` coerces an instance implicitly or calls `.valueOf()` on one (grep). scschedule calls `.toJSON()` explicitly, which is unaffected. The full suite run in the task is the final check.
  - Vitest's `equals` (`toEqual`, `toHaveBeenCalledWith`) only calls `valueOf` for `[object Boolean|String|Number|Date]`, so instance comparisons in tests are unaffected. Snapshots use `toJSON`.
  - `fast-deep-equal` (present in `node_modules`) does `if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()`, so deep-equal on two instances throws. Temporal objects have the same behavior. The README calls this out; no code change.

### getFullDateString options (task 01_03)

- New exported interface in `src/sDate.ts` next to `SDateShortStringOptions`:

  ```ts
  export interface SDateFullStringOptions {
    includeYear?: boolean
    weekdaySeparator?: string
  }
  ```

- Formatting options: `includeYear === false` uses `{ timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }`; otherwise `{ timeZone: 'UTC', dateStyle: 'full' }` (today's options).
- With `weekdaySeparator === undefined`, return `utcDate.toLocaleDateString(locale, formatOptions)` (today's code path, so default output is byte-identical).
- With `weekdaySeparator` set, use `new Intl.DateTimeFormat(locale, formatOptions).formatToParts(utcDate)`, find the first part with `type === 'weekday'`, and if the part right after it exists and has `type === 'literal'`, replace its value with the separator. Join the part values. If the weekday is the last part (ja: `2025年2月1日土曜日`) or followed by a non-literal, the separator does nothing.
- Intl parts checked in node for 2025-02-01, year-less: es `sábado`,`, `,`1`,` de `,`febrero`; en `Saturday`,`, `,`February`,` `,`1`; fr `samedi`,` `,`1`,` `,`février`; ja weekday last.

### Removed

Nothing is removed. No deprecations.

## Hard-to-undo

- Public API change of a published npm package (`scdate`): `valueOf()` on `SDate`, `STime`, `STimestamp` and `SWeekdays` now throws, so implicit coercion that silently worked (`a < b`, `a == 'iso'`, `a + 1`) throws at runtime, and `valueOf(): never` becomes a member of the exported types. Merging the `feat!` squash commit publishes a new major version; a published version cannot be unpublished in practice.
- Additive public API in the same release: `compareDates`, `compareTimes`, `compareTimestamps`, `SDateFullStringOptions`, `toString()` on the four classes, and the optional third parameter of `getFullDateString`.

## Task index

| Task file | What it does | Files |
| --- | --- | --- |
| `01_01_comparators.md` | Add `compareDates`, `compareTimes`, `compareTimestamps` with tests and README entries | `src/sDate.ts`, `src/sTime.ts`, `src/sTimestamp.ts`, `README.md` (tests: `src/sDate.test.ts`, `src/sTime.test.ts`, `src/sTimestamp.test.ts`) |
| `01_02_coercion_guard.md` | Add `toString()` and a throwing `valueOf()` to the four value classes, with tests and README section | `src/internal/SDate.ts`, `src/internal/STime.ts`, `src/internal/STimestamp.ts`, `src/internal/SWeekdays.ts`, `README.md` (tests: `src/sDate.test.ts`, `src/sTime.test.ts`, `src/sTimestamp.test.ts`, `src/sWeekdays.test.ts`) |
| `01_03_full_date_string_options.md` | Add optional `SDateFullStringOptions` (`includeYear`, `weekdaySeparator`) to `getFullDateString`, with tests and README entry | `src/sDate.ts`, `README.md` (tests: `src/sDate.test.ts`) |
