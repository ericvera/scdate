[scdate](../README.md) • Docs

---

[scdate](../README.md) / getTimestampFromUTCMilliseconds

# Function: getTimestampFromUTCMilliseconds()

> **getTimestampFromUTCMilliseconds**(`utcDateInMilliseconds`, `timeZone`): [`STimestamp`](../classes/STimestamp.md)

Returns a new STimestamp instance set to the date and time that results from
converting the given number of milliseconds since the Unix epoch to the given
time zone.

## Parameters

| Parameter               | Type     | Description                                                                                                                     |
| :---------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `utcDateInMilliseconds` | `number` | The number of milliseconds since the Unix epoch.                                                                                |
| `timeZone`              | `string` | The time zone to use when creating the timestamp. See<br />`Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

[`STimestamp`](../classes/STimestamp.md)

## Source

[sTimestamp.ts:57](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sTimestamp.ts#L57)
