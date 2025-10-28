import { PeriodicityUnit } from "./PeriodicityUnits";

export interface Schedule {
  // ========== BASIC STATUS ==========
  /** Whether this input is active/enabled (optional - defaults to true) */
  active?: boolean;

  // ========== DISPLAY FREQUENCY ==========
  /** How often this appears (optional - defaults to daily if omitted) */
  showEvery?: {
    count: number; // e.g., 2 = every 2 days/weeks
    unit: PeriodicityUnit;
  };

  /** Specific days of week (0-6, Sunday=0) - overrides showEvery if specified */
  daysOfWeek?: number[];

  /** Specific dates of month (1-31) - for monthly recurrence */
  datesOfMonth?: number[];

  // ========== TRACKING TARGET ==========
  /** Target to achieve within a period (optional - for tracking inputs like habits) */
  target?: {
    count: number; // e.g., 5 times per week
    per: {
      count: number; // e.g., 1 week
      unit: PeriodicityUnit;
    };
    keepShowing?: boolean; // true = permanent habit (show even after target met)
  };

  /** Minimum target before considering streak valid */
  minStreak?: number;

  // ========== LIMITS & CONSTRAINTS ==========
  /** Maximum limit over a longer period (optional - for harmful behaviors) */
  limit?: {
    max: number; // e.g., max 20 times
    per: {
      count: number; // e.g., per 6 months
      unit: PeriodicityUnit;
    };
  };

  // ========== TIME BOUNDARIES ==========
  /** Start date - input only shows on or after this date */
  startDate?: string; // ISO date format

  /** End date - input stops showing after this date */
  endDate?: string; // ISO date format

  /** Specific time of day to show/remind (HH:MM format) */
  timeOfDay?: string;

  // ========== RESET & CYCLES ==========
  /** When tracking counters reset (default: based on target.per) */
  resetCycle?: {
    count: number;
    unit: PeriodicityUnit;
  };

  /** Day of week to reset weekly counters (0-6, Sunday=0) */
  weekStartsOn?: number;

  // ========== COMPLETION RULES ==========
  /** Grace period after target period ends to still count completion */
  gracePeriod?: {
    count: number;
    unit: PeriodicityUnit;
  };

  /** Can track/complete for past dates */
  allowRetroactive?: boolean;

  /** Auto-complete if not answered by end of day */
  autoComplete?: boolean | "skip"; // true = mark done, "skip" = mark skipped, false = leave empty

  // ========== PRIORITY & ORDERING ==========
  /** Display priority (higher = shown first) */
  priority?: number;

  /** Sort order within same priority level */
  sortOrder?: number;

  // ========== DEPENDENCIES & CONDITIONS ==========
  /** Only show if these input IDs are completed */
  requiresCompleted?: string[];

  /** Hide if these input IDs are completed */
  hideIfCompleted?: string[];

  /** Custom condition function (advanced) */
  condition?: () => boolean;

  // ========== NOTIFICATIONS ==========
  /** Enable reminders */
  reminder?: {
    enabled: boolean;
    timesBefore?: string[]; // Times to remind before deadline (e.g., ["09:00", "18:00"])
    daysBeforeDeadline?: number;
  };

  // ========== METADATA ==========
  /** Tags for categorization/filtering */
  tags?: string[];

  /** Custom notes about this schedule */
  notes?: string;
}
