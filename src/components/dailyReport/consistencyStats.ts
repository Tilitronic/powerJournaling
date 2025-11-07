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

    // Find the first and last report dates
    const firstReportDate = uniqueDates[uniqueDates.length - 1];
    const lastReportDate = uniqueDates[0];
    const firstDate = new Date(firstReportDate);
    const lastDate = new Date(lastReportDate);

    // Count days from first report to last report (inclusive)
    // Don't count today if no report yet
    const totalDaysSinceStart = differenceInDays(lastDate, firstDate) + 1;

    // Calculate statistics for different time periods
    const periods = [
      { days: 7, label: "7d" },
      { days: 30, label: "30d" },
      { days: 90, label: "90d" },
    ];

    const stats = periods.map(({ days, label }) => {
      // Calculate how many days to actually look back (don't go before first report)
      const actualDays = Math.min(days, totalDaysSinceStart);
      // Use lastDate instead of today - we count up to the last filled report
      const cutoffDate = format(
        subDays(lastDate, actualDays - 1),
        "yyyy-MM-dd"
      );

      // Count reports in this period
      const reportsInPeriod = uniqueDates.filter(
        (date) => date >= cutoffDate
      ).length;

      const percentage = Math.round((reportsInPeriod / actualDays) * 100);

      return {
        label,
        requestedDays: days,
        reports: reportsInPeriod,
        days: actualDays,
        percentage,
        shouldShow: false, // Will be calculated below
      };
    });

    // Determine which periods to show:
    // 1. Don't show periods where we don't have enough days tracked yet
    // 2. Don't show periods that are covered by a smaller period (when actualDays match)
    for (let i = 0; i < stats.length; i++) {
      const current = stats[i];

      // Don't show if we haven't reached the requested period yet
      if (current.days < current.requestedDays) {
        continue;
      }

      // Don't show if a smaller period already covers the same range
      const smallerPeriodCoversAll = stats
        .slice(0, i)
        .some((prev) => prev.shouldShow && prev.days === current.days);

      if (smallerPeriodCoversAll) {
        continue;
      }

      current.shouldShow = true;
    }

    // Total statistics
    const totalReports = uniqueDates.length;
    const totalPercentage = Math.round(
      (totalReports / totalDaysSinceStart) * 100
    );

    // Build display
    const parts = [];

    // Period stats (show if tracking for at least 7 days or full period)
    for (const stat of stats) {
      if (!stat.shouldShow) continue;

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

    // Add total (always show)
    const totalEmoji =
      totalPercentage >= 80 ? "🏆" : totalPercentage >= 60 ? "⭐" : "🎯";
    parts.push(
      `${totalEmoji} All: ${totalReports}/${totalDaysSinceStart} (${totalPercentage}%)`
    );

    cb._md(`📊 **Consistency Tracker** · ${parts.join(" · ")}`);
  } catch (err) {
    console.error("Consistency stats error:", err);
    // If there's an error, show minimal message
    cb._md("📊 **Consistency Tracker** · Starting fresh!");
  }

  return await cb.render();
}
