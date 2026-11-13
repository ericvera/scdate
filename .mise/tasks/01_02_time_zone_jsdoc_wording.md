# 01_02: Reword timeZone JSDoc away from Intl.supportedValuesOf

## Goal

Every `@param timeZone` JSDoc that tells readers to see `Intl.supportedValuesOf('timeZone')` for valid zones points to `isValidTimeZone` instead. That list holds only canonical names, so it understates what scdate accepts. This is a wording-only change with no behavior change.

## Files to modify/create

- `packages/scdate/src/sDate.ts` (JSDoc at about lines 80-81, 307-308, 326-327, 441-442, 722-723, 775-776, 814-815)
- `packages/scdate/src/sTime.ts` (about lines 51-52)
- `packages/scdate/src/sTimestamp.ts` (about lines 90-91, 106-107, 144-146, 164-165, 240-241, 295-296, 346-347, 482-483)
- `packages/scdate/src/internal/zoned.ts` (about lines 129-130)
- `packages/scdate-testing/src/createSetFakeTimer.ts` (about lines 33-36)

## Background

- Task 01_01 changed `isValidTimeZone` (`packages/scdate/src/isValidTimeZone.ts`) to accept any zone the runtime's `Intl.DateTimeFormat` accepts: IANA names, aliases, `UTC`, and names in any case. It also updated the README. These JSDoc pointers are the remaining references to `Intl.supportedValuesOf('timeZone')`.
- Find them with `grep -rn "supportedValuesOf" packages --exclude-dir=node_modules --exclude-dir=dist`. After 01_01 that grep should list only these five files. This task removes every hit.
- `scdate-testing` depends on `scdate` (`workspace:*`), so its JSDoc can name `isValidTimeZone` from `scdate`.

## Guides

none

## Implementation details

- Keep each comment's leading description ("The time zone to get the current date for." and so on). Replace only the trailing "See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones." sentence (and its variants, such as "For a list of valid time zones run ... on your environment.") with:
  `Any time zone the runtime's \`Intl.DateTimeFormat\` accepts (IANA names, aliases and \`UTC\`); check with \`isValidTimeZone\`.`
- Re-wrap the comment lines to match the surrounding width (Prettier does not re-wrap comments; keep lines under about 80 columns as the files do).
- Touch nothing but comments.

## Gotchas

- Do not modify `isValidTimeZone.ts`, its test, or the README. Task 01_01 owns them.
- `internal/zoned.ts` has the `@param` at `getTimeZonedDate` (about line 129). Do not touch its code.

## Verification

- No test covers comments. Substitute check: `grep -rn "supportedValuesOf" packages --exclude-dir=node_modules --exclude-dir=dist` returns nothing, and `git diff` shows only comment lines changed.
- Run: `yarn build`, `yarn lint`, `yarn test:utc`, then `yarn prettier --write .`.
