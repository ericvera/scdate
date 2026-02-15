import type { SDate, STime, STimestamp, SWeekdays, Weekday } from 'scdate'
import { RuleLocationType, ValidationIssue } from './constants.js'

/**
 * String in YYYY-MM-DD format representing a date.
 */
export type SDateString = string

/**
 * String in HH:MM format representing a time.
 */
export type STimeString = string

/**
 * String in YYYY-MM-DDTHH:MM format representing a timestamp.
 */
export type STimestampString = string

/**
 * String in SMTWTFS format representing weekdays.
 */
export type SWeekdaysString = string

/**
 * Defines a recurring weekly availability pattern. Specifies which days of the
 * week are available and what time range applies on those days. For split
 * shifts, use multiple rules with the same weekdays.
 */
export interface WeeklyScheduleRule {
  /** Days of the week this rule applies to */
  weekdays: SWeekdays | SWeekdaysString
  /** Start time of the range (inclusive). Ranges can cross midnight. */
  from: STime | STimeString
  /** End time of the range (inclusive). Ranges can cross midnight. */
  to: STime | STimeString
}

/**
 * Defines a date-specific override to the weekly schedule. Overrides apply to
 * a date range and replace the weekly schedule for those dates. If `to` is
 * omitted, the override applies indefinitely from the `from` date forward.
 */
export interface OverrideScheduleRule {
  /** Start date of the override (inclusive) */
  from: SDate | SDateString
  /**
   * End date of the override (inclusive). If omitted, the override applies
   * indefinitely from the `from` date.
   */
  to?: SDate | SDateString
  /**
   * Weekly schedule rules that apply during this override period. Empty array
   * means unavailable for the entire period.
   */
  rules: WeeklyScheduleRule[]
}

/**
 * Represents a complete availability schedule. A schedule consists of base
 * weekly recurring patterns and optional date-specific overrides. Priority
 * order for determining availability: 1. Specific override (with both from and
 * to dates) 2. Indefinite override (with only from date) 3. Weekly schedule
 */
export interface Schedule {
  /**
   * Base recurring weekly schedule patterns.
   * - `true`: available 24/7 (overrides can close windows)
   * - `WeeklyScheduleRule[]`: available during defined time ranges
   * - `[]`: never available (overrides can open windows)
   */
  weekly: WeeklyScheduleRule[] | true
  /**
   * Date-specific exceptions to the weekly schedule. Overrides take precedence
   * over weekly rules.
   */
  overrides?: OverrideScheduleRule[]
}

/**
 * Represents a continuous period of availability.
 */
export interface AvailabilityRange {
  /** Start of the availability period (inclusive) */
  from: STimestamp | STimestampString
  /** End of the availability period (inclusive) */
  to: STimestamp | STimestampString
}

/**
 * Discriminated union of all possible validation errors. Each error type
 * includes specific metadata about what failed validation. Use the `issue`
 * property to narrow the type and access error-specific fields.
 */
export type ValidationError =
  | {
      /** Two or more specific overrides have identical date ranges */
      issue: ValidationIssue.DuplicateOverrides
      /** Indexes of the two duplicate overrides */
      overrideIndexes: [number, number]
    }
  | {
      /** Two or more specific overrides have overlapping date ranges */
      issue: ValidationIssue.OverlappingSpecificOverrides
      /** Indexes of the two overlapping overrides */
      overrideIndexes: [number, number]
    }
  | {
      /**
       * A field contains an invalid scdate format
       * (SDate, STime, SWeekdays, or STimestamp)
       */
      issue: ValidationIssue.InvalidScDateFormat
      /** Path to the field with invalid format (e.g., 'weekly[0].weekdays') */
      field: string
      /** The invalid value that was provided */
      value: string
      /** The expected format (e.g., 'SMTWTFS', 'HH:MM', 'YYYY-MM-DD') */
      expectedFormat: string
    }
  | {
      /**
       * A rule has a weekdays pattern with no days selected (e.g., '-------')
       */
      issue: ValidationIssue.EmptyWeekdays
      /** Location of the rule with empty weekdays */
      location:
        | { type: RuleLocationType.Weekly; ruleIndex: number }
        | {
            type: RuleLocationType.Override
            overrideIndex: number
            ruleIndex: number
          }
    }
  | {
      /**
       * An override has weekdays that don't match any actual dates in the
       * override's date range
       */
      issue: ValidationIssue.OverrideWeekdaysMismatch
      /** Index of the override with the mismatch */
      overrideIndex: number
      /** Index of the rule within the override */
      ruleIndex: number
      /** The weekdays pattern that doesn't match */
      weekdays: string
      /** The date range of the override */
      dateRange: { from: string; to: string }
    }
  | {
      /**
       * Two or more rules in the weekly schedule have overlapping weekdays and
       * time ranges
       */
      issue: ValidationIssue.OverlappingRulesInWeekly
      /** Indexes of the two overlapping rules */
      ruleIndexes: [number, number]
      /** The weekday where the overlap occurs */
      weekday: Weekday
    }
  | {
      /**
       * Two or more rules within the same override have overlapping weekdays
       * and time ranges
       */
      issue: ValidationIssue.OverlappingRulesInOverride
      /** Index of the override containing the overlapping rules */
      overrideIndex: number
      /** Indexes of the two overlapping rules within the override */
      ruleIndexes: [number, number]
      /** The weekday where the overlap occurs */
      weekday: Weekday
    }
  | {
      /**
       * Cross-midnight spillover (from weekly rule or previous override)
       * conflicts with override's first day time ranges
       */
      issue: ValidationIssue.SpilloverConflictIntoOverrideFirstDay
      /** Index of the override whose first day has the conflict */
      overrideIndex: number
      /** The first date of the override where conflict occurs */
      date: string
      /** The override rule index being conflicted with */
      overrideRuleIndex: number
      /**
       * The source of spillover (weekly rule or previous override). If
       * sourceOverrideIndex is undefined, it's a weekly rule.
       */
      sourceWeeklyRuleIndex?: number
      sourceOverrideIndex?: number
      sourceOverrideRuleIndex?: number
    }
  | {
      /**
       * Cross-midnight spillover from override's last day conflicts with next
       * day's time ranges or weekly: true availability
       */
      issue: ValidationIssue.SpilloverConflictOverrideIntoNext
      /** Index of the override whose last day causes spillover */
      overrideIndex: number
      /** The last date of the override causing spillover */
      date: string
      /** The override rule index causing the spillover */
      overrideRuleIndex: number
      /**
       * The next day's rule that conflicts. When all three fields are
       * undefined, the next day is weekly: true (fully available).
       */
      nextDayWeeklyRuleIndex?: number
      nextDayOverrideIndex?: number
      nextDayOverrideRuleIndex?: number
    }
  | {
      /**
       * An override has a 'to' date that is before the 'from' date
       */
      issue: ValidationIssue.InvalidOverrideDateOrder
      /** Index of the override with invalid date order */
      overrideIndex: number
      /** The from date */
      from: string
      /** The to date that is before from */
      to: string
    }

/**
 * Result of validating a schedule. Contains a boolean flag indicating validity
 * and an array of specific errors if validation failed.
 */
export interface ValidationResult {
  /** True if the schedule passed all validation checks */
  valid: boolean
  /**
   * Array of validation errors. Empty if valid is true. Each error includes
   * specific details about what failed.
   */
  errors: ValidationError[]
}
