[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / getTimeZonedDateFromTimestamp

# Function: getTimeZonedDateFromTimestamp()

> **getTimeZonedDateFromTimestamp**(`timestamp`, `timeZone`): `Date`

Returns a native Date adjusted so that the local time of that date matches
the local timestamp at the specified time zone.

## Parameters

| Parameter   | Type                                                 | Description                                                                                                   |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | -                                                                                                             |
| `timeZone`  | `string`                                             | The time zone to adjust the date to. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`Date`

## Defined in

[sTimestamp.ts:109](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L109)
