/**
 * Enumeration of all possible validation issues that can occur when validating
 * a schedule. Used in ValidationError to identify the specific type of
 * validation failure.
 */
export enum ValidationIssue {
  /** The timezone string is not a valid IANA timezone identifier */
  InvalidTimezone = 'invalid-timezone',
  /** Two or more specific overrides have identical date ranges */
  DuplicateOverrides = 'duplicate-overrides',
  /** Two or more specific overrides have overlapping date ranges */
  OverlappingSpecificOverrides = 'overlapping-specific-overrides',
  /** Time ranges within a single rule overlap with each other */
  OverlappingTimesInRule = 'overlapping-times-in-rule',
  /**
   * A rule has an empty times array (should have at least one time range or be
   * removed)
   */
  EmptyTimes = 'empty-times',
  /**
   * A field contains an invalid scdate format (SDate, STime, SWeekdays, or
   * STimestamp)
   */
  InvalidScDateFormat = 'invalid-scdate-format',
  /**
   * A rule has a weekdays pattern with no days selected (e.g., '-------')
   */
  EmptyWeekdays = 'empty-weekdays',
  /**
   * An override has weekdays that don't match any actual dates in the
   * override's date range, making it effectively closed (should use empty rules
   * instead)
   */
  OverrideWeekdaysMismatch = 'override-weekdays-mismatch',
  /**
   * Two or more rules in the weekly schedule have overlapping weekdays and
   * time ranges
   */
  OverlappingRulesInWeekly = 'overlapping-rules-in-weekly',
  /**
   * Two or more rules within the same override have overlapping weekdays and
   * time ranges
   */
  OverlappingRulesInOverride = 'overlapping-rules-in-override',
  /**
   * Cross-midnight spillover (from weekly rule or previous override) conflicts
   * with override's first day time ranges
   */
  SpilloverConflictIntoOverrideFirstDay = 'spillover-conflict-into-override-first-day',
  /**
   * Cross-midnight spillover from override's last day conflicts with next
   * day's time ranges (weekly or another override)
   */
  SpilloverConflictOverrideIntoNext = 'spillover-conflict-override-into-next',
  /**
   * An override has a 'to' date that is before the 'from' date
   */
  InvalidOverrideDateOrder = 'invalid-override-date-order',
}

/**
 * Enumeration of rule location types used in validation errors to indicate
 * where a validation issue occurred within a schedule structure.
 */
export enum RuleLocationType {
  /** The rule is in the weekly schedule section */
  Weekly = 'weekly',
  /** The rule is in an override section */
  Override = 'override',
}
