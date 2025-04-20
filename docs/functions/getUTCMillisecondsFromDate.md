[**scdate**](../README.md)

---

[scdate](../README.md) / getUTCMillisecondsFromDate

# Function: getUTCMillisecondsFromDate()

> **getUTCMillisecondsFromDate**(`date`, `timeZone`): `number`

Defined in: [sDate.ts:211](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L211)

Returns the number of milliseconds since the Unix epoch (January 1, 1970, 00:00:00 UTC)
for the given date in the specified time zone.

## Parameters

| Parameter  | Type                                       | Description                                                                                                             |
| ---------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `date`     | `string` \| [`SDate`](../classes/SDate.md) | The date to convert to UTC milliseconds. It can be an SDate or a string in the YYYY-MM-DD format.                       |
| `timeZone` | `string`                                   | The time zone to use when converting the date. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`number`
