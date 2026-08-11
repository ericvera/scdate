import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TestLocalTimeZone,
  TestLocalTimeZoneWithDaylight,
} from './__test__/constants.js'
import { setFakeTimer } from './__test__/setFakeTimer.js'
import { Weekday } from './constants.js'
import {
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  areDatesInSameMonth,
  areDatesInSameYear,
  getDateForFirstDayOfISOWeek,
  getDateForFirstDayOfMonth,
  getDateForLastDayOfMonth,
  getDateFromDate,
  getDateToday,
  getDaysBetweenDates,
  getFullDateString,
  getISOWeekFromDate,
  getISOWeekYearFromDate,
  getMonthFromDate,
  getNextDateByWeekday,
  getPreviousDateByWeekday,
  getShortDateString,
  getTimeZonedDateFromDate,
  getUTCMillisecondsFromDate,
  getWeekdayFromDate,
  getYearFromDate,
  isAfterDate,
  isBeforeDate,
  isDateInCurrentMonth,
  isDateInCurrentYear,
  isDateToday,
  isSameDate,
  isSameDateOrAfter,
  isSameDateOrBefore,
  sDate,
} from './sDate.js'

beforeEach(() => {
  vi.useRealTimers()
})

/**
 * --- Factory ---
 */
describe('sDate', () => {
  it('works given a valid string', () => {
    expect(sDate('2022-03-02')).toMatchInlineSnapshot(`"2022-03-02"`)
  })

  it('throws given an invalid value', () => {
    expect(() => {
      sDate('')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: ''.]`,
    )
  })

  it('throws given invalid length data', () => {
    expect(() => {
      sDate('20231203')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '20231203'.]`,
    )
  })

  it('throws given invalid characters', () => {
    expect(() => {
      sDate('2023-s2-03')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-s2-03'.]`,
    )
  })

  it('throws given a date that does not exist', () => {
    expect(() => {
      sDate('2023-11-31')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2023-11-31'.]`,
    )
  })
})

/**
 * --- Serialization ---
 */
describe('JSON.stringify', () => {
  it('returns the string value for the date in YYYY-MM-DD format', () => {
    const date = sDate('2035-12-31')

    expect(JSON.stringify(date)).toMatchInlineSnapshot(`""2035-12-31""`)
  })
})

/**
 * --- Factory helpers ---
 */

describe('getDateToday', () => {
  it('works at midnight', () => {
    setFakeTimer('2022-04-04T00:00')

    expect(getDateToday(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-04"`,
    )
  })

  it('works a second before midnight', () => {
    setFakeTimer('2022-04-03T23:59:59')

    expect(getDateToday(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-03"`,
    )
  })

  it('works in the middle of the day', () => {
    setFakeTimer('2022-04-04T12:59:59')

    expect(getDateToday(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-04"`,
    )
  })

  it('works during the transition to daylight saving time', () => {
    setFakeTimer('2024-03-10T02:30', TestLocalTimeZoneWithDaylight)

    expect(getDateToday(TestLocalTimeZoneWithDaylight)).toMatchInlineSnapshot(
      `"2024-03-10"`,
    )
  })

  it('works during the transition from daylight saving time', () => {
    setFakeTimer('2024-11-03T01:30', TestLocalTimeZoneWithDaylight)

    expect(getDateToday(TestLocalTimeZoneWithDaylight)).toMatchInlineSnapshot(
      `"2024-11-03"`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getDateToday('invalid')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'invalid']`,
    )
  })
})

describe('getUTCMillisecondsFromDate', () => {
  it('returns UTC milliseconds for a date', () => {
    const date = sDate('2023-10-15')
    const utcMilliseconds = getUTCMillisecondsFromDate(date, TestLocalTimeZone)

    // 1697342400000 is '2023-10-15T04:00' in UTC which is what is expected for
    // the date in the local time zone.
    expect(utcMilliseconds).toBe(1697342400000)
  })

  it('resolves a repeated midnight to the earlier occurrence', () => {
    const date = sDate('2024-11-03')
    const utcMilliseconds = getUTCMillisecondsFromDate(date, 'America/Havana')

    // Cuba ends daylight saving time at 01:00 local, which makes '00:00' the
    // repeated hour on that date (unlike the TestLocalTimeZone* zones, where
    // midnight is unambiguous). 1730606400000 is '2024-11-03T04:00' in UTC, the
    // earlier (CDT, -4) occurrence. The later (CST, -5) occurrence,
    // 1730610000000, must not be returned.
    expect(utcMilliseconds).toBe(1730606400000)
  })

  it('resolves a skipped midnight forward to the first instant of the day', () => {
    const date = sDate('2017-10-01')
    const utcMilliseconds = getUTCMillisecondsFromDate(date, 'America/Asuncion')

    // Paraguay started daylight saving time at 00:00 local on 2017-10-01,
    // jumping straight to 01:00, so midnight never happened that day. The first
    // instant of the day is '01:00' local (PYST, -3). 1506830400000 is
    // '2017-10-01T04:00' in UTC. The backward-shifted value, 1506826800000
    // ('2017-10-01T03:00' in UTC), reads back as '2017-09-30T23:00' local — an
    // instant on the previous day — and must not be returned.
    expect(utcMilliseconds).toBe(1506830400000)
  })

  it('throws for invalid time zone', () => {
    const date = sDate('2023-10-15')

    expect(() => {
      getUTCMillisecondsFromDate(date, 'Invalid/TimeZone')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'Invalid/TimeZone']`,
    )
  })
})

describe('getNextDateByWeekday', () => {
  it('returns the next date and not the current date when on a date with the desired weekday', () => {
    const date = sDate('2023-03-18')
    const result = getNextDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-25"`)
  })

  it('works when the desired weekday is Sunday (first weekday by index)', () => {
    const result = getNextDateByWeekday('2023-03-18', Weekday.Sun)

    expect(result).toMatchInlineSnapshot(`"2023-03-19"`)
  })

  it('works when the desired weekday is Saturday (last weekday by index)', () => {
    const date = sDate('2023-03-19')
    const result = getNextDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-25"`)
  })

  it('works when the calculation requires to wrap around of weekdays (Tue -> Mon)', () => {
    const result = getNextDateByWeekday('2023-03-21', Weekday.Mon)

    expect(result).toMatchInlineSnapshot(`"2023-03-27"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getNextDateByWeekday('2023-3-21', Weekday.Sun)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-3-21'.]`,
    )
  })

  it('throws for invalid weekday', () => {
    expect(() => {
      getNextDateByWeekday('2023-03-21', Weekday.Sun | Weekday.Thu)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday '17'. Expected a single weekday.]`,
    )
  })
})

describe('getPreviousDateByWeekday', () => {
  it('returns the previous matching date when called on a date that matches the desired weekday', () => {
    const date = sDate('2023-03-18')
    const result = getPreviousDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-11"`)
  })

  it('returns the previous date when desired weekday is Sunday (first weekday by index)', () => {
    const result = getPreviousDateByWeekday('2023-03-18', Weekday.Sun)

    expect(result).toMatchInlineSnapshot(`"2023-03-12"`)
  })

  it('returns the previous date when desired weekday is Saturday (last weekday by index)', () => {
    const result = getPreviousDateByWeekday('2023-03-19', Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-18"`)
  })

  it('returns the previous date when the calculation required to wrap around weekdays (Tue -> Sat)', () => {
    const date = sDate('2023-03-21')
    const result = getPreviousDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-18"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getPreviousDateByWeekday('2023-3-21', Weekday.Sun)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-3-21'.]`,
    )
  })

  it('throws for invalid weekday', () => {
    expect(() => {
      getPreviousDateByWeekday('2023-03-21', 'asd' as unknown as Weekday)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday 'asd'. Expected a single weekday.]`,
    )
  })
})

describe('getDateForFirstDayOfMonth', () => {
  it('works on the first day of year', () => {
    setFakeTimer('2022-01-01T00:05')

    const today = getDateToday(TestLocalTimeZone)

    expect(getDateForFirstDayOfMonth(today)).toMatchInlineSnapshot(
      `"2022-01-01"`,
    )
  })

  it('works on the last day of February (non leap year)', () => {
    expect(getDateForFirstDayOfMonth('2021-02-28')).toMatchInlineSnapshot(
      `"2021-02-01"`,
    )
  })

  it('works on the last day of February (leap year)', () => {
    expect(getDateForFirstDayOfMonth('2020-02-29')).toMatchInlineSnapshot(
      `"2020-02-01"`,
    )
  })

  it('works when given a date that is the last day of the month', () => {
    expect(getDateForFirstDayOfMonth('2021-12-31')).toMatchInlineSnapshot(
      `"2021-12-01"`,
    )
  })

  it('works for a date in the middle of month', () => {
    expect(getDateForFirstDayOfMonth('2021-06-12')).toMatchInlineSnapshot(
      `"2021-06-01"`,
    )
  })

  it('works for a date that is the first day of month', () => {
    expect(getDateForFirstDayOfMonth('2021-06-01')).toMatchInlineSnapshot(
      `"2021-06-01"`,
    )
  })

  it('throws for invalid date', () => {
    expect(() => {
      getDateForFirstDayOfMonth('2023-3-21')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-3-21'.]`,
    )
  })
})

describe('getDateForLastDayOfMonth', () => {
  it('works for the first day of year', () => {
    setFakeTimer('2022-01-01T00:05')

    const today = getDateToday(TestLocalTimeZone)

    expect(getDateForLastDayOfMonth(today)).toMatchInlineSnapshot(
      `"2022-01-31"`,
    )
  })

  it('works for the last day of February (non leap year)', () => {
    const date = sDate('2021-02-01')

    expect(getDateForLastDayOfMonth(date)).toMatchInlineSnapshot(`"2021-02-28"`)
  })

  it('works for the last day of February (leap year)', () => {
    expect(getDateForLastDayOfMonth('2020-02-03')).toMatchInlineSnapshot(
      `"2020-02-29"`,
    )
  })

  it('works for the last day of month', () => {
    expect(getDateForLastDayOfMonth('2021-12-31')).toMatchInlineSnapshot(
      `"2021-12-31"`,
    )
  })

  it('works for the middle of month', () => {
    expect(getDateForLastDayOfMonth('2021-06-12')).toMatchInlineSnapshot(
      `"2021-06-30"`,
    )
  })

  it('throws for invalid date', () => {
    expect(() => {
      getDateForLastDayOfMonth('2023-00-21')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2023-00-21'.]`,
    )
  })
})

describe('getDateForFirstDayOfISOWeek', () => {
  it('works for week 53 of a long year', () => {
    expect(getDateForFirstDayOfISOWeek(2026, 53)).toMatchInlineSnapshot(
      `"2026-12-28"`,
    )
  })

  it('works for week 1 starting on January 4', () => {
    expect(getDateForFirstDayOfISOWeek(2027, 1)).toMatchInlineSnapshot(
      `"2027-01-04"`,
    )
  })

  it('works for week 1 starting in the previous calendar year', () => {
    expect(getDateForFirstDayOfISOWeek(2020, 1)).toMatchInlineSnapshot(
      `"2019-12-30"`,
    )
  })

  it('works for week year 0', () => {
    expect(getDateForFirstDayOfISOWeek(0, 1)).toMatchInlineSnapshot(
      `"0000-01-03"`,
    )
  })

  it('throws for week 53 of a 52-week year', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(2027, 53)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week. Expected a value from 1 to 52. Current value: '53'.]`,
    )
  })

  it('throws for a week beyond 53', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(2026, 54)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week. Expected a value from 1 to 53. Current value: '54'.]`,
    )
  })

  it('throws for week 0', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(2026, 0)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week. Expected a value from 1 to 53. Current value: '0'.]`,
    )
  })

  it('throws for a non-integer week year', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(2026.5, 1)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week year. Expected an integer. Current value: '2026.5'.]`,
    )
  })

  it('throws for a non-integer week', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(2026, 1.5)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week. Expected an integer. Current value: '1.5'.]`,
    )
  })

  it('throws when the resulting Monday is not representable', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(10000, 1)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week year. The first day of the week cannot be represented in the YYYY-MM-DD format. Current value: '10000'.]`,
    )
  })

  it('reports the week-range error before representability', () => {
    expect(() => {
      getDateForFirstDayOfISOWeek(10000, 54)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO week. Expected a value from 1 to 52. Current value: '54'.]`,
    )
  })

  it('round-trips back to the Monday of the week for a date', () => {
    const datesWithMonday = [
      ['2019-12-30', '2019-12-30'],
      ['2021-01-01', '2020-12-28'],
      ['2026-12-28', '2026-12-28'],
      ['2027-01-01', '2026-12-28'],
      ['2027-01-04', '2027-01-04'],
      ['2026-07-15', '2026-07-13'],
      ['2026-01-04', '2025-12-29'],
      ['2020-06-17', '2020-06-15'],
    ] as const

    for (const [date, monday] of datesWithMonday) {
      const result = getDateForFirstDayOfISOWeek(
        getISOWeekYearFromDate(date),
        getISOWeekFromDate(date),
      )

      expect(isSameDate(result, monday)).toBe(true)

      if (isSameDate(date, monday)) {
        expect(isSameDate(result, date)).toBe(true)
      }
    }
  })
})

/**
 * --- Getters ---
 */
describe('getYearFromDate', () => {
  it('works for a valid date (string)', () => {
    expect(getYearFromDate('2035-12-31')).toMatchInlineSnapshot(`2035`)
  })

  it('works for a valid date (SDate)', () => {
    expect(getYearFromDate(sDate('2035-12-31'))).toMatchInlineSnapshot(`2035`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getYearFromDate('2035-12-31T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2035-12-31T12:00'.]`,
    )
  })
})

describe('getMonthFromDate', () => {
  it('works for a valid date (string) (adjusted to match Date as 0-based index)', () => {
    expect(getMonthFromDate('2035-12-31')).toMatchInlineSnapshot(`11`)
  })

  it('works for a valid date (SDate) (adjusted to match Date as 0-based index)', () => {
    expect(getMonthFromDate(sDate('2035-12-31'))).toMatchInlineSnapshot(`11`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getMonthFromDate('2035-12-34')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2035-12-34'.]`,
    )
  })
})

describe('getDateFromDate', () => {
  it('works for a valid date (string)', () => {
    expect(getDateFromDate('2035-12-31')).toMatchInlineSnapshot(`31`)
  })

  it('works for a valid date (SDate)', () => {
    expect(getDateFromDate(sDate('2035-12-31'))).toMatchInlineSnapshot(`31`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getDateFromDate('2035-12-34')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2035-12-34'.]`,
    )
  })
})

describe('getWeekdayFromDate', () => {
  it('works for a valid date (string)', () => {
    expect(getWeekdayFromDate('2035-12-30')).toBe(Weekday.Sun)
  })

  it('works for a valid date (SDate)', () => {
    expect(getWeekdayFromDate(sDate('2035-12-30'))).toBe(Weekday.Sun)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getWeekdayFromDate('11:00:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '11:00:00'.]`,
    )
  })
})

describe('getISOWeekFromDate', () => {
  it('works for a Monday in week 1 of the next week year', () => {
    expect(getISOWeekFromDate('2019-12-30')).toMatchInlineSnapshot(`1`)
  })

  it('works for a date in week 53 of the previous week year', () => {
    expect(getISOWeekFromDate('2021-01-01')).toMatchInlineSnapshot(`53`)
  })

  it('works for the first day of week 53', () => {
    expect(getISOWeekFromDate('2026-12-28')).toMatchInlineSnapshot(`53`)
  })

  it('works for a January date in week 53 of the previous week year', () => {
    expect(getISOWeekFromDate('2027-01-01')).toMatchInlineSnapshot(`53`)
  })

  it('works for the first Monday after a week 53', () => {
    expect(getISOWeekFromDate('2027-01-04')).toMatchInlineSnapshot(`1`)
  })

  it('works for a mid-year date', () => {
    expect(getISOWeekFromDate('2026-07-15')).toMatchInlineSnapshot(`29`)
  })

  it('works for a valid date (SDate)', () => {
    expect(getISOWeekFromDate(sDate('2026-07-15'))).toMatchInlineSnapshot(`29`)
  })

  it('works for the first day of year 0', () => {
    expect(getISOWeekFromDate('0000-01-01')).toMatchInlineSnapshot(`52`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getISOWeekFromDate('2023-11-31')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2023-11-31'.]`,
    )
  })
})

describe('getISOWeekYearFromDate', () => {
  it('works for a Monday in week 1 of the next week year', () => {
    expect(getISOWeekYearFromDate('2019-12-30')).toMatchInlineSnapshot(`2020`)
  })

  it('works for a date in week 53 of the previous week year', () => {
    expect(getISOWeekYearFromDate('2021-01-01')).toMatchInlineSnapshot(`2020`)
  })

  it('works for the first day of week 53', () => {
    expect(getISOWeekYearFromDate('2026-12-28')).toMatchInlineSnapshot(`2026`)
  })

  it('works for a January date in week 53 of the previous week year', () => {
    expect(getISOWeekYearFromDate('2027-01-01')).toMatchInlineSnapshot(`2026`)
  })

  it('works for the first Monday after a week 53', () => {
    expect(getISOWeekYearFromDate('2027-01-04')).toMatchInlineSnapshot(`2027`)
  })

  it('works for a mid-year date', () => {
    expect(getISOWeekYearFromDate('2026-07-15')).toMatchInlineSnapshot(`2026`)
  })

  it('works for a valid date (SDate)', () => {
    expect(getISOWeekYearFromDate(sDate('2026-07-15'))).toMatchInlineSnapshot(
      `2026`,
    )
  })

  it('works for the first day of year 0', () => {
    expect(getISOWeekYearFromDate('0000-01-01')).toMatchInlineSnapshot(`-1`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getISOWeekYearFromDate('2023-11-31')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2023-11-31'.]`,
    )
  })
})

describe('getTimeZonedDateFromDate', () => {
  it('works for a valid date (string)', () => {
    expect(
      getTimeZonedDateFromDate('2035-12-31', TestLocalTimeZone).toLocaleString(
        'en-US',
      ),
    ).toMatchInlineSnapshot(`"12/31/2035, 12:00:00 AM"`)
  })

  it('works for a valid date (SDate)', () => {
    expect(
      getTimeZonedDateFromDate(
        sDate('2035-12-31'),
        TestLocalTimeZone,
      ).toLocaleString('en-US'),
    ).toMatchInlineSnapshot(`"12/31/2035, 12:00:00 AM"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getTimeZonedDateFromDate('11:00:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '11:00:00'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getTimeZonedDateFromDate('2035-12-31', TestLocalTimeZone + '1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'America/Puerto_Rico1']`,
    )
  })
})

describe('getDaysBetweenDates', () => {
  it('works for same day (both SDate)', () => {
    const a = sDate('2045-03-01')

    expect(getDaysBetweenDates(a, a)).toMatchInlineSnapshot(`0`)
  })

  it('works for same date (SDate and string)', () => {
    const a = sDate('2045-03-01')

    expect(getDaysBetweenDates(a, '2045-03-01')).toMatchInlineSnapshot(`0`)
  })

  it('works for date parameter in the future (should be positive)', () => {
    const b = sDate('2045-03-05')

    expect(getDaysBetweenDates('2045-03-01', b)).toMatchInlineSnapshot(`4`)
  })

  it('works for date parameter in the past (should be negative)', () => {
    expect(
      getDaysBetweenDates('2045-03-05', '2045-03-01'),
    ).toMatchInlineSnapshot(`-4`)
  })

  it('throws for invalid date (first date)', () => {
    expect(() => {
      getDaysBetweenDates('2045-03-05T11:00', '2045-03-04')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-05T11:00'.]`,
    )
  })

  it('throws for invalid date (second date)', () => {
    expect(() => {
      getDaysBetweenDates('2045-03-05', '2045-03-0')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-0'.]`,
    )
  })
})

describe('getFullDateString', () => {
  it('works with locale set to ES (SDate)', () => {
    const a = sDate('2021-02-05')
    expect(getFullDateString(a, 'es')).toMatchInlineSnapshot(
      `"viernes, 5 de febrero de 2021"`,
    )
  })

  it('works with locale set to EN (string)', () => {
    expect(getFullDateString('2022-08-05', 'en')).toMatchInlineSnapshot(
      `"Friday, August 5, 2022"`,
    )
  })

  it('throws for invalid date', () => {
    expect(() => {
      getFullDateString('2022-08-05T11:00', 'en')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-08-05T11:00'.]`,
    )
  })

  it('throws for invalid locale', () => {
    expect(() => {
      getFullDateString('2022-08-05', 'en1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: Incorrect locale information provided]`,
    )
  })
})

describe('getShortDateString', () => {
  const onTodayText = (): string => 'Today'

  it('works with locale set to ES (current year) (string)', () => {
    setFakeTimer('2021-04-05')

    expect(
      getShortDateString('2021-02-05', TestLocalTimeZone, 'es', {
        onTodayText,
        includeWeekday: false,
      }),
    ).toMatchInlineSnapshot(`"5 feb"`)
  })

  it('works with locale set to EN (current year) (SDate)', () => {
    setFakeTimer('2022-12-05')

    const a = sDate('2022-08-05')

    expect(
      getShortDateString(a, TestLocalTimeZone, 'en', {
        onTodayText,
        includeWeekday: false,
      }),
    ).toMatchInlineSnapshot(`"Aug 5"`)
  })

  it('works with locale set to ES and include year if not current year (with weekday true)', () => {
    expect(
      getShortDateString('2021-02-05', TestLocalTimeZone, 'es', {
        onTodayText,
        includeWeekday: true,
      }),
    ).toMatchInlineSnapshot(`"vie, 5 feb 21"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      getShortDateString('2022-08-05T', TestLocalTimeZone, 'en', {
        onTodayText,
        includeWeekday: false,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-08-05T'.]`,
    )
  })

  it('throws for invalid locale', () => {
    expect(() => {
      getShortDateString('2022-08-05', TestLocalTimeZone, 'en1', {
        onTodayText,
        includeWeekday: false,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: Incorrect locale information provided]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      getShortDateString('2022-08-05', 'invalid', 'en', {
        onTodayText,
        includeWeekday: false,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'invalid']`,
    )
  })
})

/**
 * --- Operations ---
 */

describe('addDaysToDate', () => {
  it('works for a day one year later', () => {
    setFakeTimer('2022-04-04T00:00')

    const today = getDateToday(TestLocalTimeZone)

    expect(addDaysToDate(today, 365)).toMatchInlineSnapshot(`"2023-04-04"`)
  })

  it('works for the next day', () => {
    expect(addDaysToDate('2021-01-01', 1)).toMatchInlineSnapshot(`"2021-01-02"`)
  })

  it('works for the previous day', () => {
    const date = sDate('2021-01-01')

    expect(addDaysToDate(date, -1)).toMatchInlineSnapshot(`"2020-12-31"`)
  })

  it('works for the no change in day', () => {
    expect(addDaysToDate('2021-01-01', 0)).toMatchInlineSnapshot(`"2021-01-01"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      addDaysToDate('2021-01-0', 1)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-0'.]`,
    )
  })
})

describe('addMonthsToDate', () => {
  it('works for a day one year later', () => {
    setFakeTimer('2022-04-04T00:00')

    const today = getDateToday(TestLocalTimeZone)

    expect(addMonthsToDate(today, 12)).toMatchInlineSnapshot(`"2023-04-04"`)
  })

  it('works for the next month', () => {
    const date = sDate('2021-01-01')

    expect(addMonthsToDate(date, 1)).toMatchInlineSnapshot(`"2021-02-01"`)
  })

  it('works for the previous month', () => {
    expect(addMonthsToDate('2021-01-01', -1)).toMatchInlineSnapshot(
      `"2020-12-01"`,
    )
  })

  it('works for the previous month (with day overflow leap year)', () => {
    expect(addMonthsToDate('2024-02-29', -12)).toMatchInlineSnapshot(
      `"2023-02-28"`,
    )
  })

  it('works for the previous month (with day overflow)', () => {
    expect(addMonthsToDate('2024-03-30', -1)).toMatchInlineSnapshot(
      `"2024-02-29"`,
    )
  })

  it('works for the no change in month', () => {
    expect(addMonthsToDate('2021-01-01', 0)).toMatchInlineSnapshot(
      `"2021-01-01"`,
    )
  })

  it('properly handles 31st day to months with less than 31 days', () => {
    expect(addMonthsToDate('2023-01-31', 1)).toMatchInlineSnapshot(
      `"2023-02-28"`,
    )
    expect(addMonthsToDate('2023-01-31', 3)).toMatchInlineSnapshot(
      `"2023-04-30"`,
    )
    expect(addMonthsToDate('2023-01-31', 5)).toMatchInlineSnapshot(
      `"2023-06-30"`,
    )
  })

  it('properly handles month transitions across year boundaries', () => {
    expect(addMonthsToDate('2023-12-31', 1)).toMatchInlineSnapshot(
      `"2024-01-31"`,
    )
    expect(addMonthsToDate('2023-12-31', 2)).toMatchInlineSnapshot(
      `"2024-02-29"`,
    )
  })

  it('properly handles negative month additions across year boundaries', () => {
    expect(addMonthsToDate('2024-01-31', -1)).toMatchInlineSnapshot(
      `"2023-12-31"`,
    )
    expect(addMonthsToDate('2024-01-31', -2)).toMatchInlineSnapshot(
      `"2023-11-30"`,
    )
  })

  it('handles large month differences', () => {
    expect(addMonthsToDate('2023-01-31', 24)).toMatchInlineSnapshot(
      `"2025-01-31"`,
    )
    expect(addMonthsToDate('2023-01-31', -24)).toMatchInlineSnapshot(
      `"2021-01-31"`,
    )
  })

  it('caps dates beyond 28th to the 28th of the month', () => {
    expect(
      addMonthsToDate('2023-01-29', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-28"`)
    expect(
      addMonthsToDate('2023-01-30', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-28"`)
    expect(
      addMonthsToDate('2023-01-31', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-28"`)
  })

  it('caps dates to 28th even in months with 31 days', () => {
    expect(
      addMonthsToDate('2023-01-31', 2, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-03-28"`)
    expect(
      addMonthsToDate('2023-01-29', 2, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-03-28"`)
  })

  it('preserves dates up to and including the 28th', () => {
    expect(
      addMonthsToDate('2023-01-28', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-28"`)
    expect(
      addMonthsToDate('2023-01-15', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-15"`)
    expect(
      addMonthsToDate('2023-01-01', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-01"`)
  })

  it('works with negative month additions (with capToCommonDate)', () => {
    expect(
      addMonthsToDate('2023-03-31', -1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-28"`)
    expect(
      addMonthsToDate('2023-03-29', -1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2023-02-28"`)
  })

  it('works with leap years (with capToCommonDate)', () => {
    // Even in leap years, it still caps to 28th
    expect(
      addMonthsToDate('2024-01-31', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2024-02-28"`)
    expect(
      addMonthsToDate('2024-01-29', 1, { capToCommonDate: true }),
    ).toMatchInlineSnapshot(`"2024-02-28"`)
  })

  it('throws for invalid date', () => {
    expect(() => {
      addMonthsToDate('2021-01-0', 1)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-0'.]`,
    )
  })
})

describe('addYearsToDate', () => {
  it('works for a day 12 years later (string)', () => {
    expect(addYearsToDate('2022-04-04', 12)).toMatchInlineSnapshot(
      `"2034-04-04"`,
    )
  })

  it('works for the next year (SDate)', () => {
    const date = sDate('2021-01-01')

    expect(addYearsToDate(date, 1)).toMatchInlineSnapshot(`"2022-01-01"`)
  })

  it('works for the previous year', () => {
    expect(addYearsToDate('2021-01-01', -1)).toMatchInlineSnapshot(
      `"2020-01-01"`,
    )
  })

  it('works for the no change in year', () => {
    expect(addYearsToDate('2021-01-01', 0)).toMatchInlineSnapshot(
      `"2021-01-01"`,
    )
  })

  it('throws for invalid date', () => {
    expect(() => {
      addYearsToDate('2021-01-0', 1)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-0'.]`,
    )
  })
})

/**
 * --- Comparisons ---
 */

describe('isSameDate', () => {
  it('works for a is before b', () => {
    const a = sDate('2021-12-31')
    const b = sDate('2022-01-01')

    expect(isSameDate(a, b)).toBe(false)
  })

  it('works for a is after b', () => {
    const b = sDate('2021-12-31')

    expect(isSameDate('2022-01-01', b)).toBe(false)
  })

  it('works for a and b are the same day', () => {
    const a = sDate('2022-01-01')

    expect(isSameDate(a, '2022-01-01')).toBe(true)
  })

  it('throws for invalid first date', () => {
    expect(() => {
      isSameDate('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws for invalid second date', () => {
    expect(() => {
      isSameDate('2021-12-31', '2022-01-01T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-01-01T11:00'.]`,
    )
  })
})

describe('isBeforeDate', () => {
  it('works for a is before b', () => {
    const a = sDate('2021-12-31')
    const b = sDate('2022-01-01')

    expect(isBeforeDate(a, b)).toBe(true)
  })

  it('works for a is after b', () => {
    const b = sDate('2021-12-31')

    expect(isBeforeDate('2022-01-01', b)).toBe(false)
  })

  it('works for a and b are the same day', () => {
    const a = sDate('2022-01-01')

    expect(isBeforeDate(a, '2022-01-01')).toBe(false)
  })

  it('throws for invalid first date', () => {
    expect(() => {
      isBeforeDate('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws for invalid second date', () => {
    expect(() => {
      isBeforeDate('2021-12-31', '2022-01-01T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-01-01T11:00'.]`,
    )
  })
})

describe('isSameDateOrBefore', () => {
  it('works for a is before b', () => {
    const a = sDate('2021-12-31')
    const b = sDate('2022-01-01')

    expect(isSameDateOrBefore(a, b)).toBe(true)
  })

  it('works for a is after b', () => {
    const b = sDate('2021-12-31')

    expect(isSameDateOrBefore('2022-01-01', b)).toBe(false)
  })

  it('works for a and b are the same day', () => {
    const a = sDate('2022-01-01')

    expect(isSameDateOrBefore(a, '2022-01-01')).toBe(true)
  })

  it('throws for invalid first date', () => {
    expect(() => {
      isSameDateOrBefore('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws for invalid second date', () => {
    expect(() => {
      isSameDateOrBefore('2021-12-31', '2022-01-01T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-01-01T11:00'.]`,
    )
  })
})

describe('isAfterDate', () => {
  it('works for a is before b', () => {
    const a = sDate('2021-12-31')
    const b = sDate('2022-01-01')

    expect(isAfterDate(a, b)).toBe(false)
  })

  it('works for a is after b', () => {
    const b = sDate('2021-12-31')

    expect(isAfterDate('2022-01-01', b)).toBe(true)
  })

  it('works for a and b are the same day', () => {
    const a = sDate('2022-01-01')

    expect(isAfterDate(a, '2022-01-01')).toBe(false)
  })

  it('throws for invalid first date', () => {
    expect(() => {
      isAfterDate('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws for invalid second date', () => {
    expect(() => {
      isAfterDate('2021-12-31', '2022-01-01T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-01-01T11:00'.]`,
    )
  })
})

describe('isSameDateOrAfter', () => {
  it('works for a is before b', () => {
    const a = sDate('2021-12-31')
    const b = sDate('2022-01-01')

    expect(isSameDateOrAfter(a, b)).toBe(false)
  })

  it('works for a is after b', () => {
    const b = sDate('2021-12-31')

    expect(isSameDateOrAfter('2022-01-01', b)).toBe(true)
  })

  it('works for a and b are the same day', () => {
    const a = sDate('2022-01-01')

    expect(isSameDateOrAfter(a, '2022-01-01')).toBe(true)
  })

  it('throws for invalid first date', () => {
    expect(() => {
      isSameDateOrAfter('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws for invalid second date', () => {
    expect(() => {
      isSameDateOrAfter('2021-12-31', '2022-01-01T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-01-01T11:00'.]`,
    )
  })
})

describe('isDateToday', () => {
  it('works for date on same day', () => {
    setFakeTimer('2021-01-01T00:00')

    const date = sDate('2021-01-01')

    expect(isDateToday(date, TestLocalTimeZone)).toBe(true)
  })

  it('works for date on different day', () => {
    setFakeTimer('2021-01-01T00:00')

    expect(isDateToday('2021-01-02', TestLocalTimeZone)).toBe(false)
  })

  it('throws for invalid date', () => {
    expect(() => {
      isDateToday('2021-01-01T11:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-01T11:00'.]`,
    )
  })
})

describe('areDatesInSameMonth', () => {
  it('works for years that are the same instance', () => {
    const a = sDate('2045-03-01')

    expect(areDatesInSameMonth(a, a)).toBe(true)
  })

  it('works for months that are the same but different instances', () => {
    const b = sDate('2045-03-12')

    expect(areDatesInSameMonth('2045-03-01', b)).toBe(true)
  })

  it('works for dates in the same month number, but different years', () => {
    const a = sDate('2045-03-01')

    expect(areDatesInSameMonth(a, '2022-03-01')).toBe(false)
  })

  it('works for months that are different (all components)', () => {
    expect(areDatesInSameMonth('2001-12-01', '2045-03-02')).toBe(false)
  })

  it('throws for invalid date (first date)', () => {
    expect(() => {
      areDatesInSameMonth('2045-03-05T11:00', '2045-03-04')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-05T11:00'.]`,
    )
  })

  it('throws for invalid date (second date)', () => {
    expect(() => {
      areDatesInSameMonth('2045-03-05', '2045-03-0')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-0'.]`,
    )
  })
})

describe('isDateInCurrentMonth', () => {
  it('works for a day at midnight of last day of the month from today', () => {
    setFakeTimer('2022-01-31T23:59:59')

    const today = getDateToday(TestLocalTimeZone)

    expect(isDateInCurrentMonth(today, TestLocalTimeZone)).toBe(true)
  })

  it('works for date on same day', () => {
    setFakeTimer('2021-01-01T00:00')

    const date = sDate('2021-01-01')

    expect(isDateInCurrentMonth(date, TestLocalTimeZone)).toBe(true)
  })

  it('works for date on different month but same year', () => {
    setFakeTimer('2021-04-01T00:00')

    expect(isDateInCurrentMonth('2021-01-02', TestLocalTimeZone)).toBe(false)
  })

  it('works for different date on same month and year', () => {
    setFakeTimer('2020-01-01T00:00')

    expect(isDateInCurrentMonth('2020-01-31', TestLocalTimeZone)).toBe(true)
  })

  it('works for different years but same month and date', () => {
    setFakeTimer('2020-01-31T00:00')

    const date = sDate('2021-01-31')

    expect(isDateInCurrentMonth(date, TestLocalTimeZone)).toBe(false)
  })

  it('throws for invalid date', () => {
    expect(() => {
      isDateInCurrentMonth('2021-01-01T11:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-01T11:00'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      isDateInCurrentMonth('2021-01-01', TestLocalTimeZone + '1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'America/Puerto_Rico1']`,
    )
  })
})

describe('areDatesInSameYear', () => {
  it('works for years that are the same instance', () => {
    const a = sDate('2045-03-01')

    expect(areDatesInSameYear(a, a)).toBe(true)
  })

  it('works for years that are the same but different instances', () => {
    const b = sDate('2045-03-01')

    expect(areDatesInSameYear('2045-03-01', b)).toBe(true)
  })

  it('works for years that are different (year)', () => {
    const a = sDate('2045-03-01')

    expect(areDatesInSameYear(a, '2022-03-01')).toBe(false)
  })

  it('works for years that are different (all components)', () => {
    expect(areDatesInSameYear('2001-12-01', '2045-03-02')).toBe(false)
  })

  it('throws for invalid date (first date)', () => {
    expect(() => {
      areDatesInSameYear('2045-03-05T11:00', '2045-03-04')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-05T11:00'.]`,
    )
  })

  it('throws for invalid date (second date)', () => {
    expect(() => {
      areDatesInSameYear('2045-03-05', '2045-03-0')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-0'.]`,
    )
  })
})

describe('isDateInCurrentYear', () => {
  it('works for a day at midnight from today', () => {
    setFakeTimer('2022-04-04T00:00')

    const today = getDateToday(TestLocalTimeZone)

    expect(isDateInCurrentYear(today, TestLocalTimeZone)).toBe(true)
  })

  it('works whe one minute to the current year', () => {
    setFakeTimer('2022-12-31T23:59')

    expect(isDateInCurrentYear('2023-01-01', TestLocalTimeZone)).toBe(false)
  })

  it('works when exactly at the current year', () => {
    setFakeTimer('2023-01-01T00:00')

    expect(isDateInCurrentYear('2023-01-01', TestLocalTimeZone)).toBe(true)
  })

  it('works for date on same day', () => {
    setFakeTimer('2021-01-01T00:00')

    expect(isDateInCurrentYear('2021-01-01', TestLocalTimeZone)).toBe(true)
  })

  it('works for date on different day but same year', () => {
    setFakeTimer('2021-01-01T00:00')

    expect(isDateInCurrentYear('2021-01-02', TestLocalTimeZone)).toBe(true)
  })

  it('works for different years', () => {
    setFakeTimer('2021-01-01T00:00')

    const date = addDaysToDate(sDate('2021-12-31'), 1)

    expect(isDateInCurrentYear(date, TestLocalTimeZone)).toBe(false)
  })

  it('throws for invalid date', () => {
    expect(() => {
      isDateInCurrentYear('2021-01-01T11:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-01T11:00'.]`,
    )
  })

  it('throws for invalid time zone', () => {
    expect(() => {
      isDateInCurrentYear('2021-01-01', TestLocalTimeZone + '1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'America/Puerto_Rico1']`,
    )
  })
})
