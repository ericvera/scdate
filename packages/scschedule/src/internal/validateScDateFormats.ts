import { SDate, sDate, STime, sTime, SWeekdays, sWeekdays } from 'scdate'
import { ValidationIssue } from '../constants.js'
import type {
  Schedule,
  SDateString,
  STimeString,
  SWeekdaysString,
  ValidationError,
} from '../types.js'

/**
 * Validates that a value is a valid SDate format (YYYY-MM-DD).
 */
const validateSDateValue = (
  value: unknown,
  field: string,
): ValidationError | undefined => {
  try {
    sDate(value as SDateString | SDate)
  } catch {
    return {
      issue: ValidationIssue.InvalidScDateFormat,
      field,
      value: String(value),
      expectedFormat: 'YYYY-MM-DD',
    }
  }

  return undefined
}

/**
 * Validates that a value is a valid STime format (HH:MM).
 */
const validateSTimeValue = (
  value: unknown,
  field: string,
): ValidationError | undefined => {
  try {
    sTime(value as STimeString | STime)
  } catch {
    return {
      issue: ValidationIssue.InvalidScDateFormat,
      field,
      value: String(value),
      expectedFormat: 'HH:MM',
    }
  }

  return undefined
}

/**
 * Validates that a value is a valid SWeekdays format (SMTWTFS).
 */
const validateSWeekdaysValue = (
  value: unknown,
  field: string,
): ValidationError | undefined => {
  try {
    sWeekdays(value as SWeekdaysString | SWeekdays)
  } catch {
    return {
      issue: ValidationIssue.InvalidScDateFormat,
      field,
      value: String(value),
      expectedFormat: 'SMTWTFS',
    }
  }

  return undefined
}

/**
 * Validates both from and to times in a time range.
 */
const validateTimeRange = (
  timeRange: { from: unknown; to: unknown },
  fieldPrefix: string,
): ValidationError[] => {
  const errors: ValidationError[] = []

  const fromError = validateSTimeValue(timeRange.from, `${fieldPrefix}.from`)

  if (fromError) {
    errors.push(fromError)
  }

  const toError = validateSTimeValue(timeRange.to, `${fieldPrefix}.to`)

  if (toError) {
    errors.push(toError)
  }

  return errors
}

/**
 * Validates a rule (weekdays and all time ranges).
 */
const validateRule = (
  rule: { weekdays: unknown; times: { from: unknown; to: unknown }[] },
  fieldPrefix: string,
): ValidationError[] => {
  const errors: ValidationError[] = []

  const weekdaysError = validateSWeekdaysValue(
    rule.weekdays,
    `${fieldPrefix}.weekdays`,
  )

  if (weekdaysError) {
    errors.push(weekdaysError)
  }

  rule.times.forEach((timeRange, timeIndex) => {
    errors.push(
      ...validateTimeRange(
        timeRange,
        `${fieldPrefix}.times[${String(timeIndex)}]`,
      ),
    )
  })

  return errors
}

/**
 * Validates that all scdate format fields in a schedule are properly formatted.
 */
export const validateScDateFormats = (
  schedule: Schedule,
): ValidationError[] => {
  const errors: ValidationError[] = []

  // Validate weekly rules
  const weeklyRules = schedule.weekly === true ? [] : schedule.weekly
  weeklyRules.forEach((rule, ruleIndex) => {
    errors.push(...validateRule(rule, `weekly[${String(ruleIndex)}]`))
  })

  // Validate overrides
  schedule.overrides?.forEach((override, overrideIndex) => {
    const fromError = validateSDateValue(
      override.from,
      `overrides[${String(overrideIndex)}].from`,
    )

    if (fromError) {
      errors.push(fromError)
    }

    if (override.to) {
      const toError = validateSDateValue(
        override.to,
        `overrides[${String(overrideIndex)}].to`,
      )

      if (toError) {
        errors.push(toError)
      }
    }

    override.rules.forEach((rule, ruleIndex) => {
      errors.push(
        ...validateRule(
          rule,
          `overrides[${String(overrideIndex)}].rules[${String(ruleIndex)}]`,
        ),
      )
    })
  })

  return errors
}
