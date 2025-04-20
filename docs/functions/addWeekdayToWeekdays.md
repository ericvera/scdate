[**scdate**](../README.md)

---

[scdate](../README.md) / addWeekdayToWeekdays

# Function: addWeekdayToWeekdays()

> **addWeekdayToWeekdays**(`weekdays`, `weekdayToAdd`): [`SWeekdays`](../classes/SWeekdays.md)

Defined in: [sWeekdays.ts:209](https://github.com/ericvera/scdate/blob/main/src/sWeekdays.ts#L209)

Returns a new SWeekdays instance with the provided weekday added to the
current set of weekdays.

## Parameters

| Parameter      | Type                                               | Description                                                                                   |
| -------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `weekdays`     | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The weekdays to add the weekday to. It can be an SWeekdays or a string in the SMTWTFS format. |
| `weekdayToAdd` | [`Weekday`](../enumerations/Weekday.md)            | The weekday to add.                                                                           |

## Returns

[`SWeekdays`](../classes/SWeekdays.md)
