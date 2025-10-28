import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { format, differenceInDays, subDays } from "date-fns";
import { ReportTypes } from "src/reportDefinitions";

/**
 * Shows consistency statistics - how many reports filled vs days passed.
 * Displays for last 7, 30, and 90 days.
 */
export async function consistencyStats(): Promise<string> {
  const cb = new ComponentBuilder("consistencyStats");

  try {
    // Get all reports from the database
    const allInputs = await dbService.getReportInputs(ReportTypes.ALMOST_DAILY);

    if (!allInputs || allInputs.length === 0) {
      // No data yet - this is the first report
      cb._md("📊 **Consistency Tracker** · 🎯 Starting your journey today!");
      return cb.render();
    }

    // Get unique report dates (sorted newest first)
    const uniqueDates = Array.from(
      new Set(allInputs.map((input) => input.reportDate))
    )
      .sort()
      .reverse();

    // Find the first report date
    const firstReportDate = uniqueDates[uniqueDates.length - 1];
    const firstDate = new Date(firstReportDate);
    const today = new Date();
    const totalDaysSinceStart = differenceInDays(today, firstDate) + 1;

    // Calculate statistics for different time periods
    const periods = [
      { days: 7, label: "7d" },
      { days: 30, label: "30d" },
      { days: 90, label: "90d" },
    ];

    const stats = periods.map(({ days, label }) => {
      const cutoffDate = format(subDays(today, days - 1), "yyyy-MM-dd");
      const reportsInPeriod = uniqueDates.filter(
        (date) => date >= cutoffDate
      ).length;
      const actualDays = Math.min(days, totalDaysSinceStart);
      const percentage = Math.round((reportsInPeriod / actualDays) * 100);

      return {
        label,
        reports: reportsInPeriod,
        days: actualDays,
        percentage,
      };
    });

    // Total statistics
    const totalReports = uniqueDates.length;
    const totalPercentage = Math.round(
      (totalReports / totalDaysSinceStart) * 100
    );

    // Build display
    const parts = [];

    // Period stats
    for (const stat of stats) {
      const periodDays = parseInt(stat.label.replace("d", ""));
      if (stat.days < periodDays) {
        // Not enough days have passed yet
        continue;
      }
      const emoji =
        stat.percentage >= 80
          ? "🎉"
          : stat.percentage >= 60
          ? "✅"
          : stat.percentage >= 40
          ? "📈"
          : "🌱";
      parts.push(
        `${emoji} ${stat.label}: ${stat.reports}/${stat.days} (${stat.percentage}%)`
      );
    }

    // Add total
    const totalEmoji =
      totalPercentage >= 80 ? "🏆" : totalPercentage >= 60 ? "⭐" : "🎯";
    parts.push(
      `${totalEmoji} All: ${totalReports}/${totalDaysSinceStart} (${totalPercentage}%)`
    );

    cb._md(`📊 **Consistency Tracker** · ${parts.join(" · ")}`);
  } catch (err) {
    // If there's an error, show minimal message
    cb._md("📊 **Consistency Tracker** · Starting fresh!");
  }

  return cb.render();
}
