import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TestLocalTimeZone } from './__test__/constants'
import { setFakeTimer } from './__test__/setFakeTimer'
import { sDate } from './sDate'
import { sTime } from './sTime'
import {
  addDaysToTimestamp,
  addMinutesToTimestamp,
  getDateFromTimestamp,
  getSecondsToTimestamp,
  getShortTimestampString,
  getTimeFromTimestamp,
  getTimeZonedDateFromTimestamp,
  getTimestampFromDateAndTime,
  getTimestampFromUTCDate,
  getTimestampNow,
  isAfterTimestamp,
  isBeforeTimestamp,
  isSameTimestamp,
  isSameTimestampOrAfter,
  isSameTimestampOrBefore,
  sTimestamp,
} from './sTimestamp'

beforeEach(() => {
  vi.useRealTimers()
})

/**
 * --- Factory ---
 */

describe('sTimestamp', () => {
  it('works for valid value', () => {
    expect(sTimestamp('2028-01-04T12:34')).toMatchInlineSnapshot(
      `"2028-01-04T12:34"`,
    )
  })

  it('throws for invalid value', () => {
    expect(() => {
      sTimestamp('')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: ''.]`,
    )
  })

  it('throws for invalid length data', () => {
    expect(() => {
      sTimestamp('180')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '180'.]`,
    )
  })

  it('throws for invalid characters', () => {
    expect(() => {
      sTimestamp('2023-01-02t11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02t11:00'.]`,
    )
  })

  it('throws for invalid date component in timestamp', () => {
    expect(() => {
      sTimestamp('2023-13-02T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2023-13-02'.]`,
    )
  })

  it('throws for invalid time component in timestamp', () => {
    expect(() => {
      sTimestamp('2023-01-02T24:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '24:00'.]`,
    )
  })
})

/**
 * --- Serialization ---
 */

describe('JSON.stringify', () => {
  it('returns the time for the current timestamp', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const now = getTimestampNow(TestLocalTimeZone)

    expect(JSON.stringify(now)).toMatchInlineSnapshot(`""2022-04-04T12:59""`)
  })

  it('returns the timestamp', () => {
    const timestamp = sTimestamp('2056-12-31T13:45')

    expect(JSON.stringify(timestamp)).toMatchInlineSnapshot(
      `""2056-12-31T13:45""`,
    )
  })
})

/**
 * --- Factory helpers ---
 */

describe('getTimestampFromUTCDate', () => {
  it('works for valid date and time', () => {
    setFakeTimer('2022-02-03T13:22')

    const timestamp = getTimestampFromUTCDate(new Date(), TestLocalTimeZone)

    expect(timestamp).toMatchInlineSnapshot(`"2022-02-03T13:22"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getTimestampFromUTCDate(new Date('p'), TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid date. Date: 'NaN']`)
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getTimestampFromUTCDate(new Date(), 'Puerco Rico')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'Puerco Rico']`,
    )
  })
})

describe('getTimestampNow', () => {
  it('works for a day at midnight', () => {
    setFakeTimer('2022-04-04T00:00')

    expect(getTimestampNow(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-04T00:00"`,
    )
  })

  it('works for a day a second before midnight', () => {
    setFakeTimer('2022-04-03T23:59:59')

    expect(getTimestampNow(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-03T23:59"`,
    )
  })

  it('works for a day in the middle of the day', () => {
    setFakeTimer('2022-04-04T12:59:59')

    expect(getTimestampNow(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-04T12:59"`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getTimestampNow('PR')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'PR']`,
    )
  })
})

describe('getTimestampFromDateAndTime', () => {
  it('works for valid date and time', () => {
    const timestamp = getTimestampFromDateAndTime(
      sDate('2022-12-03'),
      sTime('12:34'),
    )

    expect(timestamp).toMatchInlineSnapshot(`"2022-12-03T12:34"`)
  })

  it('works for valid date and time (strings)', () => {
    const timestamp = getTimestampFromDateAndTime('2022-12-03', '12:34')

    expect(timestamp).toMatchInlineSnapshot(`"2022-12-03T12:34"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getTimestampFromDateAndTime('2001-12-90', sTime('12:34'))
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2001-12-90'.]`,
    )
  })

  it('throws for invalid time', () => {
    expect(() => {
      getTimestampFromDateAndTime(sDate('2001-12-12'), '25:34')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '25:34'.]`,
    )
  })
})

/**
 * --- Getters ---
 */

describe('getTimeZonedDateFromTimestamp', () => {
  it('works for now', () => {
    setFakeTimer('2022-04-04T00:00')

    const now = getTimestampNow(TestLocalTimeZone)

    expect(
      getTimeZonedDateFromTimestamp(now, TestLocalTimeZone).toLocaleString(
        'en-US',
      ),
    ).toMatchInlineSnapshot(`"4/4/2022, 12:00:00 AM"`)
  })

  it('works for date string string', () => {
    expect(
      getTimeZonedDateFromTimestamp(
        '2021-01-01T01:23',
        TestLocalTimeZone,
      ).toLocaleString('en-US'),
    ).toMatchInlineSnapshot(`"1/1/2021, 1:23:00 AM"`)
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      getTimeZonedDateFromTimestamp('2021-01-01T-1:23', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-01-01T-1:23'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getTimeZonedDateFromTimestamp('2021-01-01T01:23', 'Puerto Rico')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'Puerto Rico']`,
    )
  })
})

describe('getSecondsToTimestamp', () => {
  it('works for 0 seconds', () => {
    setFakeTimer('2022-04-04T05:20')

    const timestamp = sTimestamp('2022-04-04T05:20')
    expect(
      getSecondsToTimestamp(timestamp, TestLocalTimeZone),
    ).toMatchInlineSnapshot(`0`)
  })

  it('works for positive seconds seconds (timestamp is in the future)', () => {
    setFakeTimer('2022-04-04T05:21:30')

    expect(
      getSecondsToTimestamp('2022-04-05T05:20', TestLocalTimeZone),
    ).toMatchInlineSnapshot(`86310`)
  })

  it('works for negative seconds (timestamp is in the past)', () => {
    setFakeTimer('2022-04-04T05:21:30')

    expect(
      getSecondsToTimestamp('2022-04-04T05:20', TestLocalTimeZone),
    ).toMatchInlineSnapshot(`-90`)
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      getSecondsToTimestamp('2022-04-04T00:90', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO time value. Expected from 00:00 to 23:59. Current value: '00:90'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getSecondsToTimestamp('2022-04-04T05:20', `${TestLocalTimeZone}p`)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'America/Puerto_Ricop']`,
    )
  })
})

describe('getDateFromTimestamp', () => {
  it('works for now', () => {
    setFakeTimer('2022-04-04T00:00')

    const now = getTimestampNow(TestLocalTimeZone)

    expect(getDateFromTimestamp(now)).toMatchInlineSnapshot(`"2022-04-04"`)
  })

  it('works for date string', () => {
    expect(getDateFromTimestamp('2021-01-01T01:23')).toMatchInlineSnapshot(
      `"2021-01-01"`,
    )
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      getDateFromTimestamp('2021-01-01T-1:23')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-01-01T-1:23'.]`,
    )
  })
})

describe('getTimeFromTimestamp', () => {
  it('works for now', () => {
    setFakeTimer('2022-04-04T00:00')

    const now = getTimestampNow(TestLocalTimeZone)

    expect(getTimeFromTimestamp(now)).toMatchInlineSnapshot(`"00:00"`)
  })

  it('works for date string', () => {
    expect(getTimeFromTimestamp('2021-01-01T01:23')).toMatchInlineSnapshot(
      `"01:23"`,
    )
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      getTimeFromTimestamp('2021-01-01T-1:23')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-01-01T-1:23'.]`,
    )
  })
})

describe('getShortTimestampString', () => {
  const onTodayAtText = (): string => 'Today at'

  it('works on the same day', () => {
    setFakeTimer('2021-08-10T08:00')
    const timestamp = sTimestamp('2021-08-10T08:00')

    expect(
      getShortTimestampString(timestamp, TestLocalTimeZone, 'en', {
        onTodayAtText,
        includeWeekday: false,
      }),
    ).toMatchInlineSnapshot(`"Today at 8:00 AM"`)
  })

  it('works on the next day (same year)', () => {
    setFakeTimer('2021-08-10T08:00')

    expect(
      getShortTimestampString('2021-08-11T08:00', TestLocalTimeZone, 'es', {
        onTodayAtText,
        includeWeekday: false,
      }),
    ).toMatchInlineSnapshot(`"11 ago 8:00 AM"`)
  })

  it('works a year later (without weekday)', () => {
    setFakeTimer('2021-08-10T08:00')

    expect(
      getShortTimestampString('2022-09-11T08:00', TestLocalTimeZone, 'es', {
        onTodayAtText,
        includeWeekday: false,
      }),
    ).toMatchInlineSnapshot(`"11 sept 22 8:00 AM"`)
  })

  it('works a year later (with weekday)', () => {
    setFakeTimer('2021-08-10T08:00')

    expect(
      getShortTimestampString('2022-09-11T08:00', TestLocalTimeZone, 'es', {
        onTodayAtText,
        includeWeekday: true,
      }),
    ).toMatchInlineSnapshot(`"dom, 11 sept 22 8:00 AM"`)
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      getShortTimestampString('2021-08-10T08:00:00', TestLocalTimeZone, 'es', {
        onTodayAtText,
        includeWeekday: true,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-08-10T08:00:00'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getShortTimestampString('2021-08-10T08:00', 'Puerto Rico', 'es', {
        onTodayAtText,
        includeWeekday: true,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'Puerto Rico']`,
    )
  })
})

/**
 * --- Operations ---
 */

describe('addDaysToTimestamp', () => {
  it('works for a day one year later', () => {
    setFakeTimer('2022-04-04T00:00')

    const now = getTimestampNow(TestLocalTimeZone)

    expect(addDaysToTimestamp(now, 365)).toMatchInlineSnapshot(
      `"2023-04-04T00:00"`,
    )
  })

  it('works for the next day', () => {
    expect(addDaysToTimestamp('2021-01-01T01:23', 1)).toMatchInlineSnapshot(
      `"2021-01-02T01:23"`,
    )
  })

  it('works for the previous day', () => {
    const timestamp = sTimestamp('2021-01-01T23:59')

    expect(addDaysToTimestamp(timestamp, -1)).toMatchInlineSnapshot(
      `"2020-12-31T23:59"`,
    )
  })

  it('works for the no change in day', () => {
    expect(addDaysToTimestamp('2021-01-01T00:00', 0)).toMatchInlineSnapshot(
      `"2021-01-01T00:00"`,
    )
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      addDaysToTimestamp('2021-01-01T00:00:00', 0)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-01-01T00:00:00'.]`,
    )
  })
})

describe('addMinutesToTimestamp', () => {
  it('works for a day one year later', () => {
    setFakeTimer('2022-04-04T00:00')

    const now = getTimestampNow(TestLocalTimeZone)

    expect(
      addMinutesToTimestamp(now, 365 * 24 * 60, TestLocalTimeZone),
    ).toMatchInlineSnapshot(`"2023-04-04T00:00"`)
  })

  it('works for a few minutes later', () => {
    expect(
      addMinutesToTimestamp('2021-01-01T23:59', 12, TestLocalTimeZone),
    ).toMatchInlineSnapshot(`"2021-01-02T00:11"`)
  })

  it('works for the next day', () => {
    const timestamp = sTimestamp('2021-01-01T01:23')

    expect(
      addMinutesToTimestamp(timestamp, 1 * 24 * 60, TestLocalTimeZone),
    ).toMatchInlineSnapshot(`"2021-01-02T01:23"`)
  })

  it('works for the previous day', () => {
    expect(
      addMinutesToTimestamp(
        '2021-01-01T23:59',
        -1 * 24 * 60,
        TestLocalTimeZone,
      ),
    ).toMatchInlineSnapshot(`"2020-12-31T23:59"`)
  })

  it('works for the no change in minutes', () => {
    expect(
      addMinutesToTimestamp('2021-01-01T00:00', 0, TestLocalTimeZone),
    ).toMatchInlineSnapshot(`"2021-01-01T00:00"`)
  })

  it('throws for invalid timestamp', () => {
    expect(() => {
      addMinutesToTimestamp('2021-01-01T00:00:00', 0, TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2021-01-01T00:00:00'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      addMinutesToTimestamp('2021-01-01T00:00', 0, 'New York')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'New York']`,
    )
  })
})

/**
 * --- Comparisons ---
 */

describe('isSameTimestamp', () => {
  it('works for date time that is before (different day)', () => {
    const a = sTimestamp('2020-01-03T11:23')
    const b = sTimestamp('2023-01-03T11:23')

    expect(isSameTimestamp(a, b)).toBe(false)
  })

  it('works for date time that is before (different time)', () => {
    const b = sTimestamp('2023-01-03T00:23')

    expect(isSameTimestamp('2023-01-02T00:22', b)).toBe(false)
  })

  it('works for date time that is after (different day)', () => {
    const a = sTimestamp('2023-03-03T00:23')

    expect(isSameTimestamp(a, '2023-01-03T00:23')).toBe(false)
  })

  it('works when date and times that are the same', () => {
    expect(isSameTimestamp('2023-01-02T12:00', '2023-01-02T12:00')).toBe(true)
  })

  it('throws for invalid first timestamp', () => {
    expect(() => {
      isSameTimestamp('2023-01-02T12:0', '2023-01-02T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02T12:0'.]`,
    )
  })

  it('throws for invalid second timestamp', () => {
    expect(() => {
      isSameTimestamp('2023-01-02T12:00', '2023-01-02')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02'.]`,
    )
  })
})

describe('isBeforeTimestamp', () => {
  it('works for date time that is before (different day)', () => {
    const a = sTimestamp('2020-01-03T11:23')
    const b = sTimestamp('2023-01-03T11:23')

    expect(isBeforeTimestamp(a, b)).toBe(true)
  })

  it('works for date time that is before (different time)', () => {
    const b = sTimestamp('2023-01-03T00:23')

    expect(isBeforeTimestamp('2023-01-02T00:22', b)).toBe(true)
  })

  it('works for date time that is after (different day)', () => {
    const a = sTimestamp('2023-03-03T00:23')

    expect(isBeforeTimestamp(a, '2023-01-03T00:23')).toBe(false)
  })

  it('works when date and times that are the same', () => {
    expect(isBeforeTimestamp('2023-01-02T12:00', '2023-01-02T12:00')).toBe(
      false,
    )
  })

  it('throws for invalid first timestamp', () => {
    expect(() => {
      isBeforeTimestamp('2023-01-02T12:0', '2023-01-02T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02T12:0'.]`,
    )
  })

  it('throws for invalid second timestamp', () => {
    expect(() => {
      isBeforeTimestamp('2023-01-02T12:00', '2023-01-02')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02'.]`,
    )
  })
})

describe('isSameTimestampOrBefore', () => {
  it('works for date time that is before (different day)', () => {
    const a = sTimestamp('2020-01-03T11:23')
    const b = sTimestamp('2023-01-03T11:23')

    expect(isSameTimestampOrBefore(a, b)).toBe(true)
  })

  it('works for date time that is before (different time)', () => {
    const b = sTimestamp('2023-01-03T00:23')

    expect(isSameTimestampOrBefore('2023-01-02T00:22', b)).toBe(true)
  })

  it('works for date time that is after (different day)', () => {
    const a = sTimestamp('2023-03-03T00:23')

    expect(isSameTimestampOrBefore(a, '2023-01-03T00:23')).toBe(false)
  })

  it('works when date and times that are the same', () => {
    expect(
      isSameTimestampOrBefore('2023-01-02T12:00', '2023-01-02T12:00'),
    ).toBe(true)
  })

  it('throws for invalid first timestamp', () => {
    expect(() => {
      isSameTimestampOrBefore('2023-01-02T12:0', '2023-01-02T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02T12:0'.]`,
    )
  })

  it('throws for invalid second timestamp', () => {
    expect(() => {
      isSameTimestampOrBefore('2023-01-02T12:00', '2023-01-02')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02'.]`,
    )
  })
})

describe('isAfterTimestamp', () => {
  it('works for date time that is before (different day)', () => {
    const a = sTimestamp('2020-01-03T11:23')
    const b = sTimestamp('2023-01-03T11:23')

    expect(isAfterTimestamp(a, b)).toBe(false)
  })

  it('works for date time that is before (different time)', () => {
    const b = sTimestamp('2023-01-03T00:23')

    expect(isAfterTimestamp('2023-01-02T00:22', b)).toBe(false)
  })

  it('works for date time that is after (different day)', () => {
    const a = sTimestamp('2023-03-03T00:23')

    expect(isAfterTimestamp(a, '2023-01-03T00:23')).toBe(true)
  })

  it('works when date and times that are the same', () => {
    expect(isAfterTimestamp('2023-01-02T12:00', '2023-01-02T12:00')).toBe(false)
  })

  it('throws for invalid first timestamp', () => {
    expect(() => {
      isAfterTimestamp('2023-01-02T12:0', '2023-01-02T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02T12:0'.]`,
    )
  })

  it('throws for invalid second timestamp', () => {
    expect(() => {
      isAfterTimestamp('2023-01-02T12:00', '2023-01-02')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02'.]`,
    )
  })
})

describe('isSameTimestampOrAfter', () => {
  it('works for date time that is before (different day)', () => {
    const a = sTimestamp('2020-01-03T11:23')
    const b = sTimestamp('2023-01-03T11:23')

    expect(isSameTimestampOrAfter(a, b)).toBe(false)
  })

  it('works for date time that is before (different time)', () => {
    const b = sTimestamp('2023-01-03T00:23')

    expect(isSameTimestampOrAfter('2023-01-02T00:22', b)).toBe(false)
  })

  it('works for date time that is after (different day)', () => {
    const a = sTimestamp('2023-03-03T00:23')

    expect(isSameTimestampOrAfter(a, '2023-01-03T00:23')).toBe(true)
  })

  it('works when date and times that are the same', () => {
    expect(isSameTimestampOrAfter('2023-01-02T12:00', '2023-01-02T12:00')).toBe(
      true,
    )
  })

  it('throws for invalid first timestamp', () => {
    expect(() => {
      isSameTimestampOrAfter('2023-01-02T12:0', '2023-01-02T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02T12:0'.]`,
    )
  })

  it('throws for invalid second timestamp', () => {
    expect(() => {
      isSameTimestampOrAfter('2023-01-02T12:00', '2023-01-02')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date and time format. Expected format: YYYY-MM-DDTHH:MM. Current value: '2023-01-02'.]`,
    )
  })
})
