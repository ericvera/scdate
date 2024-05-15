[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / addDaysToDate

# Function: addDaysToDate()

> **addDaysToDate**(`date`, `days`): [`SDate`](../classes/SDate.md)

Returns a new SDates instance with the date resulting from adding the given
number of days to the given date. Because it adds calendar days rather than
24-hour days, this operation is not affected by time zones.

## Parameters

| Parameter | Type                                       | Description                                                                       |
| :-------- | :----------------------------------------- | :-------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to add days to. It can be an SDate or a string in the YYYY-MM-DD format. |
| `days`    | `number`                                   | The number of days to add to the date.                                            |

## Returns

[`SDate`](../classes/SDate.md)

## Source

[sDate.ts:349](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L349)
