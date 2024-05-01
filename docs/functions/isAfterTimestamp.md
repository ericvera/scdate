[scdate](../README.md) • Docs

---

[scdate](../README.md) / isAfterTimestamp

# Function: isAfterTimestamp()

> **isAfterTimestamp**(`timestamp1`, `timestamp2`): `boolean`

Returns true if the first timestamp represents a date and time that happens
after the second timestamp. Returns false otherwise.

## Parameters

| Parameter    | Type                                                 | Description                                                                                               |
| :----------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `timestamp1` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The first timestamp to compare. It can be an STimestamp or<br />a string in the YYYY-MM-DDTHH:MM format.  |
| `timestamp2` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The second timestamp to compare. It can be an STimestamp or<br />a string in the YYYY-MM-DDTHH:MM format. |

## Returns

`boolean`

## Source

[sTimestamp.ts:442](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sTimestamp.ts#L442)
