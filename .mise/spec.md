# Spec: accept zone aliases and UTC in isValidTimeZone

## What

`isValidTimeZone(timeZone)` (exported from `scdate`) returns `true` for every zone string the runtime's `Intl.DateTimeFormat` accepts, and `false` only when constructing `Intl.DateTimeFormat` with that zone throws, or when the argument is not a string.

- `true` (Node 24): `UTC`, `Etc/UTC`, `GMT`, `US/Eastern`, `Asia/Kolkata`, `america/puerto_rico`, `America/Puerto_Rico`, and abbreviations the runtime accepts (`EST`, `PST`).
- `false`: `Invalid/Zone`, `Invalid/Timezone`, `America/Not_A_Place`, `Random String`, `''`, and non-string arguments such as `undefined` from untyped callers.
- Fixed offsets (`+05:00`) follow the runtime (owner's call, superseding the original done-when): `true` on Node 24, and no test pins the result.
- The README Time Zones section and the `@param timeZone` JSDoc stop pointing readers at `Intl.supportedValuesOf('timeZone')`, which lists only canonical names.
- Ships as a `fix:` commit, so the release tooling cuts 9.0.1. The okven `validateAttributionConfig` switch is out of scope.

## Design

- `packages/scdate/src/isValidTimeZone.ts`:
  ```ts
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
  It builds the formatter directly and does not reuse the cached `getDateTimeFormat` in `internal/zoned.ts:8-36`. Validation runs on untrusted input, and caching every valid string would grow that Map for no gain. The `typeof` guard stops `timeZone: undefined` from falling back to the host zone and returning `true`.
- The signature stays the same, `(timeZone: string) => boolean`. The JSDoc changes from "valid IANA time zone identifier" to "a time zone the runtime's `Intl.DateTimeFormat` accepts, including aliases, `UTC`, and case-insensitive names".
- Tests in `packages/scdate/src/isValidTimeZone.test.ts`: the true-list gains `UTC`, `Etc/UTC`, `GMT`, `US/Eastern`, `Asia/Kolkata`, and `america/puerto_rico`. `EST`, `PST`, and `UTC` leave the false-list. The false-list gains `Invalid/Zone` and a non-string case.
- Doc wording, used consistently everywhere: "Any time zone the runtime's `Intl.DateTimeFormat` accepts (IANA names, aliases and `UTC`). Check with `isValidTimeZone`." The README states that fixed offsets such as `+05:00` are accepted where the runtime supports them.
- Removed: the `Intl.supportedValuesOf('timeZone')` check in `isValidTimeZone.ts` and every doc pointer to it (README plus 20 JSDoc lines across `sDate.ts`, `sTime.ts`, `sTimestamp.ts`, `internal/zoned.ts`, and `scdate-testing/src/createSetFakeTimer.ts`).

## Hard-to-undo

- Public API behavior change to the exported `isValidTimeZone` (`packages/scdate/src/index.ts:2`): some inputs that returned `false` now return `true` (`UTC`, aliases, lowercase names, `EST`/`PST`, and fixed offsets on Node 24). It ships as a patch.
- npm publish: the squash merge to main with a `fix:` commit makes the release tooling publish scdate 9.0.1. A published version cannot be withdrawn cleanly.

## Task index

| Task file | What | Files |
| --- | --- | --- |
| `01_01_is_valid_time_zone_intl.md` | Validate through `Intl.DateTimeFormat` try/catch, update the tests and the README Time Zones section | `packages/scdate/src/isValidTimeZone.ts`, `packages/scdate/src/isValidTimeZone.test.ts`, `packages/scdate/README.md` |
| `01_02_time_zone_jsdoc_wording.md` | Reword the `@param timeZone` JSDoc that points at `Intl.supportedValuesOf` | `packages/scdate/src/sDate.ts`, `packages/scdate/src/sTime.ts`, `packages/scdate/src/sTimestamp.ts`, `packages/scdate/src/internal/zoned.ts`, `packages/scdate-testing/src/createSetFakeTimer.ts` |
