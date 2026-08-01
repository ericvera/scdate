# CLAUDE.md

## Commits

- No attribution in commit messages — no `Co-Authored-By` line, no "Generated with" footer, nothing naming the agent or tool that wrote the change.
- Keep the message short: a conventional-commit subject line, and a body only when the change needs one, at one or two sentences saying why. Do not list every file, command, or verification step — that belongs in the PR or the run's own report, not in the history.

## TypeScript

- All three packages extend `@tsconfig/strictest`, so `exactOptionalPropertyTypes` is on: an object literal may not set an optional property to a possibly-`undefined` value. Forward a received options object whole (or conditionally spread) instead of rebuilding `{ maybeUndefined: options.maybeUndefined }` literals.

## Time zones

- Converting a wall clock (`YYYY-MM-DD`, `YYYY-MM-DDTHH:MM`) plus an IANA zone to an instant goes through `getUTCMillisecondsFromWallClock` (`packages/scdate/src/internal/zoned.ts`) — in test helpers too, not just source. Never build a `Date` from host-local fields (`new Date(y, m - 1, d, h, min)`) and never hand a UTC-encoded wall clock to `date-fns-tz`'s `fromZonedTime`/`getTimezoneOffset`: both read the value with host-local getters, so the result depends on the process's `TZ` inside a DST fall-back hour. `date-fns-tz` is now only used for `toZonedTime` (instant → zoned `Date`), which is the safe direction.
