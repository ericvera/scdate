[scdate](../README.md) • Docs

---

[scdate](../README.md) / sWeekdays

# Function: sWeekdays()

> **sWeekdays**(`weekdays`): [`SWeekdays`](../classes/SWeekdays.md)

Returns a new SWeekdays instance.

## Parameters

| Parameter  | Type                                               | Description                                                                                                                                                                                                                                                                                                                             |
| :--------- | :------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `weekdays` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | An instance of SWeekdays that will be returned or a string in<br />the SMTWTFS format. Each character in the string represents a weekday<br />starting on Sunday and ending on Saturday using the first letter of the<br />English word for the week day. If the weekday is excluded, the position is<br />filled with a '-' character. |

## Returns

[`SWeekdays`](../classes/SWeekdays.md)

## Example

```ts
sWeekdays('SM----S')
// Returns an instance of SWeekdays with the weekdays Sunday, Monday, and
// Saturday included while the rest are excluded.
```

## Example

```ts
sWeekdays('SMTWTFS')
// Returns an instance of SWeekdays with all weekdays included.
```

## Source

[sWeekdays.ts:47](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sWeekdays.ts#L47)
