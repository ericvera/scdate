[scdate](../README.md) • Docs

---

[scdate](../README.md) / getTimeInMinutes

# Function: getTimeInMinutes()

> **getTimeInMinutes**(`time`, `midnightIs24`): `number`

Returns the time converted to minutes since midnight.

## Parameters

| Parameter      | Type                                       | Default value | Description                                                                                |
| :------------- | :----------------------------------------- | :------------ | :----------------------------------------------------------------------------------------- |
| `time`         | `string` \| [`STime`](../classes/STime.md) | `undefined`   | The time to get the minutes from. It can be an STime or a string<br />in the HH:MM format. |
| `midnightIs24` | `boolean`                                  | `false`       | -                                                                                          |

## Returns

`number`

## Source

[sTime.ts:135](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sTime.ts#L135)
