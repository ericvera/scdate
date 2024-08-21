[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / addMonthsToDate

# Function: addMonthsToDate()

> **addMonthsToDate**(`date`, `months`): [`SDate`](../classes/SDate.md)

Returns a new SDate instance with the date resulting from adding the given
number of months to the given date. Because it just adds to the month
component of the date, this operation is not affected by time zones.

## Parameters

| Parameter | Type                                       | Description                                                                         |
| --------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to add months to. It can be an SDate or a string in the YYYY-MM-DD format. |
| `months`  | `number`                                   | The number of months to add to the date.                                            |

## Returns

[`SDate`](../classes/SDate.md)

## Defined in

[sDate.ts:367](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L367)
