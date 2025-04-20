[**scdate**](../README.md)

---

[scdate](../README.md) / areDatesInSameYear

# Function: areDatesInSameYear()

> **areDatesInSameYear**(`date1`, `date2`): `boolean`

Defined in: [sDate.ts:597](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L597)

Returns true when the year of the first date is the same as the year on the
second date. Returns false otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                          |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `date1`   | `string` \| [`SDate`](../classes/SDate.md) | The first date to compare. It can be an SDate or a string in the YYYY-MM-DD format.  |
| `date2`   | `string` \| [`SDate`](../classes/SDate.md) | The second date to compare. It can be an SDate or a string in the YYYY-MM-DD format. |

## Returns

`boolean`
