import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Weekday } from './constants'
import { sDate } from './sDate'
import {
  addWeekdayToWeekdays,
  doesWeekdaysHaveOverlapWithWeekdays,
  doesWeekdaysIncludeWeekday,
  filterWeekdaysForDates,
  getWeekdaysFromWeekdayFlags,
  getWeekdaysWithAllIncluded,
  getWeekdaysWithNoneIncluded,
  sWeekdays,
  shiftWeekdaysForward,
} from './sWeekdays'

beforeEach(() => {
  vi.useRealTimers()
})

/**
 * --- Factory ---
 */
describe('sWeekdays', () => {
  it('works for valid value', () => {
    expect(sWeekdays('S-----S')).toMatchInlineSnapshot(`"S-----S"`)
  })

  it('throws for invalid value', () => {
    expect(() => {
      sWeekdays('')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: ''.]`,
    )
  })

  it('throws for invalid length data', () => {
    expect(() => {
      sWeekdays('------')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: '------'.]`,
    )
  })

  it('throws for invalid weekday values', () => {
    expect(() => {
      sWeekdays('LM--TFS')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: 'LM--TFS'.]`,
    )
  })
})

/**
 * --- Serialization ---
 */

describe('JSON.stringify', () => {
  it('returns weekdays for all active', () => {
    const all = getWeekdaysWithAllIncluded()

    expect(JSON.stringify(all)).toMatchInlineSnapshot(`""SMTWTFS""`)
  })

  it('returns weekdays for none active', () => {
    const all = getWeekdaysWithNoneIncluded()

    expect(JSON.stringify(all)).toMatchInlineSnapshot(`""-------""`)
  })

  it('returns weekdays for none active', () => {
    const some = sWeekdays('S-----S')

    expect(JSON.stringify(some)).toMatchInlineSnapshot(`""S-----S""`)
  })
})

/**
 * --- Factory helpers ---
 */

describe('getWeekdaysFromWeekdayFlags', () => {
  it('works with a single day (first)', () => {
    expect(getWeekdaysFromWeekdayFlags(Weekday.Sun)).toMatchInlineSnapshot(
      `"S------"`,
    )
  })

  it('works with a single day (last)', () => {
    expect(getWeekdaysFromWeekdayFlags(Weekday.Sat)).toMatchInlineSnapshot(
      `"------S"`,
    )
  })

  it('works with a single day (other)', () => {
    expect(getWeekdaysFromWeekdayFlags(Weekday.Wed)).toMatchInlineSnapshot(
      `"---W---"`,
    )
  })

  it('works with multiple consecutive days (enum)', () => {
    expect(
      getWeekdaysFromWeekdayFlags(
        Weekday.Mon | Weekday.Tue | Weekday.Wed | Weekday.Thu | Weekday.Fri,
      ),
    ).toMatchInlineSnapshot(`"-MTWTF-"`)
  })

  it('works with multiple non-consecutive days', () => {
    expect(
      getWeekdaysFromWeekdayFlags(Weekday.Sun | Weekday.Tue | Weekday.Fri),
    ).toMatchInlineSnapshot(`"S-T--F-"`)
  })
})

describe('getWeekdaysWithAllIncluded', () => {
  it('works for all', () => {
    expect(getWeekdaysWithAllIncluded()).toMatchInlineSnapshot(`"SMTWTFS"`)
  })
})

describe('getWeekdaysWithNoneIncluded', () => {
  it('works for none', () => {
    expect(getWeekdaysWithNoneIncluded()).toMatchInlineSnapshot(`"-------"`)
  })
})

/**
 * --- Operations ---
 */

describe('shiftWeekdaysForward', () => {
  it('works with a single day (first)', () => {
    const weekdays = getWeekdaysFromWeekdayFlags(Weekday.Sun)

    expect(shiftWeekdaysForward(weekdays)).toMatchInlineSnapshot(`"-M-----"`)
  })

  it('works with a single day (last)', () => {
    expect(shiftWeekdaysForward('------S')).toMatchInlineSnapshot(`"S------"`)
  })

  it('works with a single day (other)', () => {
    const weekdays = getWeekdaysFromWeekdayFlags(Weekday.Wed)

    expect(shiftWeekdaysForward(weekdays)).toMatchInlineSnapshot(`"----T--"`)
  })

  it('works with multiple consecutive days', () => {
    const weekdays = getWeekdaysFromWeekdayFlags(
      Weekday.Mon | Weekday.Tue | Weekday.Wed | Weekday.Thu | Weekday.Fri,
    )

    expect(shiftWeekdaysForward(weekdays)).toMatchInlineSnapshot(`"--TWTFS"`)
  })

  it('works with multiple non-consecutive days', () => {
    expect(shiftWeekdaysForward('S-T--F-')).toMatchInlineSnapshot(`"-M-W--S"`)
  })

  it('throws for invalid weekdays', () => {
    expect(() => {
      shiftWeekdaysForward('SMTWTFx')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: 'SMTWTFx'.]`,
    )
  })
})

describe('filterWeekdaysForDates', () => {
  it('works for same day', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysWithAllIncluded(),
        sDate('2020-03-05'),
        sDate('2020-03-05'),
      ),
    ).toMatchInlineSnapshot(`"----T--"`)
  })

  it('works for full week when all days are in the date range', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysWithAllIncluded(),
        sDate('2020-03-05'),
        '2020-03-30',
      ),
    ).toMatchInlineSnapshot(`"SMTWTFS"`)
  })

  it('works for full week when only some days are included', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysFromWeekdayFlags(Weekday.Fri | Weekday.Tue),
        '2020-03-05',
        sDate('2020-03-30'),
      ),
    ).toMatchInlineSnapshot(`"--T--F-"`)
  })

  it('works when no weekdays are included', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysFromWeekdayFlags(Weekday.Sun | Weekday.Tue),
        '2020-03-05',
        '2020-03-06',
      ),
    ).toMatchInlineSnapshot(`"-------"`)
  })

  it('works when a single day is included', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysFromWeekdayFlags(Weekday.Sun | Weekday.Tue),
        '2020-03-05',
        '2020-03-08',
      ),
    ).toMatchInlineSnapshot(`"S------"`)
  })

  it('works when multiple days are included', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysWithAllIncluded(),
        '2020-03-05',
        '2020-03-07',
      ),
    ).toMatchInlineSnapshot(`"----TFS"`)
  })

  it('works when all original days are already included (range longer than a week)', () => {
    expect(
      filterWeekdaysForDates(
        getWeekdaysFromWeekdayFlags(Weekday.Thu | Weekday.Fri | Weekday.Sat),
        '2020-03-05',
        sDate('2020-04-07'),
      ),
    ).toMatchInlineSnapshot(`"----TFS"`)
  })

  it('throws if toDate is before fromDate', () => {
    expect(() => {
      filterWeekdaysForDates(
        getWeekdaysWithAllIncluded(),
        '2020-03-05',
        '2020-03-03',
      )
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: The from date must be before the to date.]`,
    )
  })

  it('throws for invalid weekdays', () => {
    expect(() => {
      filterWeekdaysForDates('SMTWTFx', '2020-03-05', '2020-03-07')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: 'SMTWTFx'.]`,
    )
  })

  it('throws for invalid fromDate', () => {
    expect(() => {
      filterWeekdaysForDates('SMTWTFS', '2020-03-05x', '2020-03-07')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2020-03-05x'.]`,
    )
  })

  it('throws for invalid toDate', () => {
    expect(() => {
      filterWeekdaysForDates('-------', '2020-03-05', '2020-03-07x')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid date format. Expected format: YYYY-MM-DD. Current value: '2020-03-07x'.]`,
    )
  })
})

describe('addWeekdayToWeekdays', () => {
  it('works when adding a day from none', () => {
    const none = getWeekdaysWithNoneIncluded()

    expect(addWeekdayToWeekdays(none, Weekday.Sun)).toMatchInlineSnapshot(
      `"S------"`,
    )
  })

  it('works when adding a day to all (should do nothing)', () => {
    expect(addWeekdayToWeekdays('SMTWTFS', Weekday.Tue)).toMatchInlineSnapshot(
      `"SMTWTFS"`,
    )
  })

  it('works when adding a day', () => {
    expect(addWeekdayToWeekdays('---W---', Weekday.Fri)).toMatchInlineSnapshot(
      `"---W-F-"`,
    )
  })

  it('works when adding a single day that exists already', () => {
    expect(addWeekdayToWeekdays('----T--', Weekday.Thu)).toMatchInlineSnapshot(
      `"----T--"`,
    )
  })

  it('throws if trying to add an invalid weekday', () => {
    expect(() => {
      addWeekdayToWeekdays('---W---', 999 as Weekday)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday '999'. Expected a single weekday.]`,
    )
  })

  it('throws if trying to add multiple weekdays at the same time', () => {
    expect(() => {
      addWeekdayToWeekdays('---W---', Weekday.Fri | Weekday.Mon)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday '34'. Expected a single weekday.]`,
    )
  })
})

/**
 * --- Comparison ---
 */

describe('doesWeekdaysIncludeWeekday', () => {
  it('works for day that is included (single)', () => {
    expect(
      doesWeekdaysIncludeWeekday(
        getWeekdaysFromWeekdayFlags(Weekday.Fri),
        Weekday.Fri,
      ),
    ).toBe(true)
  })

  it('works for day that is included (multiple)', () => {
    expect(
      doesWeekdaysIncludeWeekday(
        getWeekdaysFromWeekdayFlags(Weekday.Fri | Weekday.Sat | Weekday.Sun),
        Weekday.Sun,
      ),
    ).toBe(true)
  })

  it('works for day that is not included (single)', () => {
    expect(doesWeekdaysIncludeWeekday('-M-----', Weekday.Fri)).toBe(false)
  })

  it('works for day that is not included (multiple)', () => {
    expect(doesWeekdaysIncludeWeekday('SMTWT-S', Weekday.Fri)).toBe(false)
  })

  it('works from no days', () => {
    expect(doesWeekdaysIncludeWeekday('-------', Weekday.Fri)).toBe(false)
  })

  it('throws on multiple days at once', () => {
    expect(() => {
      doesWeekdaysIncludeWeekday('-------', Weekday.Fri | Weekday.Mon)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday '34'. Expected a single weekday.]`,
    )
  })

  it('throws on invalid weekday value', () => {
    expect(() => {
      doesWeekdaysIncludeWeekday('-------', 945 as Weekday)
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekday '945'. Expected a single weekday.]`,
    )
  })
})

describe('doesWeekdaysOverlapWithWeekdays', () => {
  it('works when one is all days and there is overlap', () => {
    expect(
      doesWeekdaysHaveOverlapWithWeekdays(
        getWeekdaysWithAllIncluded(),
        getWeekdaysFromWeekdayFlags(Weekday.Fri),
      ),
    ).toBe(true)
  })

  it('works when there is no overlap', () => {
    expect(doesWeekdaysHaveOverlapWithWeekdays('-MTW---', '-----F-')).toBe(
      false,
    )
  })

  it('works when the days are the same', () => {
    expect(
      doesWeekdaysHaveOverlapWithWeekdays(
        '-----F-',
        getWeekdaysFromWeekdayFlags(Weekday.Fri),
      ),
    ).toBe(true)
  })

  it('works there is a single day match', () => {
    expect(
      doesWeekdaysHaveOverlapWithWeekdays(
        getWeekdaysFromWeekdayFlags(Weekday.Fri),
        '----TF-',
      ),
    ).toBe(true)
  })

  it('throws on invalid first weekdays value', () => {
    expect(() => {
      doesWeekdaysHaveOverlapWithWeekdays('SMT', '----TF-')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: 'SMT'.]`,
    )
  })

  it('throws on invalid second weekdays value', () => {
    expect(() => {
      doesWeekdaysHaveOverlapWithWeekdays('----TF-', 'xxxxxxx')
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid weekdays format. Expected format: SMTWTFS. Any of the values can be replaced with a '-'. Current value: 'xxxxxxx'.]`,
    )
  })
})
