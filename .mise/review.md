# Review

All paths are under `packages/scdate`. Verify everything with `yarn build`, `yarn lint`, `yarn test:utc`, `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test` (812 tests).

## Tasks

- 01_01 comparators (`daebdcd`): `compareDates`, `compareTimes` and `compareTimestamps` in `src/sDate.ts`, `src/sTime.ts` and `src/sTimestamp.ts`, each taking `S*String | S*` and returning `-1 | 0 | 1`. Verify with the `compare*` describes in the three test files and the README comparison blocks.
- 01_02 coercion guard (`30070e5`): `toString()` and a `valueOf(): never` that throws a `TypeError` on `SDate`, `STime`, `STimestamp` and `SWeekdays` in `src/internal/`. Verify with the `describe('string conversion')` blocks in the four test files and the README section "String Conversion and Comparison".
- 01_03 full date string options (`3eed33f`): `SDateFullStringOptions` (`includeYear`, `weekdaySeparator`) as an optional third argument of `getFullDateString` in `src/sDate.ts`. Verify with the 6 new tests in `describe('getFullDateString')`; the existing snapshots are untouched.

## Open assumptions

- The guard follows Temporal's exact shape, a throwing `valueOf()`, taken from the owner's "how does Temporal do it" plus "continue". The alternative is `Symbol.toPrimitive`, which throws for the same operators and leaves an explicit `.valueOf()` call alone.
- `fast-deep-equal` throws when given two instances, because it calls `a.valueOf()`. The README documents it. Whether Okven deep-compares instances that way is not known.
- A hand-built `{ date, toJSON }` object no longer type-checks as `SDate` (confirmed with tsc).
- The comparators were kept although `String(a) < String(b)` now works.
- `weekdaySeparator` does nothing where the locale puts nothing after the weekday (ja).
- The release is a `feat!`. The publish workflow versions and publishes `scdate`, `scschedule` and `scdate-testing` together, so all three get a new major.
- The squash commit needs a `BREAKING CHANGE:` footer of one or two sentences describing the coercion change.
- The Okven-side changes are a separate run after the release.

## Amendments

None.
