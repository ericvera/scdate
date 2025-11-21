import {
  addDaysToDate,
  doesWeekdaysIncludeWeekday,
  getTimestampFromDateAndTime,
  getWeekdayFromDate,
  isAfterTime,
  isSameDateOrBefore,
  type SDate,
} from 'scdate'
import { getApplicableRuleForDate } from './internal/getApplicableRuleForDate.js'
import type { AvailabilityRange, Schedule } from './types.js'

/**
 * Returns all available time ranges within a schedule for the specified
 * date range.
 */
export const getAvailableRangesFromSchedule = (
  schedule: Schedule,
  startDate: SDate | string,
  endDate: SDate | string,
): AvailabilityRange[] => {
  const ranges: AvailabilityRange[] = []

  // Walk through each day in the date range
  let currentDate = startDate

  while (isSameDateOrBefore(currentDate, endDate)) {
    const weekday = getWeekdayFromDate(currentDate)
    const { rules } = getApplicableRuleForDate(schedule, currentDate)

    // Find all time ranges for this day
    for (const rule of rules) {
      // Skip if this weekday is not in the rule
      if (!doesWeekdaysIncludeWeekday(rule.weekdays, weekday)) {
        continue
      }

      // Process each time range
      for (const timeRange of rule.times) {
        // Handle cross-midnight ranges (from > to means it crosses midnight)
        const isCrossMidnight = isAfterTime(timeRange.from, timeRange.to)
        const rangeStart = getTimestampFromDateAndTime(
          currentDate,
          timeRange.from,
        )
        const rangeEnd = isCrossMidnight
          ? getTimestampFromDateAndTime(
              addDaysToDate(currentDate, 1),
              timeRange.to,
            )
          : getTimestampFromDateAndTime(currentDate, timeRange.to)

        ranges.push({
          from: rangeStart,
          to: rangeEnd,
        })
      }
    }

    // Move to the next day
    currentDate = addDaysToDate(currentDate, 1)
  }

  return ranges
}
