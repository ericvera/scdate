[scdate](../README.md) • Docs

---

[scdate](../README.md) / isSameTimestamp

# Function: isSameTimestamp()

> **isSameTimestamp**(`timestamp1`, `timestamp2`): `boolean`

Returns true if the two timestamps represent the same date and time. Returns
false otherwise.

## Parameters

| Parameter    | Type                                                 | Description                                                                                               |
| :----------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `timestamp1` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The first timestamp to compare. It can be an STimestamp or<br />a string in the YYYY-MM-DDTHH:MM format.  |
| `timestamp2` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The second timestamp to compare. It can be an STimestamp or<br />a string in the YYYY-MM-DDTHH:MM format. |

## Returns

`boolean`

## Source

[sTimestamp.ts:385](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L385)
