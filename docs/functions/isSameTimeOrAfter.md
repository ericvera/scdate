[scdate](../README.md) • Docs

---

[scdate](../README.md) / isSameTimeOrAfter

# Function: isSameTimeOrAfter()

> **isSameTimeOrAfter**(`time1`, `time2`): `boolean`

Returns true when first time represents a time that happens after or at the
same time as the second time. Returns false otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                          |
| :-------- | :----------------------------------------- | :----------------------------------------------------------------------------------- |
| `time1`   | `string` \| [`STime`](../classes/STime.md) | The first time to compare. It can be an STime or a string in the<br />HH:MM format.  |
| `time2`   | `string` \| [`STime`](../classes/STime.md) | The second time to compare. It can be an STime or a string in<br />the HH:MM format. |

## Returns

`boolean`

## Source

[sTime.ts:235](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sTime.ts#L235)
