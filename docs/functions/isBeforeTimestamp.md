[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / isBeforeTimestamp

# Function: isBeforeTimestamp()

> **isBeforeTimestamp**(`timestamp1`, `timestamp2`): `boolean`

Returns true if the first timestamp represents a date and time that happens
before the second timestamp. Returns false otherwise.

## Parameters

| Parameter    | Type                                                 | Description                                                                                          |
| :----------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `timestamp1` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The first timestamp to compare. It can be an STimestamp or a string in the YYYY-MM-DDTHH:MM format.  |
| `timestamp2` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The second timestamp to compare. It can be an STimestamp or a string in the YYYY-MM-DDTHH:MM format. |

## Returns

`boolean`

## Source

[sTimestamp.ts:404](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L404)
