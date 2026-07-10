// Re-export scdate types for convenience
export type { SDate, STime, STimestamp, SWeekdays } from 'scdate'

// Export constants
export * from './constants.js'

// Export types
export type * from './types.js'

// Export validation functions
export * from './validateSchedule.js'

// Export schedule management functions
export * from './cleanupExpiredOverridesFromSchedule.js'

// Export availability query functions
export * from './getApplicableRuleForDate.js'
export * from './getAvailableRangesFromSchedule.js'
export * from './getNextAvailabilityRangeFromSchedule.js'
export * from './getNextAvailableFromSchedule.js'
export * from './isInOvernightSpillover.js'
export * from './isScheduleAvailable.js'

// Export multi-schedule (layered availability) query functions
export * from './areSchedulesAvailable.js'
export * from './getNextAvailabilityRangeFromSchedules.js'
export * from './getUnavailableScheduleIndexes.js'
