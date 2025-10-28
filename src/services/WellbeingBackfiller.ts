import { wellbeingConfigs } from "src/inputs/wellbeing";
import { dbService } from "./DbService";
import { CollectedInput } from "./InputCollectorService";
import { PeriodicityUnits as PU } from "src/services/ScheduleService";

/**
 * Service to backfill wellbeing parameter values for past days
 * when periodicity is set
 */
export class WellbeingBackfiller {
  /**
   * Process collected inputs and backfill wellbeing parameters with periodicity
   * @param inputs - The collected inputs from today's report
   * @returns Expanded inputs array with backfilled values for past days
   */
  async backfillPeriodicParameters(
    inputs: CollectedInput[]
  ): Promise<CollectedInput[]> {
    const expandedInputs: CollectedInput[] = [];

    for (const input of inputs) {
      // Check if this is a wellbeing parameter with periodicity
      const parameter = wellbeingConfigs.find(
        (p) => p.id === input.inputId && p.schedule?.active !== false
      );

      if (!parameter || !parameter.schedule?.showEvery) {
        // Not a periodic parameter, keep as is
        expandedInputs.push(input);
        continue;
      }

      // This is a periodic parameter - backfill past days
      // For now, only support day-based periodicity
      const periodicity =
        parameter.schedule.showEvery.unit === PU.Day
          ? parameter.schedule.showEvery.count
          : 1;
      const todayDate = input.reportDate;

      // Get all report dates from the past N days
      const pastDates = await this.getReportDatesInPast(periodicity, todayDate);

      // Create an input for each past date that has a report
      for (const pastDate of pastDates) {
        expandedInputs.push({
          ...input,
          reportDate: pastDate,
          // Keep same reportNumber or create special one for backfilled data?
          // For now, we'll keep the same reportNumber
        });
      }

      // Also add today's entry
      expandedInputs.push(input);
    }

    return expandedInputs;
  }

  /**
   * Get dates from the past N days that have reports
   * @param periodicity - Number of days to look back
   * @param todayDate - Today's date in YYYY-MM-DD format
   * @returns Array of dates in YYYY-MM-DD format that have reports
   */
  private async getReportDatesInPast(
    periodicity: number,
    todayDate: string
  ): Promise<string[]> {
    const dates: string[] = [];

    // Get all past inputs to find which dates have reports
    try {
      const allInputs = await dbService.getReportInputs("almostDailyReport");

      // Get unique report dates from the past N days (excluding today)
      for (let i = 1; i < periodicity; i++) {
        const pastDate = this.getDateDaysAgo(i, todayDate);

        // Check if there's any report for this date
        const hasReport = allInputs.some(
          (input) => input.reportDate === pastDate
        );

        if (hasReport) {
          dates.push(pastDate);
        }
      }
    } catch (error) {
      console.error("Error fetching past report dates:", error);
    }

    return dates;
  }

  /**
   * Get date N days ago from a reference date
   */
  private getDateDaysAgo(daysAgo: number, fromDate: string): string {
    const date = new Date(fromDate);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
  }
}

export const wellbeingBackfiller = new WellbeingBackfiller();
