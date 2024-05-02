[scdate](../README.md) • Docs

---

[scdate](../README.md) / SWeekdays

# Class: SWeekdays

SWeekdays represents a string of weekdays in the format 'SMTWTFS' where each
position is represented by a flag indicating if the weekday (starting on
Sunday and ending on Saturday using the first letter of the english word for
the week day) is included or excluded. If excluded, the position is filled
with a '-' character.

## Constructors

### new SWeekdays()

> **new SWeekdays**(`weekdays`): [`SWeekdays`](SWeekdays.md)

#### Parameters

| Parameter  | Type     |
| :--------- | :------- |
| `weekdays` | `string` |

#### Returns

[`SWeekdays`](SWeekdays.md)

#### Source

[internal/SWeekdays.ts:13](https://github.com/ericvera/scdate/blob/main/src/internal/SWeekdays.ts#L13)

## Properties

### weekdays

> `readonly` **weekdays**: `string`

#### Source

[internal/SWeekdays.ts:11](https://github.com/ericvera/scdate/blob/main/src/internal/SWeekdays.ts#L11)

## Methods

### toJSON()

> **toJSON**(): `string`

#### Returns

`string`

#### Source

[internal/SWeekdays.ts:19](https://github.com/ericvera/scdate/blob/main/src/internal/SWeekdays.ts#L19)
