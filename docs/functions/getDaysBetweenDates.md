[scdate](../README.md) • Docs

---

[scdate](../README.md) / getDaysBetweenDates

# Function: getDaysBetweenDates()

> **getDaysBetweenDates**(`date1`, `date2`): `number`

Returns the number of days between the first date to the second date. The
value is positive if the first date is before the second date, and negative
if the first date is after the second date. This accounts for calendar days
and not full 24-hour periods which could be different due to daylight saving
adjustments.

## Parameters

| Parameter | Type                                       | Description                                                                                            |
| :-------- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `date1`   | `string` \| [`SDate`](../classes/SDate.md) | The first date to get the days between. It can be an SDate or a<br />string in the YYYY-MM-DD format.  |
| `date2`   | `string` \| [`SDate`](../classes/SDate.md) | The second date to get the days between. It can be an SDate or a<br />string in the YYYY-MM-DD format. |

## Returns

`number`

## Source

[sDate.ts:238](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sDate.ts#L238)
