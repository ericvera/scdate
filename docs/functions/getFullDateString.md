[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / getFullDateString

# Function: getFullDateString()

> **getFullDateString**(`date`, `locale`): `string`

Returns a string representation that includes all of the date components of
the given date formatted according to the given locale.

## Parameters

| Parameter | Type                                       | Description                                                                                                  |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `date`    | `string` \| [`SDate`](../classes/SDate.md) | The date to get the full string representation for. It can be an SDate or a string in the YYYY-MM-DD format. |
| `locale`  | `LocalesArgument`                          | The locale to use for the string representation.                                                             |

## Returns

`string`

## Examples

```ts
getFullDateString('2021-02-05', 'es')
//=> 'viernes, 5 de febrero de 2021'
```

```ts
getFullDateString('2021-02-05', 'en')
//=> 'Friday, February 5, 2021'
```

## Defined in

[sDate.ts:271](https://github.com/ericvera/scdate/blob/main/src/sDate.ts#L271)
