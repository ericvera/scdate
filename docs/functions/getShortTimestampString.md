[scdate](../README.md) • Docs

---

[scdate](../README.md) / getShortTimestampString

# Function: getShortTimestampString()

> **getShortTimestampString**(`timestamp`, `timeZone`, `locale`, `options`): `string`

Returns a string representation that includes a minimum set of components
from the given timestamp. This is a combination of the the results of
the `getShortDateString` method, and `get12HourTimeString`.

## Parameters

| Parameter   | Type                                                                            | Description                                                                                                                        |
| :---------- | :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md)                            | The timestamp to get the short string from. It can be an<br />STimestamp or a string in the YYYY-MM-DDTHH:MM format.               |
| `timeZone`  | `string`                                                                        | The time zone to use when creating the short string. See<br />`Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |
| `locale`    | `LocalesArgument`                                                               | The locale to use for the string representation.                                                                                   |
| `options`   | [`STimestampShortStringOptions`](../interfaces/STimestampShortStringOptions.md) | An object with options for the short string representation.                                                                        |

## Returns

`string`

## Example

```ts
// Example when the timestamp is today
getShortTimestampString('2021-08-10T08:00', 'America/Puerto_Rico', 'en', {
  includeWeekday: true,
  onTodayAtText: () => 'Today at',
})
//=> 'Today at 8:00 AM'
```

## Example

```ts
// Example when the timestamp is not today
getShortTimestampString('2022-09-11T08:00', 'America/Puerto_Rico', 'es', {
  includeWeekday: true,
  onTodayAtText: () => 'Hoy a las',
})
//=> 'dom, 11 sept 22 8:00 AM'
```

## Source

[sTimestamp.ts:247](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L247)
