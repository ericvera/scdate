[scdate](../README.md) • Docs

---

[scdate](../README.md) / isSameDateOrBefore

# Function: isSameDateOrBefore()

> **isSameDateOrBefore**(`date1`, `date2`): `boolean`

Returns true when the first date represents a date that happens on the same
date or before the second date and false otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                                   |
| :-------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `date1`   | `string` \| [`SDate`](../classes/SDate.md) | The first date to compare. It can be an SDate or a string in the<br />YYYY-MM-DD format.      |
| `date2`   | `string` \| [`SDate`](../classes/SDate.md) | The second date to compare. It can be an SDate or a string in the<br />the YYYY-MM-DD format. |

## Returns

`boolean`

## Source

[sDate.ts:448](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L448)
