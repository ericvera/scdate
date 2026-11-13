# Review

## Tasks

- 01_01 (`cd5405f`): `packages/scdate/src/isValidTimeZone.ts` validates with a `new Intl.DateTimeFormat('en-US', { timeZone })` try/catch and returns false for non-strings; `isValidTimeZone.test.ts` adds UTC, Etc/UTC, GMT, US/Eastern, Asia/Kolkata, america/puerto_rico, EST, PST (true), Invalid/Zone and a non-string (false); `packages/scdate/README.md` Time Zones section reworded. Verify: `yarn test:utc`, and `TZ=Asia/Tokyo yarn test`, `TZ=America/Los_Angeles yarn test`.
- 01_02 (`d98f52b`): the 18 `@param timeZone` JSDoc entries in `sDate.ts`, `sTime.ts`, `sTimestamp.ts`, `internal/zoned.ts` and `scdate-testing/src/createSetFakeTimer.ts` point at `isValidTimeZone` instead of `Intl.supportedValuesOf`. Comments only. Verify: `yarn build && yarn lint`.

## Open assumptions

- Fixed offsets follow the runtime: `+05:00` is true on Node 24 and false on runtimes that reject offsets. No test pins it. (Owner's call, superseding the original done-when.)
- `EST`, `PST` and `UTC` now return true; the old tests expecting false were flipped.
- A non-string argument returns false rather than falling through to the host zone.
- The squash merge must carry a `fix:` subject so the release is a patch. The publish workflow releases scdate, scschedule and scdate-testing together at 9.0.1.
- Out of scope: switching okven's validateAttributionConfig to isValidTimeZone (needs the scdate 8→9 bump there, after 9.0.1 is published). It keeps its own offset reject.

## Amendments

None.
