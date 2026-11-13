Work on the following task. You are the one responsible for the task so consider any suggestions about the problem or implementation as guidance and make your own informed suggestions and recommendation.

[bug] accept zone aliases and UTC in scdate isValidTimeZone

isValidTimeZone in scdate 9.0.0 (dist/isValidTimeZone.js) returns Intl.supportedValuesOf('timeZone').includes(timeZone). That list holds only canonical IANA names, so the function rejects zones the rest of the JavaScript runtime accepts and that scdate's own functions use without complaint.

On Node 24.18:

Zone	new Intl.DateTimeFormat(…, { timeZone })	isValidTimeZone
UTC	accepted	false
Etc/UTC	accepted	false
GMT	accepted	false
US/Eastern	accepted	false
Asia/Kolkata	accepted	false
america/puerto_rico	accepted	false
America/Puerto_Rico	accepted	true
scdate disagrees with itself: getUTCMillisecondsFromDate('2025-03-09', 'UTC') works and returns Date.UTC(2025, 2, 9), while isValidTimeZone('UTC') says the zone is invalid.
Asia/Kolkata is the current name for India's zone, but some runtimes list it under the older Asia/Calcutta. The answer then depends on which ICU version the runtime ships.
Effect on Okven: validateAttributionConfig in @okv/attribution keeps its own Intl.DateTimeFormat try/catch instead of calling isValidTimeZone. Switching would reject UTC and other zones that are accepted today. Production only uses America/Puerto_Rico, so nothing is broken now.

Fix: have isValidTimeZone construct Intl.DateTimeFormat with the zone inside a try/catch and return false only when it throws. Release that in an scdate patch.

Done when:

isValidTimeZone returns true for every zone in the table above, and false for Invalid/Zone and +05:00.
scdate tests cover UTC, an old alias, and a lowercase name.
validateAttributionConfig uses isValidTimeZone, and its tests still pass.

## Investigation

1. Reproduced on Node v24.18.0. `Intl.supportedValuesOf('timeZone')` leaves out UTC, Etc/UTC, GMT, US/Eastern, Asia/Kolkata, america/puerto_rico and utc, but `new Intl.DateTimeFormat` accepts all of them. This runtime's list has the old name Asia/Calcutta, not Asia/Kolkata.
2. Root cause: `packages/scdate/src/isValidTimeZone.ts:8-10` checks `Intl.supportedValuesOf('timeZone').includes(timeZone)`. The regression test belongs in `packages/scdate/src/isValidTimeZone.test.ts`, which is the only file the fix touches besides the README.
3. Contradiction with the description: on Node 24.18, `Intl.DateTimeFormat` accepts '+05:00', '-03:00' and '+0530' (resolvedOptions gives back '+05:00'). The try/catch fix alone therefore returns true for '+05:00', but the done-when requires false. Offsets need an explicit reject.
4. Precedent for that reject: `okven/packages/attribution/src/validateAttributionConfig.ts:111` rejects zones that start with '+' or '-' before its try/catch at :117-121. Its test at `validateAttributionConfig.test.ts:495-501` expects the fixed-offset message. If isValidTimeZone simply returned true for offsets, swapping it in would lose that message.
5. scdate itself accepts offsets today: `getUTCMillisecondsFromDate('2025-03-09', '+05:00')` returns a value. So does 'PST', both through date-fns-tz `toZonedTime` (`zoned.ts:142`) and the `Intl.DateTimeFormat` path (`zoned.ts:17-30`). Rejecting offsets in isValidTimeZone keeps it out of step with the rest of scdate for offsets only.
6. Existing tests the fix breaks: `isValidTimeZone.test.ts:20-22` expect false for 'EST', 'PST' and 'UTC'. All three are accepted by `Intl.DateTimeFormat`, including 'PST' with this ICU. Those cases must flip to true or be dropped.
7. Cases still correctly false after the fix: 'Invalid/Timezone', 'America/Not_A_Place', 'Random String', '' (test lines 15-18), and 'Invalid/Zone'. Each throws RangeError.
8. Edge case: JS callers passing `undefined` would get true, because `timeZone: undefined` falls back to the host zone. The signature is `timeZone: string` (`isValidTimeZone.ts:6`), so this only matters for untyped callers.
9. Pattern to follow: `zoned.ts:17-29` already builds `new Intl.DateTimeFormat('en-US', { timeZone, ... })` inside try/catch and caches it in a Map (`zoned.ts:6`). isValidTimeZone could reuse that check or mirror it.
10. Docs to update: `README.md:413-421` says to list valid zones with `Intl.supportedValuesOf`, and its example uses 'Invalid/Timezone'. The same "see supportedValuesOf" JSDoc appears in `zoned.ts:130`, `sDate.ts:81`, `sTimestamp.ts:91` and others. Wording-only.
11. Hard to undo: this is a public API behavior change shipped as a patch. isValidTimeZone is exported from `packages/scdate/src/index.ts:2`, and some inputs that returned false will now return true. The version is 9.0.0, and releases are commits like "chore(release): v9.0.0", so the commit type picks the bump. scschedule no longer re-exports it.
12. Cross-repo: okven pins `scdate: ^8.0.0` in `packages/attribution/package.json:24` and 4 other package.json files, and has 8.0.0 installed. Using isValidTimeZone in validateAttributionConfig needs those bumped to ^9.x (a major version). That is in a different repo, outside this branch.

## Scope

- In scope: the scdate fix, its tests, and the README/JSDoc wording.
- Out of scope (owner's call): the third done-when. Switching okven's validateAttributionConfig to isValidTimeZone, and the scdate 8→9 bump it needs, is a follow-up in the okven repo after 9.0.1 is published.

## Bug fix record

- Repro: on Node 24.18, `isValidTimeZone('UTC')` (also 'Etc/UTC', 'GMT', 'US/Eastern', 'Asia/Kolkata', 'america/puerto_rico') returns false.
- Expected: true for every zone in the table above; false for 'Invalid/Zone' and '+05:00'.
- Regression test: `packages/scdate/src/isValidTimeZone.test.ts`, covering UTC, an old alias, and a lowercase name.

## Proposal

- Issue: isValidTimeZone checks `Intl.supportedValuesOf('timeZone')`, which lists only canonical names, so it rejects UTC, aliases and lowercase names that the runtime and the rest of scdate accept.
- Fix: validate by constructing `Intl.DateTimeFormat` in a try/catch, with an explicit reject for fixed offsets ('+'/'-' prefix) and non-strings; update the tests, README and JSDoc; ship as a `fix:` commit (patch). The okven switch is a follow-up, not this run.
- Skips: spec and critic — one small module, no new concept.

## Assumptions

- Fixed offsets are rejected explicitly: any zone starting with '+' or '-' returns false, since the done-when requires false for '+05:00' and `Intl.DateTimeFormat` accepts it. This matches the reject validateAttributionConfig already does.
- Abbreviations the runtime accepts ('EST', 'PST', 'UTC') return true; the existing tests expecting false for them are flipped or dropped.
- A non-string argument (untyped JS caller) returns false rather than falling through to the host zone.
- The README section and the JSDoc that point at `Intl.supportedValuesOf` are reworded to match the new behavior.
- The change ships as a `fix:` commit so the release tooling cuts a patch (9.0.1).
