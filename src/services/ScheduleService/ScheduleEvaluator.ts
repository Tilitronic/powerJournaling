import { Schedule } from "./types";
import { PeriodicityUnits as PU } from "./PeriodicityUnits";
import { dbService } from "src/services/DbService";
import { InputConfig } from "src/inputs/types";
import {
  reportDefinitions,
  ReportType,
  ReportTypes,
} from "src/reportDefinitions";

/**
 * Service to evaluate schedule configurations and determine if an input should be shown
 * Handles active status, periodicity, targets, limits, dependencies, and time boundaries
 */
export class ScheduleEvaluator {
  /**
   * Main evaluation function - determines if an input should be shown
   * @param inputConfig - The input configuration object containing id, schedule, etc.
   * @param reportType - The report type for DB queries (defaults to almostDailyReport)
   * @returns Promise<boolean> - true if input should be shown, false otherwise
   */
  async shouldShowInput(
    inputConfig: InputConfig,
    reportType: ReportType = ReportTypes.ALMOST_DAILY
  ): Promise<boolean> {
    const { id: inputId, schedule } = inputConfig;

    // If no schedule, default to active (always show)
    if (!schedule) {
      return true;
    }

    // Check active status - if explicitly false, don't show
    if (schedule.active === false) {
      return false;
    }

    // Check time boundaries
    if (!this.isWithinTimeBoundaries(schedule)) {
      return false;
    }

    // Check dependencies
    if (!(await this.checkDependencies(schedule, reportType))) {
      return false;
    }

    // Check custom condition function
    if (schedule.condition && !schedule.condition()) {
      return false;
    }

    // Check periodicity (showEvery, daysOfWeek, datesOfMonth)
    if (!this.shouldShowBasedOnPeriodicity(schedule)) {
      return false;
    }

    // Check target completion (for non-permanent habits)
    if (schedule.target && !schedule.target.keepShowing) {
      const isTargetMet = await this.isTargetMet(inputId, schedule, reportType);
      if (isTargetMet) {
        return false; // Target met and not permanent, hide
      }
    }

    // Check if limit is reached
    if (schedule.limit) {
      const isLimitReached = await this.isLimitReached(
        inputId,
        schedule,
        reportType
      );
      if (isLimitReached) {
        return false; // Limit reached, hide
      }
    }

    // All checks passed
    return true;
  }

  /**
   * Get progress information for an input (useful for display)
   */
  async getInputProgress(
    inputConfig: InputConfig,
    reportType: ReportType = ReportTypes.ALMOST_DAILY
  ): Promise<{
    targetProgress?: { current: number; target: number; isComplete: boolean };
    limitProgress?: { current: number; limit: number; percentage: number };
  }> {
    const { id: inputId, schedule } = inputConfig;
    const result: {
      targetProgress?: { current: number; target: number; isComplete: boolean };
      limitProgress?: { current: number; limit: number; percentage: number };
    } = {};

    if (!schedule) return result;

    // Calculate target progress
    if (schedule.target) {
      const periodStart = this.getPeriodStartDate(schedule.target.per);
      const completionCount = await this.getCompletionCount(
        inputId,
        periodStart,
        reportType
      );
      result.targetProgress = {
        current: completionCount,
        target: schedule.target.count,
        isComplete: completionCount >= schedule.target.count,
      };
    }

    // Calculate limit progress
    if (schedule.limit) {
      const periodStart = this.getPeriodStartDate(schedule.limit.per);
      const completionCount = await this.getCompletionCount(
        inputId,
        periodStart,
        reportType
      );
      result.limitProgress = {
        current: completionCount,
        limit: schedule.limit.max,
        percentage: (completionCount / schedule.limit.max) * 100,
      };
    }

    return result;
  }

  /**
   * Check if current date/time is within schedule boundaries
   */
  private isWithinTimeBoundaries(schedule: Schedule): boolean {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Check start date
    if (schedule.startDate && today < schedule.startDate) {
      return false;
    }

    // Check end date
    if (schedule.endDate && today > schedule.endDate) {
      return false;
    }

    // TODO: Implement timeOfDay check if needed
    // This would require comparing current time with schedule.timeOfDay

    return true;
  }

  /**
   * Check dependencies (requires/hide conditions)
   */
  private async checkDependencies(
    schedule: Schedule,
    reportType: ReportType
  ): Promise<boolean> {
    // Check requiresCompleted - all specified inputs must be completed today
    if (schedule.requiresCompleted && schedule.requiresCompleted.length > 0) {
      const today = new Date().toISOString().split("T")[0];

      for (const requiredInputId of schedule.requiresCompleted) {
        const inputs = await dbService.getInputsById(
          reportType,
          requiredInputId
        );
        const todayInput = inputs.find((i) => i.reportDate === today);

        if (!todayInput || todayInput.value !== true) {
          return false; // Required input not completed
        }
      }
    }

    // Check hideIfCompleted - hide if any specified input is completed today
    if (schedule.hideIfCompleted && schedule.hideIfCompleted.length > 0) {
      const today = new Date().toISOString().split("T")[0];

      for (const hideInputId of schedule.hideIfCompleted) {
        const inputs = await dbService.getInputsById(reportType, hideInputId);
        const todayInput = inputs.find((i) => i.reportDate === today);

        if (todayInput && todayInput.value === true) {
          return false; // Hide condition met
        }
      }
    }

    return true;
  }

  /**
   * Check if input should be shown based on periodicity settings
   */
  private shouldShowBasedOnPeriodicity(schedule: Schedule): boolean {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Check specific days of week (overrides showEvery)
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

      // Convert ISO 8601 days (1-7, Mon-Sun) to JS days (0-6, Sun-Sat) if needed
      const normalizedDays = schedule.daysOfWeek.map((day) => {
        if (day === 7) return 0; // Sunday: 7 -> 0
        if (day >= 1 && day <= 6) return day; // Mon-Sat: 1-6 -> 1-6
        return day; // Already in 0-6 format (for backwards compatibility)
      });

      return normalizedDays.includes(dayOfWeek);
    }

    // Check specific dates of month
    if (schedule.datesOfMonth && schedule.datesOfMonth.length > 0) {
      const dateOfMonth = now.getDate();
      return schedule.datesOfMonth.includes(dateOfMonth);
    }

    // Check showEvery periodicity
    if (schedule.showEvery) {
      return this.shouldShowBasedOnShowEvery(
        schedule.showEvery.count,
        schedule.showEvery.unit
      );
    }

    // No periodicity restrictions, show by default
    return true;
  }

  /**
   * Calculate if input should show based on showEvery setting
   */
  private shouldShowBasedOnShowEvery(count: number, unit: string): boolean {
    if (count === 1) {
      return true; // Show every single unit (e.g., every day, every week)
    }

    const today = new Date().toISOString().split("T")[0];
    const dayNumber = this.getDayNumberFromEpoch(today);

    switch (unit) {
      case PU.Day:
        return dayNumber % count === 0;

      case PU.Week:
        const weekNumber = Math.floor(dayNumber / 7);
        return weekNumber % count === 0;

      case PU.Month:
        // Approximate: check if it's roughly every N months
        const monthNumber = this.getMonthNumberFromEpoch(today);
        return monthNumber % count === 0;

      case PU.Quarter:
        const quarterNumber = this.getQuarterNumberFromEpoch(today);
        return quarterNumber % count === 0;

      case PU.Year:
        const yearNumber = this.getYearNumberFromEpoch(today);
        return yearNumber % count === 0;

      default:
        return true;
    }
  }

  /**
   * Check if target is met for the current period
   */
  private async isTargetMet(
    inputId: string,
    schedule: Schedule,
    reportType: ReportType
  ): Promise<boolean> {
    if (!schedule.target) return false;

    const periodStart = this.getPeriodStartDate(schedule.target.per);
    const completionCount = await this.getCompletionCount(
      inputId,
      periodStart,
      reportType
    );

    return completionCount >= schedule.target.count;
  }

  /**
   * Check if limit is reached for the current period
   */
  private async isLimitReached(
    inputId: string,
    schedule: Schedule,
    reportType: ReportType
  ): Promise<boolean> {
    if (!schedule.limit) return false;

    const periodStart = this.getPeriodStartDate(schedule.limit.per);
    const completionCount = await this.getCompletionCount(
      inputId,
      periodStart,
      reportType
    );

    return completionCount >= schedule.limit.max;
  }

  /**
   * Get completion count for an input since a start date
   */
  private async getCompletionCount(
    inputId: string,
    periodStart: string,
    reportType: ReportType
  ): Promise<number> {
    const allInputs = await dbService.getInputsById(reportType, inputId);

    const periodInputs = allInputs.filter((input) => {
      return input.reportDate && input.reportDate >= periodStart;
    });

    const completionCount = periodInputs.filter(
      (input) => input.value === true
    ).length;

    return completionCount;
  }

  /**
   * Get the start date of the current period based on period configuration
   */
  private getPeriodStartDate(per: { count: number; unit: string }): string {
    const now = new Date();

    switch (per.unit) {
      case PU.Day:
        if (per.count === 1) {
          return now.toISOString().split("T")[0]; // Today
        }
        const daysAgo = new Date(now);
        daysAgo.setDate(now.getDate() - per.count);
        return daysAgo.toISOString().split("T")[0];

      case PU.Week:
        if (per.count === 1) {
          // Current week starts on Monday
          const dayOfWeek = now.getDay();
          const monday = new Date(now);
          monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
          return monday.toISOString().split("T")[0];
        }
        const weeksAgo = new Date(now);
        weeksAgo.setDate(now.getDate() - per.count * 7);
        return weeksAgo.toISOString().split("T")[0];

      case PU.Month:
        if (per.count === 1) {
          // Current month starts on the 1st
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
            2,
            "0"
          )}-01`;
        }
        const monthsAgo = new Date(now);
        monthsAgo.setMonth(now.getMonth() - per.count);
        return monthsAgo.toISOString().split("T")[0];

      case PU.Quarter:
        if (per.count === 1) {
          // Current quarter
          const quarter = Math.floor(now.getMonth() / 3);
          const quarterStartMonth = quarter * 3;
          return `${now.getFullYear()}-${String(quarterStartMonth + 1).padStart(
            2,
            "0"
          )}-01`;
        }
        const quartersAgo = new Date(now);
        quartersAgo.setMonth(now.getMonth() - per.count * 3);
        return quartersAgo.toISOString().split("T")[0];

      case PU.Year:
        if (per.count === 1) {
          // Current year starts on Jan 1
          return `${now.getFullYear()}-01-01`;
        }
        const yearsAgo = new Date(now);
        yearsAgo.setFullYear(now.getFullYear() - per.count);
        return yearsAgo.toISOString().split("T")[0];

      case PU.Decade:
        const decadeStartYear = Math.floor(now.getFullYear() / 10) * 10;
        return `${decadeStartYear}-01-01`;

      default:
        return now.toISOString().split("T")[0];
    }
  }

  /**
   * Calculate day number from epoch (2020-01-01)
   */
  private getDayNumberFromEpoch(dateString: string): number {
    const epoch = new Date("2020-01-01");
    const date = new Date(dateString);
    const diffTime = date.getTime() - epoch.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Calculate month number from epoch
   */
  private getMonthNumberFromEpoch(dateString: string): number {
    const epoch = new Date("2020-01-01");
    const date = new Date(dateString);
    const yearDiff = date.getFullYear() - epoch.getFullYear();
    const monthDiff = date.getMonth() - epoch.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  /**
   * Calculate quarter number from epoch
   */
  private getQuarterNumberFromEpoch(dateString: string): number {
    const monthNumber = this.getMonthNumberFromEpoch(dateString);
    return Math.floor(monthNumber / 3);
  }

  /**
   * Calculate year number from epoch
   */
  private getYearNumberFromEpoch(dateString: string): number {
    const date = new Date(dateString);
    const epoch = new Date("2020-01-01");
    return date.getFullYear() - epoch.getFullYear();
  }
}

export const scheduleEvaluator = new ScheduleEvaluator();
