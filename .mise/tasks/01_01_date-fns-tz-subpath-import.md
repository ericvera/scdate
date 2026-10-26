# 01_01 Import toZonedTime from the date-fns-tz subpath

## Goal

Make scdate import `toZonedTime` from `'date-fns-tz/toZonedTime'` instead of the `'date-fns-tz'` root. The root entry loads the whole date-fns barrel, about 530 ms per test file and per cold start. The subpath takes about 13 ms. Behavior does not change. The fix ships as a `fix:` patch release, 7.1.2 → 7.1.3, when it merges to main.

## Files to modify/create

- `packages/scdate/src/internal/zoned.ts`

## Background

- `packages/scdate/src/internal/zoned.ts:1` is `import { toZonedTime } from 'date-fns-tz'`. Its only use is `zoned.ts:142` (`toZonedTime(millisecondsInUTC, timeZone)`). No other tracked file imports date-fns-tz.
- date-fns-tz 3.2.0 is installed. Its `package.json` `exports` declares `"./toZonedTime"` (ESM `dist/esm/toZonedTime/index.js`, CJS `dist/cjs/...`), with `index.d.ts` beside each `index.js`. That `index.d.ts` declares the named export `toZonedTime`. The ESM file imports only date-fns-tz internals, not the date-fns barrel.
- scdate is `"type": "module"`, and its tsconfig uses `module`/`moduleResolution` `NodeNext`, so the subpath export resolves with types.
- The `^3.2.0` dependency range already guarantees the subpath, so `package.json` does not change. `date-fns` stays as date-fns-tz's peer dependency.
- Decisions: the scope is only this import. Okven's upgrade and its setFakeTimer.ts helpers are a separate run in another repo. No new scdate public API.

## Guides

None. The config has no Skills & guides entries.

## Implementation details

- Replace line 1 with `import { toZonedTime } from 'date-fns-tz/toZonedTime'`. Keep the named import. Use the package subpath with no `.js` suffix. Change nothing else.
- Run Format (`yarn prettier --write .`).
- Commit subject (conventional, drives the release bump): `fix: import toZonedTime from date-fns-tz subpath`. Per CLAUDE.md, do not add an attribution footer.

## Gotchas

- Do not use `fromZonedTime` or any other date-fns-tz function. CLAUDE.md requires wall clock → instant to go through `getUTCMillisecondsFromWallClock`.
- Do not write `'date-fns-tz/toZonedTime/index.js'` or a `dist/...` path. Only the declared `exports` key resolves.
- Do not touch package.json or the lockfile.

## Verification

- Check: `yarn build` and `yarn lint` pass. The build proves the subpath resolves with types under NodeNext.
- Unit tests: `yarn test:utc`, `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test` all pass. The existing zoned/sDate/sTime/sTimestamp tests cover `toZonedTime`.
- No new test. The change has no behavior of its own (goals Assumptions).
- Substitute check for the load-time win: `grep -rn "from 'date-fns-tz'" packages/*/src` returns nothing. In `packages/scdate/dist`, `grep -rn "date-fns-tz" packages/scdate/dist` shows only the `date-fns-tz/toZonedTime` specifier.
