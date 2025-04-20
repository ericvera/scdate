[**scdate**](../README.md)

---

[scdate](../README.md) / getPreviousDateByWeekday

# Function: getPreviousDateByWeekday()

> **getPreviousDateByWeekday**(`date`, `weekday`): [`SDate`](../classes/SDate.md)

Defined in: [sDate.ts:95](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L95)

Returns a new SDate instance set to date that is before the provided date and
matches the given weekday.

## Parameters

| Parameter | Type                                       | Description                                                                                         |
| --------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to start from (not included).                                                              |
| `weekday` | [`Weekday`](../enumerations/Weekday.md)    | The weekday to find the previous date for. It can be an SDate or a string in the YYYY-MM-DD format. |

## Returns

[`SDate`](../classes/SDate.md)
