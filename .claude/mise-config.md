# Mise Configuration

Mise directory: .mise/
Branch convention: feat/<slug> for features, fix/<slug> for bug fixes

## Quality commands

- Format: yarn prettier --write .
- Check:
  - yarn build
  - yarn lint
- Unit tests: yarn test:utc

## Test conventions

- Vitest; tests colocated with source as `packages/<pkg>/src/<module>.test.ts`; run with fixed timezone via `yarn test:utc`. CI runs bare `yarn test`, so tests must pass under any host `TZ` — also run the touched package's suite under a non-UTC `TZ` before calling it done. `packages/scdate/src/sTimestamp.test.ts` has two known pre-existing failures under eastern host zones; scope non-UTC runs to the package you touched.
- Assert thrown errors with `toThrowErrorMatchingInlineSnapshot`, never `.toThrow(...)` — every existing test in the repo does, and `grep -rn '\.toThrow' packages/*/src` finds no plain form.
- Test only what the package under test adds. Do not re-assert a dependency's behavior (scdate's conversion, DST resolution, zone offsets) or that a barrel re-exports its module — delegation is covered by one equality check against the dependency.

## Test exceptions

- Anything that would need an e2e test (no e2e infrastructure exists) — verify with unit tests plus manual verification.
