[**scdate**](../README.md)

---

[scdate](../README.md) / areDatesInSameMonth

# Function: areDatesInSameMonth()

> **areDatesInSameMonth**(`date1`, `date2`): `boolean`

Defined in: [sDate.ts:557](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L557)

Returns true when the month on the first date is the same as the month on the
second date. It also checks that the year is the same. Returns false
otherwise.

## Parameters

| Parameter | Type                                       | Description                                                                          |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `date1`   | `string` \| [`SDate`](../classes/SDate.md) | The first date to compare. It can be an SDate or a string in the YYYY-MM-DD format.  |
| `date2`   | `string` \| [`SDate`](../classes/SDate.md) | The second date to compare. It can be an SDate or a string in the YYYY-MM-DD format. |

## Returns

`boolean`

## Examples

```ts
areDatesInSameMonth('2021-02-05', '2021-02-15')
//=> true
```

```ts
areDatesInSameMonth('2022-02-05', '2023-02-15')
//=> false (different years)
```
