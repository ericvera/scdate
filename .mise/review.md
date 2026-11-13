# Review

All paths are under `packages/scdate`. Verify everything with `yarn build`, `yarn lint`, `yarn test:utc`, `TZ=Asia/Tokyo yarn test` and `TZ=America/Los_Angeles yarn test` (790 tests).

## Tasks

- 01_01 comparators (`daebdcd`): added `compareDates`, `compareTimes` and `compareTimestamps`. Removed again by 02_01, so nothing of it remains in the diff against `main`.
- 01_02 coercion guard (`30070e5`): `toString()` and a `valueOf(): never` that throws a `TypeError` on `SDate`, `STime`, `STimestamp` and `SWeekdays` in `src/internal/`. Verify with the `describe('string conversion')` blocks in the four test files and the README section "String Conversion and Comparison".
- 01_03 full date string options (`3eed33f`): `SDateFullStringOptions` (`includeYear`, `weekdaySeparator`) as an optional third argument of `getFullDateString` in `src/sDate.ts`. Verify with the 6 new tests in `describe('getFullDateString')`; the existing snapshots are untouched.
- Review fix, documentation (`cedc730`): the README section "String Conversion and Comparison" gains a works / throws / unchanged table, the alternatives, the type-level effect and a "Migrating from scDate 8" subsection; the `toString()` and `valueOf()` JSDoc in the four classes is filled out. Verify by reading the README section.
- 02_01 remove comparators (`e5abcc9`): deletes the three comparators, their tests and every README mention. Sorting is documented as `.sort()` with no comparator, or `String(value)` with `localeCompare`. Verify that `grep -rn 'compareDates\|compareTimes\|compareTimestamps' packages` finds nothing.
- 02_02 valueOf messages (`5d90daa`): the `valueOf()` error messages and JSDoc in `SDate`, `STime` and `STimestamp` name the `isSame*` / `isBefore*` / `isAfter*` functions and `String(value)`. Verify with the 9 inline snapshots in the three test files.

## Open assumptions

- The guard follows Temporal's exact shape, a throwing `valueOf()`, taken from the owner's "how does Temporal do it" plus "continue". The alternative is `Symbol.toPrimitive`, which throws for the same operators and leaves an explicit `.valueOf()` call alone.
- `fast-deep-equal` throws when given two instances, because it calls `a.valueOf()`. The README documents it. Whether Okven deep-compares instances that way is not known; the owner has a prompt to audit Okven.
- A hand-built `{ date, toJSON }` object no longer type-checks as `SDate` (confirmed with tsc).
- `weekdaySeparator` does nothing where the locale puts nothing after the weekday (ja).
- The release is a `feat!`. The publish workflow versions and publishes `scdate`, `scschedule` and `scdate-testing` together, so all three get a new major.
- The squash commit needs a `BREAKING CHANGE:` footer of one or two sentences describing the coercion change.
- The Okven-side changes are a separate run after the release. The Okven sort uses `String(value)`, not a comparator.

## Amendments

- 2026-11-13 Remove `compareDates`, `compareTimes` and `compareTimestamps` — the owner: not needed now that `toString()` exists, and removing them after publishing would be a breaking change — tasks: 02_01, 02_02.
