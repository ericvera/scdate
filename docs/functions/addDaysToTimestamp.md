[scdate](../README.md) • Docs

---

[scdate](../README.md) / addDaysToTimestamp

# Function: addDaysToTimestamp()

> **addDaysToTimestamp**(`timestamp`, `days`): [`STimestamp`](../classes/STimestamp.md)

Returns a new STimestamp instance resulting from adding the given number of
calendar days to the given timestamp. Because it adds calendar days rather
than 24-hour days, this operation is not affected by time zones.

## Parameters

| Parameter   | Type                                                 | Description                                                                                            |
| :---------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The timestamp to add days to. It can be an STimestamp or a<br />string in the YYYY-MM-DDTHH:MM format. |
| `days`      | `number`                                             | The number of days to add to the timestamp.                                                            |

## Returns

[`STimestamp`](../classes/STimestamp.md)

## Source

[sTimestamp.ts:279](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L279)
