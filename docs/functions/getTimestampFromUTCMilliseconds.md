[**scdate**](../README.md)

---

[scdate](../README.md) / getTimestampFromUTCMilliseconds

# Function: getTimestampFromUTCMilliseconds()

> **getTimestampFromUTCMilliseconds**(`utcDateInMilliseconds`, `timeZone`): [`STimestamp`](../classes/STimestamp.md)

Defined in: [sTimestamp.ts:55](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L55)

Returns a new STimestamp instance set to the date and time that results from
converting the given number of milliseconds since the Unix epoch to the given
time zone.

## Parameters

| Parameter               | Type     | Description                                                                                                                |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `utcDateInMilliseconds` | `number` | The number of milliseconds since the Unix epoch.                                                                           |
| `timeZone`              | `string` | The time zone to use when creating the timestamp. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

[`STimestamp`](../classes/STimestamp.md)
