[scdate](../README.md) • Docs

---

[scdate](../README.md) / getNextDateByWeekday

# Function: getNextDateByWeekday()

> **getNextDateByWeekday**(`date`, `weekday`): [`SDate`](../classes/SDate.md)

Returns a new SDate instance set to the next date after the provided date
that match the given weekday.

## Parameters

| Parameter | Type                                       | Description                                                                                          |
| :-------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to start from (not included). It can be an SDate or a<br />string in the YYYY-MM-DD format. |
| `weekday` | [`Weekday`](../enumerations/Weekday.md)    | The weekday to find the next date for.                                                               |

## Returns

[`SDate`](../classes/SDate.md)

## Source

[sDate.ts:68](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sDate.ts#L68)
