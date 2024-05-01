[scdate](../README.md) • Docs

---

[scdate](../README.md) / isDateInCurrentYear

# Function: isDateInCurrentYear()

> **isDateInCurrentYear**(`date`, `timeZone`): `boolean`

Returns true when the year component of the date matches the current year in
the given time zone. Returns false otherwise.

## Parameters

| Parameter  | Type                                       | Description                                                                                                                              |
| :--------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `date`     | `string` \| [`SDate`](../classes/SDate.md) | The date to check if it is in the current year. It can be an<br />SDate or a string in the YYYY-MM-DD format.                            |
| `timeZone` | `string`                                   | The time zone to check if the date is in the current year.<br />See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`boolean`

## Source

[sDate.ts:596](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sDate.ts#L596)
