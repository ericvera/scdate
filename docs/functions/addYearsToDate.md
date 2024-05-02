[scdate](../README.md) • Docs

---

[scdate](../README.md) / addYearsToDate

# Function: addYearsToDate()

> **addYearsToDate**(`date`, `years`): [`SDate`](../classes/SDate.md)

Returns a new SDate instance with the date resulting from adding the given
number of years to the given date. Because this only adds to the year
component of the date, this method is not affected by leap years.

## Parameters

| Parameter | Type                                       | Description                                                                             |
| :-------- | :----------------------------------------- | :-------------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to add years to. It can be an SDate or a string in the<br />YYYY-MM-DD format. |
| `years`   | `number`                                   | The number of years to add to the date.                                                 |

## Returns

[`SDate`](../classes/SDate.md)

## Source

[sDate.ts:388](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L388)
