[scdate](../README.md) • Docs

---

[scdate](../README.md) / doesWeekdaysIncludeWeekday

# Function: doesWeekdaysIncludeWeekday()

> **doesWeekdaysIncludeWeekday**(`weekdays`, `weekday`): `boolean`

Returns true if the provided weekdays include the provided weekday. Returns
false otherwise.

## Parameters

| Parameter  | Type                                               | Description                                                                           |
| :--------- | :------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `weekdays` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The weekdays to check. It can be an SWeekdays or a string in<br />the SMTWTFS format. |
| `weekday`  | [`Weekday`](../enumerations/Weekday.md)            | The weekday to check.                                                                 |

## Returns

`boolean`

## Source

[sWeekdays.ts:234](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sWeekdays.ts#L234)
