[**scdate**](../README.md)

---

[scdate](../README.md) / isAfterTimestamp

# Function: isAfterTimestamp()

> **isAfterTimestamp**(`timestamp1`, `timestamp2`): `boolean`

Defined in: [sTimestamp.ts:464](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L464)

Returns true if the first timestamp represents a date and time that happens
after the second timestamp. Returns false otherwise.

## Parameters

| Parameter    | Type                                                 | Description                                                                                          |
| ------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `timestamp1` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The first timestamp to compare. It can be an STimestamp or a string in the YYYY-MM-DDTHH:MM format.  |
| `timestamp2` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The second timestamp to compare. It can be an STimestamp or a string in the YYYY-MM-DDTHH:MM format. |

## Returns

`boolean`
