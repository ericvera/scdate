[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / shiftWeekdaysForward

# Function: shiftWeekdaysForward()

> **shiftWeekdaysForward**(`weekdays`): [`SWeekdays`](../classes/SWeekdays.md)

Returns a new SWeekdays instance with the weekdays shifted forward by one
day.

## Parameters

| Parameter  | Type                                               | Description                                                                              |
| :--------- | :------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| `weekdays` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | The weekdays to shift forward. It can be an SWeekdays or a string in the SMTWTFS format. |

## Returns

[`SWeekdays`](../classes/SWeekdays.md)

## Example

```ts
shiftWeekdaysForward('SM----S')
// Returns an instance of SWeekdays with the weekdays shifted forward by one
// day. 'SM----S' becomes 'SMT----'.
```

## Source

[sWeekdays.ts:125](https://github.com/ericvera/scdate/blob/main/src/sWeekdays.ts#L125)
