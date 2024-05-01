[scdate](../README.md) • Docs

---

[scdate](../README.md) / getPreviousDateByWeekday

# Function: getPreviousDateByWeekday()

> **getPreviousDateByWeekday**(`date`, `weekday`): [`SDate`](../classes/SDate.md)

Returns a new SDate instance set to date that is before the provided date and
matches the given weekday.

## Parameters

| Parameter | Type                                       | Description                                                                                              |
| :-------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to start from (not included).                                                                   |
| `weekday` | [`Weekday`](../enumerations/Weekday.md)    | The weekday to find the previous date for. It can be an SDate<br />or a string in the YYYY-MM-DD format. |

## Returns

[`SDate`](../classes/SDate.md)

## Source

[sDate.ts:97](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sDate.ts#L97)
