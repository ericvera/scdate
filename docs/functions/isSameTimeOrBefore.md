[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / isSameTimeOrBefore

# Function: isSameTimeOrBefore()

> **isSameTimeOrBefore**(`time1`, `time2`): `boolean`

Returns true when first time represents a time that happens before or at the
same time as the second time. Returns false otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                     |
| :-------- | :----------------------------------------- | :------------------------------------------------------------------------------ |
| `time1`   | `string` \| [`STime`](../classes/STime.md) | The first time to compare. It can be an STime or a string in the HH:MM format.  |
| `time2`   | `string` \| [`STime`](../classes/STime.md) | The second time to compare. It can be an STime or a string in the HH:MM format. |

## Returns

`boolean`

## Source

[sTime.ts:273](https://github.com/ericvera/scdate/blob/main/src/sTime.ts#L273)
