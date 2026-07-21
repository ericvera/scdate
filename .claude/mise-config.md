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

Vitest; tests colocated with source as `packages/<pkg>/src/<module>.test.ts`; run with fixed timezone via `yarn test:utc`.

## Test exceptions

- Anything that would need an e2e test (no e2e infrastructure exists) — verify with unit tests plus manual verification.
