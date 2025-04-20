[**scdate**](../README.md)

---

[scdate](../README.md) / isDateInCurrentMonth

# Function: isDateInCurrentMonth()

> **isDateInCurrentMonth**(`date`, `timeZone`): `boolean`

Defined in: [sDate.ts:579](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L579)

Returns true when the date represents a date in the current month and year.
Returns false otherwise.

## Parameters

| Parameter  | Type                                       | Description                                                                                                                          |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `date`     | `string` \| [`SDate`](../classes/SDate.md) | The date to check if it is in the current month. It can be an SDate or a string in the YYYY-MM-DD format.                            |
| `timeZone` | `string`                                   | The time zone to check if the date is in the current month. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`boolean`
