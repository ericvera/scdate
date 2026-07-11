import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getWeekdayFromDate,
} from 'scdate'
import type { SDate, SDateString, STime, STimeString } from 'scdate'
import { getApplicableRuleForDate } from './getApplicableRuleForDate.js'
import { isTimeInTimeRange } from './internal/isTimeInTimeRange.js'
import type { Schedule } from './types.js'

/**
 * Returns true if the given date and time fall within overnight spillover from
 * the previous day's schedule.
 *
 * An overnight rule (e.g. 22:00-02:00) spills into the next calendar day.
 * This function checks whether the given time on the given date falls before
 * that rule's `to` time — i.e., within the spillover window. Ranges ending at
 * 00:00 stop exactly at midnight and have no spillover.
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
  const previousWeekday = getWeekdayFromDate(previousDate)
  const previousResult = getApplicableRuleForDate(schedule, previousDate)

  if (previousResult.rules === true) {
    return false
  }

  return previousResult.rules.some((rule) => {
    // Only rules that applied on the previous day can spill into this one
    if (!doesWeekdaysIncludeWeekday(rule.weekdays, previousWeekday)) {
      return false
    }

    // Check the next-day (spillover) portion of the rule's time range
    return isTimeInTimeRange(time, rule, false)
  })
}
