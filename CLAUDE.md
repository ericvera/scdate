# CLAUDE.md

## TypeScript

- Both packages extend `@tsconfig/strictest`, so `exactOptionalPropertyTypes` is on: an object literal may not set an optional property to a possibly-`undefined` value. Forward a received options object whole (or conditionally spread) instead of rebuilding `{ maybeUndefined: options.maybeUndefined }` literals.
