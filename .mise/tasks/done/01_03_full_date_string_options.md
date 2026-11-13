# 01_03 Add includeYear and weekdaySeparator options to getFullDateString

## Goal

Add an optional third argument to `getFullDateString` so callers can drop the year and replace the text after the weekday, producing sentence dates such as `sábado 1 de febrero`. With no options the output stays byte-identical to today's.

## Files to modify/create

All under `/Users/eric/Code/scdate/packages/scdate/`.

- `src/sDate.ts`
- `README.md`

Tests (do not count): `src/sDate.test.ts`.

## Background

- Independent of tasks 01_01 and 01_02 (comparators and the `toString`/`valueOf` guard on the classes); neither touches `getFullDateString`.
- `getFullDateString(date, locale)` is at `src/sDate.ts:370` (JSDoc above it). It normalizes with `sDate(date)`, converts with `getDateAsUTCDateMini` (`src/internal/date.ts`) and returns `utcDate.toLocaleDateString(locale, { timeZone: 'UTC', dateStyle: 'full' })`. Its return type is inferred; make it explicit `: string`.
- Options-interface precedent: `SDateShortStringOptions` at `src/sDate.ts:29` (JSDoc on the interface and on each field), passed as the 4th argument of `getShortDateString` (`src/sDate.ts:415`).
- `src/internal/utils.ts` has `getAtIndex` if indexed access is needed; `noUncheckedIndexedAccess` is on, so `parts[i]` is `T | undefined`.
- `dateStyle` cannot be combined with individual fields, so dropping the year means switching to `weekday: 'long', month: 'long', day: 'numeric'`.
- Intl parts, checked in node for 2025-02-01 without the year: es `["sábado", ", ", "1", " de ", "febrero"]`; en `["Saturday", ", ", "February", " ", "1"]`; de `["Samstag", ", ", "1", ". ", "Februar"]`; fr `["samedi", " ", "1", " ", "février"]`; ja puts the weekday last (`2月1日土曜日`).
- Design decisions: the separator replaces the literal part right after the weekday, found structurally with `formatToParts`, never by string search. It works with or without the year. Where nothing (or a non-literal) follows the weekday, it does nothing. No other punctuation changes.
- CLAUDE.md: `@tsconfig/strictest` with `exactOptionalPropertyTypes`; forward the options object whole rather than rebuilding literals with possibly-undefined fields.

## Guides

None. The mise config has no Skills & guides entries.

## Implementation details

1. Next to `SDateShortStringOptions` add:

   ```ts
   /**
    * Options for customizing the full date string representation.
    */
   export interface SDateFullStringOptions {
     /**
      * Whether to include the year. Defaults to true. When false, the output
      * has the full weekday, the full month and the day.
      */
     includeYear?: boolean
     /**
      * Replaces the text the locale puts between the weekday and the part that
      * follows it (e.g. ', ' in English and Spanish). Has no effect in locales
      * where nothing follows the weekday.
      */
     weekdaySeparator?: string
   }
   ```

2. New signature and body:

   ```ts
   export const getFullDateString = (
     date: SDateString | SDate,
     locale: Intl.LocalesArgument,
     options?: SDateFullStringOptions,
   ): string => {
     const sDateValue = sDate(date)
     const utcDate = getDateAsUTCDateMini(sDateValue)

     const formatOptions: Intl.DateTimeFormatOptions =
       options?.includeYear === false
         ? { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }
         : { timeZone: 'UTC', dateStyle: 'full' }

     const weekdaySeparator = options?.weekdaySeparator

     if (weekdaySeparator === undefined) {
       return utcDate.toLocaleDateString(locale, formatOptions)
     }

     const parts = new Intl.DateTimeFormat(locale, formatOptions).formatToParts(utcDate)
     const weekdayIndex = parts.findIndex((part) => part.type === 'weekday')
     const partAfterWeekday = weekdayIndex === -1 ? undefined : parts[weekdayIndex + 1]

     if (partAfterWeekday?.type === 'literal') {
       partAfterWeekday.value = weekdaySeparator
     }

     return parts.map((part) => part.value).join('')
   }
   ```

   Equivalent code is fine; keep the no-separator path on `toLocaleDateString` so default output is unchanged.
3. JSDoc: add `@param options` and two examples:
   - `getFullDateString('2025-02-01', 'es', { includeYear: false, weekdaySeparator: ' ' })` `//=> 'sábado 1 de febrero'`
   - `getFullDateString('2025-02-01', 'en', { includeYear: false })` `//=> 'Saturday, February 1'`
4. README (`/Users/eric/Code/scdate/packages/scdate/README.md`): after `const fullDateStr = getFullDateString(date1, 'en-US')` (line 122) add a line such as `const sentenceDate = getFullDateString(date1, 'es', { includeYear: false, weekdaySeparator: ' ' }) // 'lunes 25 de diciembre'` (verify the exact output for `2023-12-25` in node before writing it). Add a bullet to the Date "Important Behaviors and Edge Cases" list for **`getFullDateString(date, locale, options?)`** describing `includeYear` (default true) and `weekdaySeparator` (replaces the text after the weekday; no effect where the locale puts the weekday last, such as `ja`).

## Gotchas

- Do not change the existing `getFullDateString` tests (`src/sDate.test.ts:726-755`); they prove default output is unchanged.
- `getFullDateString(d, l, {})` and `{ includeYear: true }` must equal the 2-arg output.
- An invalid locale still throws `RangeError` from the `Intl.DateTimeFormat` constructor on the separator path; that is fine.
- Mutating the parts returned by `formatToParts` is safe (fresh array of fresh objects each call). If lint objects, build a new array with `map` instead.
- Comments go above code, never inline (`line-comment-position`).

## Verification

Tests to add inside the existing `describe('getFullDateString')` at `src/sDate.test.ts:726`, as inline snapshots with es and en:

- `includeYear: false`: es `'2025-02-01'` gives `sábado, 1 de febrero`; en gives `Saturday, February 1`.
- `includeYear: false, weekdaySeparator: ' '`: es gives `sábado 1 de febrero`; en gives `Saturday February 1`.
- `weekdaySeparator: ' '` with the year: es gives `sábado 1 de febrero de 2025`; en gives `Saturday February 1, 2025`.
- `{}` and `{ includeYear: true }` equal the 2-arg result for the same date (es).
- separator has no effect where the weekday is last: `getFullDateString('2025-02-01', 'ja', { includeYear: false, weekdaySeparator: ' ' })` equals the same call without the separator.
- throws for invalid date with options passed, via `toThrowErrorMatchingInlineSnapshot` (never `.toThrow(...)`).

Let vitest fill the inline snapshots and check each against the expected strings above.

Commands, all from `/Users/eric/Code/scdate`, all must pass:

- `yarn build`
- `yarn lint`
- `yarn test:utc`
- `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test`
- `yarn prettier --write .` before finishing.
