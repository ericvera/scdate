# Mise Configuration

Mise directory: .mise/
Branch convention: feat/<slug> for features, fix/<slug> for bug fixes
Ship: merge (squash)

## Quality commands

- Format: yarn prettier --write .
- Check:
  - yarn build
  - yarn lint
- Unit tests: yarn test:utc

## Test conventions

- Vitest; tests colocated with source as `packages/<pkg>/src/<module>.test.ts`; run with fixed timezone via `yarn test:utc`. CI runs bare `yarn test`, so tests must pass under any host `TZ` — also run the suite under both an eastern and a western host zone (`TZ=Asia/Tokyo yarn test`, `TZ=America/Los_Angeles yarn test`) before calling it done; one non-UTC zone can hide a zone-dependent defect.
- Assert thrown errors with `toThrowErrorMatchingInlineSnapshot`, never `.toThrow(...)` — every existing test in the repo does, and `grep -rn '\.toThrow' packages/*/src` finds no plain form.
- Test only what the package under test adds. Do not re-assert a dependency's behavior (scdate's conversion, DST resolution, zone offsets) or that a barrel re-exports its module — delegation is covered by one equality check against the dependency.

## Test exceptions

- Anything that would need an e2e test (no e2e infrastructure exists) — verify with unit tests plus manual verification.
