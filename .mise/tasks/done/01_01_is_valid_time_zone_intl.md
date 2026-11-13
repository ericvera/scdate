# 01_01: isValidTimeZone validates through Intl.DateTimeFormat

## Goal

Make `isValidTimeZone` (package `scdate`) return `true` for every zone string the runtime's `Intl.DateTimeFormat` accepts, including `UTC`, aliases such as `US/Eastern`, `Asia/Kolkata`, and lowercase names. It returns `false` only when construction throws or the argument is not a string. Update its tests and the README Time Zones section to match.

## Files to modify/create

- `packages/scdate/src/isValidTimeZone.ts`
- `packages/scdate/README.md`
- (test) `packages/scdate/src/isValidTimeZone.test.ts`

## Background

- Bug: `packages/scdate/src/isValidTimeZone.ts:8-10` returns `Intl.supportedValuesOf('timeZone').includes(timeZone)`. That list holds only canonical names, so on Node 24.18 it returns `false` for `UTC`, `Etc/UTC`, `GMT`, `US/Eastern`, `Asia/Kolkata`, and `america/puerto_rico`. `Intl.DateTimeFormat` accepts all of them, and so does the rest of scdate (for example, `getUTCMillisecondsFromDate('2025-03-09', 'UTC')` works).
- Pattern: `packages/scdate/src/internal/zoned.ts:17-30` builds `new Intl.DateTimeFormat('en-US', { timeZone, ... })` inside try/catch. Mirror the construction, but do NOT call the cached `getDateTimeFormat`. Validation sees untrusted input, and caching every valid string would grow that Map.
- Owner decisions:
  - Fixed offsets (`+05:00`) are not rejected. The function returns whatever the runtime accepts (`true` on Node 24). No test pins an offset result, because older runtimes reject offsets.
  - Abbreviations the runtime accepts (`EST`, `PST`, `UTC`) return `true`. The existing tests that expect `false` for them (test lines 19-22) are moved to the true-list.
  - A non-string argument returns `false`, not the host zone.
- The function is exported via `packages/scdate/src/index.ts:2` (`export * from './isValidTimeZone.js'`). Do not change that file.
- This ships as a `fix:` commit, so the release tooling cuts a patch (9.0.1). If you commit, use a conventional `fix:` subject. Per CLAUDE.md, add no attribution lines.

## Guides

none

## Implementation details

1. Replace the body of `isValidTimeZone.ts`:
   ```ts
   /**
    * Checks if a string is a time zone the runtime's `Intl.DateTimeFormat`
    * accepts: IANA names, their aliases (for example `US/Eastern` or
    * `Asia/Calcutta`), `UTC`, and names in any letter case. Fixed offsets such
    * as `+05:00` are accepted where the runtime supports them.
    *
    * @param timeZone The string to validate as a time zone.
    */
   export const isValidTimeZone = (timeZone: string): boolean => {
     if (typeof timeZone !== 'string') {
       return false
     }

     try {
       new Intl.DateTimeFormat('en-US', { timeZone })

       return true
     } catch {
       return false
     }
   }
   ```
   If ESLint flags `new` used only for side effects (`no-new`), assign the result and discard it in a lint-clean way, for example `const format = new Intl.DateTimeFormat(...)` followed by `return format.resolvedOptions().timeZone.length > 0`. Prefer an eslint-disable comment over changing semantics only if the repo already uses such comments.
2. In `isValidTimeZone.test.ts`:
   - True-list: keep the existing five and add `'UTC'`, `'Etc/UTC'`, `'GMT'`, `'US/Eastern'`, `'Asia/Kolkata'`, `'america/puerto_rico'`, `'EST'`, and `'PST'`. Keep a comment noting these cover UTC, an old alias, and a lowercase name (the regression).
   - False-list: keep `'Invalid/Timezone'`, `'America/Not_A_Place'`, `'Random String'`, and `''`. Add `'Invalid/Zone'`. Remove `EST`, `PST`, `UTC`, and the "Abbreviations aren't valid IANA identifiers" comment.
   - Add one test that a non-string returns `false`: `isValidTimeZone(undefined as unknown as string)`.
3. In `packages/scdate/README.md`, Time Zones section (lines ~411-421):
   - Extend the example with `isValidTimeZone('UTC') // true`, `isValidTimeZone('US/Eastern') // true (alias)`, and `isValidTimeZone('america/new_york') // true (case-insensitive)`. Keep `'Invalid/Timezone' // false`.
   - Replace the line "For a list of valid time zones run `Intl.supportedValuesOf('timeZone')` in your environment." with text saying that scdate accepts any time zone the runtime's `Intl.DateTimeFormat` accepts (IANA names, aliases, `UTC`), and that `isValidTimeZone` checks exactly that. Note that `Intl.supportedValuesOf('timeZone')` lists only canonical names, so it is not a complete list of accepted zones, and that fixed offsets such as `+05:00` are accepted where the runtime supports them.

## Gotchas

- `exactOptionalPropertyTypes` is on (CLAUDE.md). `{ timeZone }` with `timeZone: string` is fine.
- Do not test `+05:00`. Its result depends on the runtime's ICU.
- Do not assert `Asia/Calcutta` is in or out of any list. Only assert `isValidTimeZone('Asia/Kolkata') === true`.
- Leave the JSDoc in `sDate.ts`, `sTime.ts`, `sTimestamp.ts`, `internal/zoned.ts`, and `createSetFakeTimer.ts` alone. Task 01_02 rewords it.

## Verification

- Tests written: `packages/scdate/src/isValidTimeZone.test.ts` (regression for UTC, an old alias `US/Eastern`, the renamed zone `Asia/Kolkata`, and the lowercase `america/puerto_rico`; false for `Invalid/Zone` and non-string).
- Run: `yarn build`, `yarn lint`, `yarn test:utc`, `TZ=Asia/Tokyo yarn test`, `TZ=America/Los_Angeles yarn test`, then `yarn prettier --write .`.
- Confirm the new true cases failed before the change (they return `false` under the old `supportedValuesOf` check).
