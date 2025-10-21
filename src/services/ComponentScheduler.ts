import { dbService } from "./DbService";

/**
 * Smart component scheduling system
 * - Shows components on specific days (e.g., Mon/Wed/Fri)
 * - BUT if checkbox not completed, keeps showing until done
 */

export class ComponentScheduler {
  /**
   * Check if a component should be shown today
   * @param componentId - The checkbox field name to track
   * @param defaultSchedule - Days to show by default (0=Sun, 1=Mon, ..., 6=Sat)
   * @returns true if component should be shown
   */
  async shouldShowComponent(
    componentId: string,
    defaultSchedule: number[]
  ): Promise<boolean> {
    const today = new Date().getDay();

    // Check if today is in the default schedule
    const isScheduledDay = defaultSchedule.includes(today);

    // If it's a scheduled day, always show
    if (isScheduledDay) {
      return true;
    }

    // If not a scheduled day, check if it was shown yesterday and not completed
    const wasShownYesterday = await this.wasComponentShownYesterday(
      componentId
    );
    const wasCompletedYesterday = await this.wasComponentCompletedYesterday(
      componentId
    );

    // Show if it was shown yesterday but NOT completed
    return wasShownYesterday && !wasCompletedYesterday;
  }

  /**
   * Check if component appeared in yesterday's report
   */
  private async wasComponentShownYesterday(
    componentId: string
  ): Promise<boolean> {
    try {
      const yesterday = this.getYesterdayDate();
      const inputs = await dbService.getInputsByName(
        "almostDailyReport",
        componentId
      );

      // Check if there's an input from yesterday
      return inputs.some((input) => input.reportDate === yesterday);
    } catch (error) {
      console.error("Error checking if component was shown:", error);
      return false;
    }
  }

  /**
   * Check if component was completed yesterday
   */
  private async wasComponentCompletedYesterday(
    componentId: string
  ): Promise<boolean> {
    try {
      const yesterday = this.getYesterdayDate();
      const inputs = await dbService.getInputsByName(
        "almostDailyReport",
        componentId
      );

      // Find yesterday's input and check if it was true
      const yesterdayInput = inputs.find(
        (input) => input.reportDate === yesterday
      );

      return yesterdayInput?.value === true;
    } catch (error) {
      console.error("Error checking if component was completed:", error);
      return false;
    }
  }

  /**
   * Get yesterday's date in YYYY-MM-DD format
   */
  private getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }
}

export const componentScheduler = new ComponentScheduler();
