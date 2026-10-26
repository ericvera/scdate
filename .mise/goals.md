[infra] import date-fns-tz subpaths in scdate and setFakeTimer helpers to halve functions test file startup
---
Description: scdate's src/internal/zoned.ts does import { toZonedTime } from 'date-fns-tz', loading the whole date-fns barrel (~530 ms per test file vs 13 ms for the subpath). Change it to 'date-fns-tz/toZonedTime', publish a scdate release, and move Okven off scdate 7.0.0. Then point the three setFakeTimer.ts helpers (functions/src/test/utils, hosting/test/utils, packages/core/src/test/utils) at 'date-fns-tz/fromZonedTime'. A/B on 116 functions test files: 37.5→18.7 s, 80→33 s, 75→28 s. Also helps Cloud Function cold starts.

## Investigation

- Change site: packages/scdate/src/internal/zoned.ts:1 imports `{ toZonedTime } from 'date-fns-tz'`; only use is zoned.ts:142. No other tracked file imports date-fns-tz.
- date-fns-tz 3.2.0 installed; `exports` declares "./toZonedTime" (and "./fromZonedTime") with types. Should type-check under NodeNext (not yet built). Range `^3.2.0` already guarantees the subpath; no package.json change. `date-fns` stays as date-fns-tz's peer dependency.
- The subpath avoids the date-fns barrel (only imports date-fns-tz internals).
- Pattern: keep the named import `{ toZonedTime }`, specifier 'date-fns-tz/toZonedTime' (no `.js`).
- Release: merging to main publishes. publish.yml versions all workspaces together and publishes scdate, scschedule and scdate-testing; bump comes from the conventional-commit subject (`fix:`/`perf:` → 7.1.2 → 7.1.3).
- Okven parts (bump off scdate 7.0.0, retarget three setFakeTimer.ts helpers) live in the Okven repo, not here. scdate is already 7.1.2, past breaking change e0f7244 (DST-ambiguous wall-clock resolution) and d24b24e, so Okven's upgrade is a behavior change too.
- Retargeting Okven's helpers to `fromZonedTime` keeps a usage CLAUDE.md:14 warns against (UTC-encoded wall clock → host-TZ dependent); `getUTCMillisecondsFromWallClock` is internal and likely not exported.
- Testing: no behavior change; existing tests (yarn test:utc + Tokyo/LA TZ runs) cover it. No new test per config.
- Docs: CLAUDE.md:14 stays true.

## Open questions

1. Scope of this run (Okven parts live in another repo).
2. Commit type for the release (fix vs perf).
