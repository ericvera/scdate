[scdate](../README.md) • Docs

---

[scdate](../README.md) / getShortDateString

# Function: getShortDateString()

> **getShortDateString**(`date`, `timeZone`, `locale`, `options`): `string`

Get the short string representation of the given date in the given locale.

## Parameters

| Parameter  | Type                                                                  | Description                                                                                                                           |
| :--------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `date`     | `string` \| [`SDate`](../classes/SDate.md)                            | The date to get the short string representation for. It can be an<br />SDate or a string in the YYYY-MM-DD format.                    |
| `timeZone` | `string`                                                              | The time zone used to determine if in the current year. See<br />`Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |
| `locale`   | `LocalesArgument`                                                     | The locale to use for the string representation.                                                                                      |
| `options`  | [`SDateShortStringOptions`](../interfaces/SDateShortStringOptions.md) | The options to customize the short string representation.                                                                             |

## Returns

`string`

## Example

```ts
getShortDateString('2021-02-05', TestLocalTimeZone, 'en', {
  onTodayText,
  includeWeekday: false,
}),
//=> 'Feb 5' (year is not shown when in the current year)
```

## Example

```ts
getShortDateString('2021-02-05', TestLocalTimeZone, 'es', {
  onTodayText,
  includeWeekday: true,
})
//=> 'vie, 5 feb 21' (year when not in current year)
```

## Source

[sDate.ts:312](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L312)
