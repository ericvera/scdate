[scdate](../README.md) • Docs

---

[scdate](../README.md) / getTimeZonedDateFromDate

# Function: getTimeZonedDateFromDate()

> **getTimeZonedDateFromDate**(`date`, `timeZone`): `Date`

Returns a native Date adjusted so that the local time of that date matches
the local time at the specified time zone.

## Parameters

| Parameter  | Type                                       | Description                                                                                                        |
| :--------- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `date`     | `string` \| [`SDate`](../classes/SDate.md) | The date to get the time zoned date from. It can be an SDate or a<br />string in the YYYY-MM-DD format.            |
| `timeZone` | `string`                                   | The time zone to adjust the date to. See<br />`Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`Date`

## Source

[sDate.ts:213](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L213)
