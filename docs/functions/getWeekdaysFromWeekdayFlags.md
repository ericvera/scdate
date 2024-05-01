[scdate](../README.md) • Docs

---

[scdate](../README.md) / getWeekdaysFromWeekdayFlags

# Function: getWeekdaysFromWeekdayFlags()

> **getWeekdaysFromWeekdayFlags**(`weekdays`): [`SWeekdays`](../classes/SWeekdays.md)

Returns a new SWeekdays instance with all provided weekdays included. The
provided weekdays can be any combination of the Weekday enum values.

## Parameters

| Parameter  | Type                                    | Description                               |
| :--------- | :-------------------------------------- | :---------------------------------------- |
| `weekdays` | [`Weekday`](../enumerations/Weekday.md) | A combination of the Weekday enum values. |

## Returns

[`SWeekdays`](../classes/SWeekdays.md)

## Example

```ts
getWeekdaysFromWeekdayFlags(Weekday.Monday | Weekday.Wednesday | Weekday.Friday)
// Returns an instance of SWeekdays with the weekdays Monday, Wednesday, and
// Friday included while the rest are excluded.
```

## Example

```ts
getWeekdaysFromWeekdayFlags(Weekday.Tuesday)
// Returns an instance of SWeekdays with the weekday Tuesday included while
// the rest are excluded.
```

## Source

[sWeekdays.ts:79](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sWeekdays.ts#L79)
