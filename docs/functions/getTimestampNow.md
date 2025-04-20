[**scdate**](../README.md)

---

[scdate](../README.md) / getTimestampNow

# Function: getTimestampNow()

> **getTimestampNow**(`timeZone`): [`STimestamp`](../classes/STimestamp.md)

Defined in: [sTimestamp.ts:71](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L71)

Returns a new STimestamp instance set to the current date and time in the
given time zone.

## Parameters

| Parameter  | Type     | Description                                                                                                                |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `timeZone` | `string` | The time zone to use when creating the timestamp. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

[`STimestamp`](../classes/STimestamp.md)
