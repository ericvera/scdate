[scdate](../README.md) • Docs

---

[scdate](../README.md) / isSameDateOrAfter

# Function: isSameDateOrAfter()

> **isSameDateOrAfter**(`date1`, `date2`): `boolean`

Returns true when the first date represents a date that happens on the same
date or after the second date and false otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                                   |
| :-------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `date1`   | `string` \| [`SDate`](../classes/SDate.md) | The first date to compare. It can be an SDate or a string in the<br />YYYY-MM-DD format.      |
| `date2`   | `string` \| [`SDate`](../classes/SDate.md) | The second date to compare. It can be an SDate or a string in the<br />the YYYY-MM-DD format. |

## Returns

`boolean`

## Source

[sDate.ts:486](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sDate.ts#L486)
