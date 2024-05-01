[scdate](../README.md) • Docs

---

[scdate](../README.md) / doesWeekdaysHaveOverlapWithWeekdays

# Function: doesWeekdaysHaveOverlapWithWeekdays()

> **doesWeekdaysHaveOverlapWithWeekdays**(`weekdays1`, `weekdays2`): `boolean`

Returns true if any of the included weekdays in weekdays1 is also included in
weekdays2. Returns false otherwise.

## Parameters

| Parameter   | Type                                               | Description                                                                                           |
| :---------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `weekdays1` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The first set of weekdays to compare. It can be an SWeekdays<br />or a string in the SMTWTFS format.  |
| `weekdays2` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The second set of weekdays to compare. It can be an<br />SWeekdays or a string in the SMTWTFS format. |

## Returns

`boolean`

## Source

[sWeekdays.ts:253](https://github.com/ericvera/scdate/blob/98b214c4aab6f5cdb39bc8c115252b89b40ce8a7/src/sWeekdays.ts#L253)
