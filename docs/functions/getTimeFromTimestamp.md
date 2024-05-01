[scdate](../README.md) • Docs

---

[scdate](../README.md) / getTimeFromTimestamp

# Function: getTimeFromTimestamp()

> **getTimeFromTimestamp**(`timestamp`): [`STime`](../classes/STime.md)

Returns a new STime instance set to the time part of the given timestamp.

## Parameters

| Parameter   | Type                                                 | Description                                                                                                  |
| :---------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The timestamp to get the time from. It can be an STimestamp<br />or a string in the YYYY-MM-DDTHH:MM format. |

## Returns

[`STime`](../classes/STime.md)

## Source

[sTimestamp.ts:209](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sTimestamp.ts#L209)
