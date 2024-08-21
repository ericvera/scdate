[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / doesWeekdaysIncludeWeekday

# Function: doesWeekdaysIncludeWeekday()

> **doesWeekdaysIncludeWeekday**(`weekdays`, `weekday`): `boolean`

Returns true if the provided weekdays include the provided weekday. Returns
false otherwise.

## Parameters

| Parameter  | Type                                               | Description                                                                      |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `weekdays` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The weekdays to check. It can be an SWeekdays or a string in the SMTWTFS format. |
| `weekday`  | [`Weekday`](../enumerations/Weekday.md)            | The weekday to check.                                                            |

## Returns

`boolean`

## Defined in

[sWeekdays.ts:234](https://github.com/ericvera/scdate/blob/main/src/sWeekdays.ts#L234)
