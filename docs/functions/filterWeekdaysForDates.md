[scdate](../README.md) • Docs

---

[scdate](../README.md) / filterWeekdaysForDates

# Function: filterWeekdaysForDates()

> **filterWeekdaysForDates**(`weekdays`, `fromDate`, `toDate`): [`SWeekdays`](../classes/SWeekdays.md)

Returns a new SWeekdays instance where only the weekdays that are within the
provided date range are included.

## Parameters

| Parameter  | Type                                               | Description                                                                                |
| :--------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `weekdays` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The weekdays to filter. It can be an SWeekdays or a string in<br />the SMTWTFS format.     |
| `fromDate` | `string` \| [`SDate`](../classes/SDate.md)         | The start date of the range. It can be an SDate or a string<br />in the YYYY-MM-DD format. |
| `toDate`   | `string` \| [`SDate`](../classes/SDate.md)         | The end date of the range. It can be an SDate or a string in<br />the YYYY-MM-DD format.   |

## Returns

[`SWeekdays`](../classes/SWeekdays.md)

## Example

```ts
filterWeekdaysForDates('SMTWTFS', '2020-03-05', '2020-03-05')
// Returns an instance of SWeekdays with only Thursday included.
```

## Source

[sWeekdays.ts:162](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sWeekdays.ts#L162)
