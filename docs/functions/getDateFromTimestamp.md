[scdate](../README.md) • Docs

---

[scdate](../README.md) / getDateFromTimestamp

# Function: getDateFromTimestamp()

> **getDateFromTimestamp**(`timestamp`): [`SDate`](../classes/SDate.md)

Returns a new SDate instance set to the date part of the given timestamp.

## Parameters

| Parameter   | Type                                                 | Description                                                                                                  |
| :---------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The timestamp to get the date from. It can be an STimestamp<br />or a string in the YYYY-MM-DDTHH:MM format. |

## Returns

[`SDate`](../classes/SDate.md)

## Source

[sTimestamp.ts:197](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sTimestamp.ts#L197)
