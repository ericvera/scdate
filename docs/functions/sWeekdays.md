[**scdate**](../README.md)

---

[scdate](../README.md) / sWeekdays

# Function: sWeekdays()

> **sWeekdays**(`weekdays`): [`SWeekdays`](../classes/SWeekdays.md)

Defined in: [sWeekdays.ts:47](https://github.com/ericvera/scdate/blob/main/src/sWeekdays.ts#L47)

Returns a new SWeekdays instance.

## Parameters

| Parameter  | Type                                               | Description                                                                                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `weekdays` | `string` \| [`SWeekdays`](../classes/SWeekdays.md) | An instance of SWeekdays that will be returned or a string in the SMTWTFS format. Each character in the string represents a weekday starting on Sunday and ending on Saturday using the first letter of the English word for the week day. If the weekday is excluded, the position is filled with a '-' character. |

## Returns

[`SWeekdays`](../classes/SWeekdays.md)

## Examples

```ts
sWeekdays('SM----S')
// Returns an instance of SWeekdays with the weekdays Sunday, Monday, and
// Saturday included while the rest are excluded.
```

```ts
sWeekdays('SMTWTFS')
// Returns an instance of SWeekdays with all weekdays included.
```
