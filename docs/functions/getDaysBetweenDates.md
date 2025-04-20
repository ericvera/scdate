[**scdate**](../README.md)

---

[scdate](../README.md) / getDaysBetweenDates

# Function: getDaysBetweenDates()

> **getDaysBetweenDates**(`date1`, `date2`): `number`

Defined in: [sDate.ts:260](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L260)

Returns the number of days between the first date to the second date. The
value is positive if the first date is before the second date, and negative
if the first date is after the second date. This accounts for calendar days
and not full 24-hour periods which could be different due to daylight saving
adjustments.

## Parameters

| Parameter | Type                                       | Description                                                                                       |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `date1`   | `string` \| [`SDate`](../classes/SDate.md) | The first date to get the days between. It can be an SDate or a string in the YYYY-MM-DD format.  |
| `date2`   | `string` \| [`SDate`](../classes/SDate.md) | The second date to get the days between. It can be an SDate or a string in the YYYY-MM-DD format. |

## Returns

`number`
