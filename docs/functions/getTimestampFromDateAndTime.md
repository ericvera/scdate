[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / getTimestampFromDateAndTime

# Function: getTimestampFromDateAndTime()

> **getTimestampFromDateAndTime**(`date`, `time`): [`STimestamp`](../classes/STimestamp.md)

Returns a new STimestamp instance set to the date and time that results from
combining the given date and time.

## Parameters

| Parameter | Type                                       | Description                                                                                           |
| :-------- | :----------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to use when creating the timestamp. It can be an SDate or a string in the YYYY-MM-DD format. |
| `time`    | `string` \| [`STime`](../classes/STime.md) | The time to use when creating the timestamp. It can be an STime or a string in the HH:MM format.      |

## Returns

[`STimestamp`](../classes/STimestamp.md)

## Source

[sTimestamp.ts:86](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L86)
