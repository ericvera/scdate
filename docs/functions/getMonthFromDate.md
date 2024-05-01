[scdate](../README.md) • Docs

---

[scdate](../README.md) / getMonthFromDate

# Function: getMonthFromDate()

> **getMonthFromDate**(`date`): `number`

Returns the month from the given date. Returns a 0-index value (i.e. Janary
is 0 and December is 11) to match the result from native Date object.

## Parameters

| Parameter | Type                                       | Description                                                                                   |
| :-------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to get the month from. It can be an SDate or a string in<br />the YYYY-MM-DD format. |

## Returns

`number`

## Source

[sDate.ts:172](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sDate.ts#L172)
