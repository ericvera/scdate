[scdate](../README.md) • Docs

---

[scdate](../README.md) / isAfterTime

# Function: isAfterTime()

> **isAfterTime**(`time1`, `time2`): `boolean`

Returns true when first time represents a time that happens after the second
time. Returns false otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                          |
| :-------- | :----------------------------------------- | :----------------------------------------------------------------------------------- |
| `time1`   | `string` \| [`STime`](../classes/STime.md) | The first time to compare. It can be an STime or a string in the<br />HH:MM format.  |
| `time2`   | `string` \| [`STime`](../classes/STime.md) | The second time to compare. It can be an STime or a string in<br />the HH:MM format. |

## Returns

`boolean`

## Source

[sTime.ts:216](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sTime.ts#L216)
