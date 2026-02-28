import {
  addDaysToDate,
  getTimeAtMidnight,
  getWeekdayFromDate,
  isSameTime,
  type SDate,
  type STime,
} from 'scdate'
import { getApplicableRuleForDate } from './getApplicableRuleForDate.js'
import { getEffectiveTimesForWeekday } from './internal/getEffectiveTimesForWeekday.js'
import { isTimeInTimeRange } from './internal/isTimeInTimeRange.js'
import type { Schedule, SDateString, STimeString } from './types.js'

/**
 * Returns true if the given date and time fall within overnight spillover from
 * the previous day's schedule.
 *
 * An overnight rule (where `to` < `from`, e.g. 22:00-02:00) spills into the
 * next calendar day. This function checks whether the given time on the given
 * date falls before that rule's `to` time — i.e., within the spillover window.
 *
 * Use this to determine whether modifying the previous day's schedule would
 * affect current availability. For example, a business owner wanting to close
 * early during an overnight shift that started yesterday needs to know if
 * today's early-morning availability is driven by yesterday's rules.
 *
 * @param schedule The schedule to check.
 * @param date The date to check (the "current" day).
 * @param time The time to check.
 * @returns True if (date, time) is in spillover from the previous day.
 */
export const isInOvernightSpillover = (
  schedule: Schedule,
  date: SDate | SDateString,
  time: STime | STimeString,
): boolean => {
  const previousDate = addDaysToDate(date, -1)
  const currentWeekday = getWeekdayFromDate(date)
  const previousResult = getApplicableRuleForDate(schedule, previousDate)

  if (previousResult.rules === true) {
    return false
  }

  const midnight = getTimeAtMidnight()

  return previousResult.rules.some((rule) => {
    const effectiveTimes = getEffectiveTimesForWeekday(rule, currentWeekday)

    const spilloverRanges = effectiveTimes.filter((range) =>
      isSameTime(range.from, midnight),
    )

    return spilloverRanges.some((range) => isTimeInTimeRange(time, range, true))
  })
}
