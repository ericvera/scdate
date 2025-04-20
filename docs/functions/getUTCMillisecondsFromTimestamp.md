[**scdate**](../README.md)

---

[scdate](../README.md) / getUTCMillisecondsFromTimestamp

# Function: getUTCMillisecondsFromTimestamp()

> **getUTCMillisecondsFromTimestamp**(`timestamp`, `timeZone`): `number`

Defined in: [sTimestamp.ts:107](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L107)

Returns the number of milliseconds since the Unix epoch (January 1, 1970, 00:00:00 UTC)
for the given timestamp in the specified time zone.

## Parameters

| Parameter   | Type                                                 | Description                                                                                                                  |
| ----------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The timestamp to convert to UTC milliseconds. It can be an STimestamp or a string in the YYYY-MM-DDTHH:MM format.            |
| `timeZone`  | `string`                                             | The time zone to use when converting the timestamp. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`number`
