[**scdate**](../README.md) • **Docs**

---

[scdate](../README.md) / addMinutesToTimestamp

# Function: addMinutesToTimestamp()

> **addMinutesToTimestamp**(`timestamp`, `minutes`, `timeZone`): [`STimestamp`](../classes/STimestamp.md)

Returns a new STimestamp instance resulting from adding the given number of
minutes to the given timestamp.

Daylight Saving Time Notes:

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
milliseconds before adding the specified minutes. This works as expected for
all times, but the expectation for the transition times (those that don't
happen on a watch that automatically adjusts or that happen twice) it can
work in unexpected ways.

Time is converted from the given time zone to
UTC before the minutes are added, and then converted back to the specified
time zone. This results in the resulting time being adjusted for daylight saving time
changes. (e.g. Adding 60 minutes to 2024-03-10T01:59 in America/New_York will
result in 2024-03-10T03:59 as time move forward one hour for daylight saving
time at 2024-03-10T02:00.)

For example, adding one minute to 2024-03-10T01:59 will result in
2024-03-10T03:00 as expected. However, trying to add one minute to
2024-03-10T02:00 (a time that technically does not exist on a watch that
automatically adjusts for Daylight Saving) will result in 2024-03-10T01:01.
This is because 2024-03-10T02:00 is converted to 2024-03-10T06:00 UTC (due
to timezone offset being -4 starting from 02:00 local time) and one minute
later would be 2024-03-10T06:01 UTC which would be 2024-03-10T01:01 in
`America/New_York`. A similar situation happens when the time zone
transitions from Daylight Saving Time to Standard Time as can be derived from
the table below.

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

| Parameter   | Type                                                 | Description                                                                                                                |
| :---------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `timestamp` | `string` \| [`STimestamp`](../classes/STimestamp.md) | The timestamp to add minutes to. It can be an STimestamp or a string in the YYYY-MM-DDTHH:MM format.                       |
| `minutes`   | `number`                                             | The number of minutes to add to the timestamp.                                                                             |
| `timeZone`  | `string`                                             | The time zone to use when creating the timestamp. See `Intl.supportedValuesOf('timeZone')` for a list of valid time zones. |

## Returns

[`STimestamp`](../classes/STimestamp.md)

## Source

[sTimestamp.ts:353](https://github.com/ericvera/scdate/blob/main/src/sTimestamp.ts#L353)
