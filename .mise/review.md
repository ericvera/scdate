# Review

## Tasks

- 01_01 (59faa85): packages/scdate/src/internal/zoned.ts imports `toZonedTime` from 'date-fns-tz/toZonedTime' instead of the 'date-fns-tz' barrel. Verify: `yarn build`, `yarn lint`, `yarn test:utc`, `TZ=Asia/Tokyo yarn test`, `TZ=America/Los_Angeles yarn test`; `grep -rn "from 'date-fns-tz'" packages/*/src` finds nothing.

## Open assumptions

- No new test: the change has no behavior of its own; existing tests cover it.
- No package.json or docs change (`^3.2.0` already has the subpath; CLAUDE.md stays accurate).
- Merging ships a `fix:` patch release 7.1.3 of scdate, scschedule and scdate-testing.
- Okven upgrade and setFakeTimer helpers are a separate run in the Okven repo.

## Amendments

- None.
