[scdate](../README.md) • Docs

---

[scdate](../README.md) / isDateToday

# Function: isDateToday()

> **isDateToday**(`date`, `timeZone`): `boolean`

Returns true when the date is today and false otherwise.

## Parameters

| Parameter  | Type                                       | Description                                                                                                                |
| :--------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `date`     | `string` \| [`SDate`](../classes/SDate.md) | The date to check if it is today. It can be an SDate or a string<br />in the YYYY-MM-DD format.                            |
| `timeZone` | `string`                                   | The time zone to check if the date is today. See<br />`Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`boolean`

## Source

[sDate.ts:504](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L504)
