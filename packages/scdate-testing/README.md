# scdate-testing

**Test helpers for code that depends on the current time in a time zone**

[![github license](https://img.shields.io/github/license/ericvera/scdate.svg?style=flat-square)](https://github.com/ericvera/scdate/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/scdate-testing.svg?style=flat-square)](https://npmjs.org/package/scdate-testing)

## Overview

Code that reads the current time needs the clock pinned before it can be tested. Doing that with vitest alone means converting a local timestamp to epoch milliseconds at each call site, which is easy to get subtly wrong — usually by treating the timestamp as UTC or as host local time instead of as a wall clock in the application's time zone. scdate-testing does the conversion with [scdate](https://npmjs.org/package/scdate) and exposes it as a helper bound to one time zone.

## Features

- **Wall-clock input**: Timestamps are read as local times in the bound time zone, matching scdate's own semantics
- **Bound once**: The time zone is fixed when the helper is created, so call sites take a single argument
- **Stable assertions**: The set instant is returned, so tests never have to read `Date.now()`
- **Fail fast**: An unusable time zone throws where the helper is created, not inside an unrelated test

## Installation

```bash
npm install --save-dev scdate-testing
# or
yarn add --dev scdate-testing
```

## Requirements

- Node.js >= 24
- vitest >= 4 (peer dependency — the helper drives your project's vitest)
- TypeScript >= 5.0 (for TypeScript users)

## Basic Usage

Create the bound helper once, in a shared test-support module:

```typescript
// src/test-support/setFakeTimer.ts
import { createSetFakeTimer } from 'scdate-testing'

export const setFakeTimer = createSetFakeTimer('America/New_York')
```

Then import it wherever a test needs a specific moment:

```typescript
// src/createOrder.test.ts
import { afterEach, expect, it, vi } from 'vitest'
import { createOrder } from './createOrder.js'
import { setFakeTimer } from './test-support/setFakeTimer.js'

afterEach(() => {
  vi.useRealTimers()
})

it('stamps the order with the current time', () => {
  const now = setFakeTimer('2026-01-24T12:00')

  expect(createOrder().createdAt).toBe(now)
})
```

Restore the real clock with vitest's own `vi.useRealTimers()`.

## Core Concepts

### Wall-clock times

The timestamp is the time a clock on the wall in the bound time zone would show. It is not UTC, not the host's local time, and it carries no offset of its own. The same string produces a different instant in a different zone:

```typescript
createSetFakeTimer('America/New_York')('2026-01-24T12:00') // 1769274000000
createSetFakeTimer('Asia/Tokyo')('2026-01-24T12:00') // 1769223600000
```

Those instants are 14 hours apart, the offset between the zones on that date. Neither depends on the host machine's time zone.

### The return value

`setFakeTimer` returns the epoch milliseconds it set the clock to. The clock is set to that instant and then keeps moving at real speed — it does not stand still, which is what lets code awaiting timers make progress instead of hanging. `Date.now()` therefore drifts by however long the test took, and the returned value does not, so assertions use the returned value.

### Precision

The accepted format is scdate's `YYYY-MM-DDTHH:MM`, so the instant always lands on a whole minute. For a sub-minute instant, compose the return value with `vi.setSystemTime`:

```typescript
const almostMidnight = setFakeTimer('2026-01-24T23:59') // 1769317140000

// One second before midnight in New York
vi.setSystemTime(almostMidnight + 59_000) // 1769317199000
```

### Daylight saving edges

A wall-clock time is not always exactly one instant, and scdate's resolution is inherited as-is. New York has no 02:30 on 2024-03-10, so `'2024-03-10T02:30'` returns `1710052200000`, which reads 01:30 — the wall clock does not round-trip. New York has 01:30 twice on 2024-11-03, and the earlier occurrence is the one that comes back: `1730611800000` (EDT). Both results are the same on every host, so a test pins the same instant locally as it does in CI.

## API Reference

- **`createSetFakeTimer(timeZone)`**: Returns a helper bound to `timeZone`. The zone is validated immediately, so a typo throws here rather than inside an unrelated test.

- **`setFakeTimer(timestamp)`**: Sets vitest's fake timers to `timestamp` interpreted as a wall-clock time in the bound zone, and returns the matching number of milliseconds since the Unix epoch. Each call replaces whatever timer configuration was previously installed. `timestamp` is typed as scdate's `STimestampString`, an alias for `string` that documents the expected `YYYY-MM-DDTHH:MM` format without checking it at compile time; values are validated at runtime.

## License

MIT
