[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / addMinutesToTime

# Function: addMinutesToTime()

> **addMinutesToTime**(`time`, `minutes`): [`STime`](../classes/STime.md)

Returns a new STime instance with the time resulting from adding the given
number of minutes to the given time. The time will wrap around a 24 hour
clock.

## Parameters

| Parameter | Type                                       | Description                                                                         |
| --------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `time`    | `string` \| [`STime`](../classes/STime.md) | The time to add the minutes to. It can be an STime or a string in the HH:MM format. |
| `minutes` | `number`                                   | The number of minutes to add.                                                       |

## Returns

[`STime`](../classes/STime.md)

## Defined in

[sTime.ts:165](https://github.com/ericvera/scdate/blob/main/src/sTime.ts#L165)
