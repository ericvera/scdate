[scdate](../README.md) • Docs

---

[scdate](../README.md) / getSecondsToTimestamp

# Function: getSecondsToTimestamp()

> **getSecondsToTimestamp**(`timestamp`, `timeZone`): `number`

Returns the number of seconds from now to the given timestamp. If the
timestamp is in the future, the number of seconds will be positive. If the
timestamp is in the past, the number of seconds will be negative.

Daylight Saving Notes:

The following notes use `America/New_York` as the time zone to explain how
Daylight Savings is handled, but it works the same across time zones on their
respective Daylight Saving schedules as defined by Intl API.

Notice that when looking at a watch (that adjusts for Daylight Saving
automatically) on 2024-03-10 (the day Daylight Savings goes into effect and
the time moves forward one hour) the times between 02:00 and 02:59 never
happen as the watch goes from 01:59 to 03:00. In the case of 2024-11-03 (the
day the time zone goes back to Standard Time), the times between 01:00 and
01:59 happen twice as the first time the watch hits 02:00 it goes back to
01:00.

To account for time zone changes, this method converts the timestamp to UTC
milliseconds (for both the current time and the expected timestamp) before
calculating the difference in seconds. This works as expected for all times,
but the expectation for the transition times (those that don't happen on a
watch that automatically adjusts or that happen twice) it can work in
unexpected ways.

For example, trying to calculate the number of seconds to 2024-03-10T02:00
(the start of Daylight Saving Time) at 2024-03-10T01:59 (still in Standard
Time) will result in -3540 seconds (59 minutes in the past). A similar
situation happens when the time zone transitions from Daylight Saving Time to
Standard Time as can be derived from the table below.

In 'America/New_York'

Transition to Eastern Daylight Time (EDT) in 2024
| Time Zone | T1 | T2 | T3 |
|------------------|-----------------------|------------------------|-----------------------|
| America/New_York | 2024-03-10T01:59(EST) | 2024-03-10T02:00(EDT) | 2024-03-10T03:00(EST) |
| UTC | 2024-03-10T06:59 | 2024-03-10T06:00 | 2024-03-10T07:00 |

Transition to Eastern Standard Time (EST) in 2024
| Time Zone | T1 | T2 | T3 |
|------------------|-----------------------|------------------------|-----------------------|
| America/New_York | 2024-11-03T01:59(EDT) | 2024-11-03T02:00(EST) | 2024-11-03T03:00(EST) |
| UTC | 2024-11-03T05:59 | 2024-11-03T07:00 | 2024-11-03T08:00 |

## Parameters

| Parameter   | Type                                                 | Description                                                                                                                     |
| :---------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The timestamp to get the seconds to. It can be an STimestamp<br />or a string in the YYYY-MM-DDTHH:MM format.                   |
| `timeZone`  | `string`                                             | The time zone to use when creating the timestamp. See<br />`Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

`number`

## Source

[sTimestamp.ts:174](https://github.com/ericvera/scdate/blob/26a0ee551696abb8d0e853bcc8b83fccd84ac8ae/src/sTimestamp.ts#L174)
