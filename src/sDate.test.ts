import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TestLocalTimeZone } from './__test__/constants'
import { setFakeTimer } from './__test__/setFakeTimer'
import { Weekday } from './constants'
import {
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  areDatesInSameMonth,
  areDatesInSameYear,
  getDateForFirstDayOfMonth,
  getDateForLastDayOfMonth,
  getDateFromDate,
  getDateToday,
  getDaysBetweenDates,
  getFullDateString,
  getMonthFromDate,
  getNextDateByWeekday,
  getPreviousDateByWeekday,
  getShortDateString,
  getTimeZonedDateFromDate,
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
} from './sDate'

beforeEach(() => {
  vi.useRealTimers()
})

/**
 * --- Factory ---
 */
describe('sDate', () => {
  it('works for valid value', () => {
    expect(sDate('2022-03-02')).toMatchInlineSnapshot(`"2022-03-02"`)
  })

  it('throw for invalid value', () => {
    expect(() => {
      sDate('')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: ''.]`,
    )
  })

  it('throws error for invalid length data', () => {
    expect(() => {
      sDate('20231203')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '20231203'.]`,
    )
  })

  it('throws error for invalid characters', () => {
    expect(() => {
      sDate('2023-s2-03')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-s2-03'.]`,
    )
  })

  it('throws error for date that does not exist', () => {
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
  it('returns the date for the current date', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const today = getDateToday(TestLocalTimeZone)

    expect(JSON.stringify(today)).toMatchInlineSnapshot(`""2022-04-04""`)
  })

  it('returns the date for the current date', () => {
    const date = sDate('2035-12-31')
    expect(JSON.stringify(date)).toMatchInlineSnapshot(`""2035-12-31""`)
  })
})

/**
 * --- Factory helpers ---
 */

describe('getDateToday', () => {
  it('works for a day at midnight', () => {
    setFakeTimer('2022-04-04T00:00')

    expect(getDateToday(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-04"`,
    )
  })

  it('works for a day a second before midnight', () => {
    setFakeTimer('2022-04-03T23:59:59')

    expect(getDateToday(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-03"`,
    )
  })

  it('works for a day in the middle of the day', () => {
    setFakeTimer('2022-04-04T12:59:59')

    expect(getDateToday(TestLocalTimeZone)).toMatchInlineSnapshot(
      `"2022-04-04"`,
    )
  })

  it('throws error for invalid timezone', () => {
    expect(() => {
      getDateToday('invalid')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'invalid']`,
    )
  })
})

describe('getNextDateByWeekday', () => {
  it('works on same weekday (returns next)', () => {
    const date = sDate('2023-03-18')
    const result = getNextDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-25"`)
  })

  it('works on first weekday by index', () => {
    const date = sDate('2023-03-18')
    const result = getNextDateByWeekday(date, Weekday.Sun)

    expect(result).toMatchInlineSnapshot(`"2023-03-19"`)
  })

  it('works on last weekday by index', () => {
    const date = sDate('2023-03-19')
    const result = getNextDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-25"`)
  })

  it('works on weekdays that require wrap around of weekdays (Tue -> Mon)', () => {
    const date = sDate('2023-03-21')
    const result = getNextDateByWeekday(date, Weekday.Mon)

    expect(result).toMatchInlineSnapshot(`"2023-03-27"`)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getNextDateByWeekday('2023-3-21', Weekday.Sun)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-3-21'.]`,
    )
  })

  it('throws error for invalid weekday', () => {
    expect(() => {
      getNextDateByWeekday('2023-03-21', Weekday.Sun | Weekday.Thu)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday '17'. Expected a single weekday.]`,
    )
  })
})

describe('getPreviousDateByWeekday', () => {
  it('works on same weekday (returns previous)', () => {
    const date = sDate('2023-03-18')
    const result = getPreviousDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-11"`)
  })

  it('works on first weekday by index', () => {
    const result = getPreviousDateByWeekday('2023-03-18', Weekday.Sun)

    expect(result).toMatchInlineSnapshot(`"2023-03-12"`)
  })

  it('works on last weekday by index', () => {
    const result = getPreviousDateByWeekday('2023-03-19', Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-18"`)
  })

  it('works on weekdays that require wrap around of weekdays (Tue -> Sat)', () => {
    const date = sDate('2023-03-21')
    const result = getPreviousDateByWeekday(date, Weekday.Sat)

    expect(result).toMatchInlineSnapshot(`"2023-03-18"`)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getPreviousDateByWeekday('2023-3-21', Weekday.Sun)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-3-21'.]`,
    )
  })

  it('throws error for invalid weekday', () => {
    expect(() => {
      getPreviousDateByWeekday('2023-03-21', 'asd' as unknown as Weekday)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday 'asd'. Expected a single weekday.]`,
    )
  })
})

describe('getDateForFirstDayOfMonth', () => {
  it('works for first day of year', () => {
    setFakeTimer('2022-01-01T00:05')

    const today = getDateToday(TestLocalTimeZone)

    expect(getDateForFirstDayOfMonth(today)).toMatchInlineSnapshot(
      `"2022-01-01"`,
    )
  })

  it('works for feb with 28 days', () => {
    expect(getDateForFirstDayOfMonth('2021-02-28')).toMatchInlineSnapshot(
      `"2021-02-01"`,
    )
  })

  it('works for feb with 29 days', () => {
    expect(getDateForFirstDayOfMonth('2020-02-29')).toMatchInlineSnapshot(
      `"2020-02-01"`,
    )
  })

  it('works for last day of month', () => {
    expect(getDateForFirstDayOfMonth('2021-12-31')).toMatchInlineSnapshot(
      `"2021-12-01"`,
    )
  })

  it('works for middle of month', () => {
    expect(getDateForFirstDayOfMonth('2021-06-12')).toMatchInlineSnapshot(
      `"2021-06-01"`,
    )
  })

  it('works for first day of month', () => {
    expect(getDateForFirstDayOfMonth('2021-06-01')).toMatchInlineSnapshot(
      `"2021-06-01"`,
    )
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getDateForFirstDayOfMonth('2023-3-21')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2023-3-21'.]`,
    )
  })
})

describe('getDateForLastDayOfMonth', () => {
  it('works for first day of year', () => {
    setFakeTimer('2022-01-01T00:05')

    const today = getDateToday(TestLocalTimeZone)

    expect(getDateForLastDayOfMonth(today)).toMatchInlineSnapshot(
      `"2022-01-31"`,
    )
  })

  it('works for feb with 28 days', () => {
    const date = sDate('2021-02-01')

    expect(getDateForLastDayOfMonth(date)).toMatchInlineSnapshot(`"2021-02-28"`)
  })

  it('works for feb with 29 days', () => {
    expect(getDateForLastDayOfMonth('2020-02-03')).toMatchInlineSnapshot(
      `"2020-02-29"`,
    )
  })

  it('works for last day of month', () => {
    expect(getDateForLastDayOfMonth('2021-12-31')).toMatchInlineSnapshot(
      `"2021-12-31"`,
    )
  })

  it('works for middle of month', () => {
    expect(getDateForLastDayOfMonth('2021-06-12')).toMatchInlineSnapshot(
      `"2021-06-30"`,
    )
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getDateForLastDayOfMonth('2023-00-21')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2023-00-21'.]`,
    )
  })
})

/**
 * --- Getters ---
 */
describe('getYearFromDate', () => {
  it('returns the year for the current date (today)', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const today = getDateToday(TestLocalTimeZone)

    expect(getYearFromDate(today)).toMatchInlineSnapshot(`2022`)
  })

  it('returns the year for the current date', () => {
    expect(getYearFromDate('2035-12-31')).toMatchInlineSnapshot(`2035`)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getYearFromDate('2035-12-31T12:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2035-12-31T12:00'.]`,
    )
  })
})

describe('getMonthFromDate', () => {
  it('returns the month for the current date (adjusted to match Date as 0-based index)', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const today = getDateToday(TestLocalTimeZone)

    expect(getMonthFromDate(today)).toMatchInlineSnapshot(`3`)
  })

  it('returns the month for the current date (adjusted to match Date as 0-based index)', () => {
    expect(getMonthFromDate('2035-12-31')).toMatchInlineSnapshot(`11`)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getMonthFromDate('2035-12-34')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2035-12-34'.]`,
    )
  })
})

describe('getDateFromDate', () => {
  it('returns the date for the current date', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const today = getDateToday(TestLocalTimeZone)

    expect(getDateFromDate(today)).toMatchInlineSnapshot(`4`)
  })

  it('returns the date for the current date', () => {
    expect(getDateFromDate('2035-12-31')).toMatchInlineSnapshot(`31`)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getDateFromDate('2035-12-34')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid ISO date value. Current value: '2035-12-34'.]`,
    )
  })
})

describe('getWeekdayFromDate', () => {
  it('returns the weekday for the current date', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const today = getDateToday(TestLocalTimeZone)

    expect(getWeekdayFromDate(today)).toBe(Weekday.Mon)
  })

  it('returns the weekday for the current date', () => {
    expect(getWeekdayFromDate('2035-12-30')).toBe(Weekday.Sun)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getWeekdayFromDate('11:00:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '11:00:00'.]`,
    )
  })
})

describe('getTimeZonedDateFromDate', () => {
  it('returns the date for the current date', () => {
    setFakeTimer('2022-04-04T12:59:59')
    const today = getDateToday(TestLocalTimeZone)

    expect(
      getTimeZonedDateFromDate(today, TestLocalTimeZone).toLocaleString(
        'en-US',
      ),
    ).toMatchInlineSnapshot(`"4/4/2022, 12:00:00 AM"`)
  })

  it('returns the date for the current date', () => {
    expect(
      getTimeZonedDateFromDate('2035-12-31', TestLocalTimeZone).toLocaleString(
        'en-US',
      ),
    ).toMatchInlineSnapshot(`"12/31/2035, 12:00:00 AM"`)
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getTimeZonedDateFromDate('11:00:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '11:00:00'.]`,
    )
  })

  it('throws error for invalid timezone', () => {
    expect(() => {
      getTimeZonedDateFromDate('2035-12-31', TestLocalTimeZone + '1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'America/Puerto_Rico1']`,
    )
  })
})

describe('getDaysBetweenDates', () => {
  it('works for same day', () => {
    const a = sDate('2045-03-01')

    expect(getDaysBetweenDates(a, a)).toMatchInlineSnapshot(`0`)
  })

  it('works for same date but different instances', () => {
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

  it('works for year that start from same instance but are different', () => {
    const a = sDate('2045-03-01')

    expect(getDaysBetweenDates(a, addDaysToDate(a, 1))).toMatchInlineSnapshot(
      `1`,
    )
  })

  it('throws error for invalid date (first date)', () => {
    expect(() => {
      getDaysBetweenDates('2045-03-05T11:00', '2045-03-04')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-05T11:00'.]`,
    )
  })

  it('throws error for invalid date (second date)', () => {
    expect(() => {
      getDaysBetweenDates('2045-03-05', '2045-03-0')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-0'.]`,
    )
  })
})

describe('getFullDateString', () => {
  it('works with locale set to ES', () => {
    const a = sDate('2021-02-05')
    expect(getFullDateString(a, 'es')).toMatchInlineSnapshot(
      `"viernes, 5 de febrero de 2021"`,
    )
  })

  it('works with locale set to EN', () => {
    expect(getFullDateString('2022-08-05', 'en')).toMatchInlineSnapshot(
      `"Friday, August 5, 2022"`,
    )
  })

  it('throws error for invalid date', () => {
    expect(() => {
      getFullDateString('2022-08-05T11:00', 'en')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-08-05T11:00'.]`,
    )
  })

  it('throws error for invalid locale', () => {
    expect(() => {
      getFullDateString('2022-08-05', 'en1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: Incorrect locale information provided]`,
    )
  })
})

describe('getShortDateString', () => {
  const onTodayText = (): string => 'Today'

  it('works with locale set to ES (current year)', () => {
    setFakeTimer('2021-04-05')

    expect(
      getShortDateString('2021-02-05', TestLocalTimeZone, 'es', {
        onTodayText,
        includeWeekday: false,
      }),
    ).toMatchInlineSnapshot(`"5 feb"`)
  })

  it('works with locale set to EN (current year)', () => {
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

  it('throws error for invalid date', () => {
    expect(() => {
      getShortDateString('2022-08-05T', TestLocalTimeZone, 'en', {
        onTodayText,
        includeWeekday: false,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-08-05T'.]`,
    )
  })

  it('throws error for invalid locale', () => {
    expect(() => {
      getShortDateString('2022-08-05', TestLocalTimeZone, 'en1', {
        onTodayText,
        includeWeekday: false,
      })
    }).toThrowErrorMatchingInlineSnapshot(
      `[RangeError: Incorrect locale information provided]`,
    )
  })

  it('throws error for invalid timezone', () => {
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
    expect(addDaysToDate('2021-01-01', -1)).toMatchInlineSnapshot(
      `"2020-12-31"`,
    )
  })

  it('works for the no change in day', () => {
    expect(addDaysToDate('2021-01-01', 0)).toMatchInlineSnapshot(`"2021-01-01"`)
  })

  it('throws error for invalid date', () => {
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

  it('works for the no change in month', () => {
    expect(addMonthsToDate('2021-01-01', 0)).toMatchInlineSnapshot(
      `"2021-01-01"`,
    )
  })

  it('throws error for invalid date', () => {
    expect(() => {
      addMonthsToDate('2021-01-0', 1)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-0'.]`,
    )
  })
})

describe('addYearsToDate', () => {
  it('works for a day 12 years later', () => {
    setFakeTimer('2022-04-04T00:00')

    const today = getDateToday(TestLocalTimeZone)

    expect(addYearsToDate(today, 12)).toMatchInlineSnapshot(`"2034-04-04"`)
  })

  it('works for the next year', () => {
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

  it('throws error for invalid date', () => {
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

  it('throws error for invalid first date', () => {
    expect(() => {
      isSameDate('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws error for invalid second date', () => {
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

  it('throws error for invalid first date', () => {
    expect(() => {
      isBeforeDate('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws error for invalid second date', () => {
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

  it('throws error for invalid first date', () => {
    expect(() => {
      isSameDateOrBefore('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws error for invalid second date', () => {
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

  it('throws error for invalid first date', () => {
    expect(() => {
      isAfterDate('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws error for invalid second date', () => {
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

  it('throws error for invalid first date', () => {
    expect(() => {
      isSameDateOrAfter('2021-12-31T11:00', '2022-01-01')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-12-31T11:00'.]`,
    )
  })

  it('throws error for invalid second date', () => {
    expect(() => {
      isSameDateOrAfter('2021-12-31', '2022-01-01T11:00')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2022-01-01T11:00'.]`,
    )
  })
})

describe('isDateToday', () => {
  it('works for a day at midnight from today', () => {
    setFakeTimer('2022-04-04T00:00')

    const today = getDateToday(TestLocalTimeZone)

    expect(isDateToday(today, TestLocalTimeZone)).toBe(true)
  })

  it('works for date on same day', () => {
    setFakeTimer('2021-01-01T00:00')

    const date = sDate('2021-01-01')

    expect(isDateToday(date, TestLocalTimeZone)).toBe(true)
  })

  it('works for date on different day', () => {
    setFakeTimer('2021-01-01T00:00')

    expect(isDateToday('2021-01-02', TestLocalTimeZone)).toBe(false)
  })

  it('throws error for invalid date', () => {
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

  it('returns false for months that are in different years', () => {
    const a = sDate('2045-03-01')

    expect(areDatesInSameMonth(a, '2022-03-01')).toBe(false)
  })

  it('works for months that are different (all components)', () => {
    expect(areDatesInSameMonth('2001-12-01', '2045-03-02')).toBe(false)
  })

  it('throws error for invalid date (first date)', () => {
    expect(() => {
      areDatesInSameMonth('2045-03-05T11:00', '2045-03-04')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-05T11:00'.]`,
    )
  })

  it('throws error for invalid date (second date)', () => {
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

  it('throws error for invalid date', () => {
    expect(() => {
      isDateInCurrentMonth('2021-01-01T11:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-01T11:00'.]`,
    )
  })

  it('throws error for invalid timezone', () => {
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

  it('throws error for invalid date (first date)', () => {
    expect(() => {
      areDatesInSameYear('2045-03-05T11:00', '2045-03-04')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2045-03-05T11:00'.]`,
    )
  })

  it('throws error for invalid date (second date)', () => {
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

  it('returns false if one minute to the current year', () => {
    setFakeTimer('2022-12-31T23:59')

    expect(isDateInCurrentYear('2023-01-01', TestLocalTimeZone)).toBe(false)
  })

  it('returns true if exactly at the current year', () => {
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

  it('throws error for invalid date', () => {
    expect(() => {
      isDateInCurrentYear('2021-01-01T11:00', TestLocalTimeZone)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2021-01-01T11:00'.]`,
    )
  })

  it('throws error for invalid timezone', () => {
    expect(() => {
      isDateInCurrentYear('2021-01-01', TestLocalTimeZone + '1')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid time zone. Time zone: 'America/Puerto_Rico1']`,
    )
  })
})
