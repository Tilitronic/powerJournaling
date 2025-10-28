import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { statisticsService } from "src/services/StatisticsService";
import { scheduleEvaluator } from "src/services/ScheduleService/ScheduleEvaluator";
import { HabitConfig, habitConfigs } from "src/inputs";
import { PeriodicityUnits as PU } from "src/services/ScheduleService";
import { ReportTypes } from "src/reportDefinitions";

/**
 * Get the start date of the current period for a habit
 */
function getPeriodStartDate(habit: HabitConfig): string {
  const now = new Date();

  // Extract periodicity unit from schedule.target.per
  const unit = habit.schedule?.target?.per.unit || PU.Day;

  switch (unit) {
    case PU.Day:
      // For daily habits, period is just today
      return now.toISOString().split("T")[0];

    case PU.Week:
      // Week starts on Monday
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return monday.toISOString().split("T")[0];

    case PU.Month:
      // Month starts on the 1st
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-01`;

    case PU.Quarter:
      // Quarter starts on Jan 1, Apr 1, Jul 1, or Oct 1
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = quarter * 3 + 1;
      return `${now.getFullYear()}-${String(quarterStartMonth).padStart(
        2,
        "0"
      )}-01`;

    case PU.Year:
      // Year starts on Jan 1
      return `${now.getFullYear()}-01-01`;

    case PU.Decade:
      // Decade starts on year ending in 0 (e.g., 2020, 2030)
      const decadeStartYear = Math.floor(now.getFullYear() / 10) * 10;
      return `${decadeStartYear}-01-01`;

    default:
      return now.toISOString().split("T")[0];
  }
}

/**
 * Get the start date for a custom period (used for maxLimit calculations)
 */
function getCustomPeriodStartDate(
  periodicityMultiplier: number,
  periodicityUnit: string
): string {
  const now = new Date();

  switch (periodicityUnit) {
    case PU.Day:
      const daysAgo = new Date(now);
      daysAgo.setDate(now.getDate() - periodicityMultiplier);
      return daysAgo.toISOString().split("T")[0];

    case PU.Week:
      const weeksAgo = new Date(now);
      weeksAgo.setDate(now.getDate() - periodicityMultiplier * 7);
      return weeksAgo.toISOString().split("T")[0];

    case PU.Month:
      const monthsAgo = new Date(now);
      monthsAgo.setMonth(now.getMonth() - periodicityMultiplier);
      return monthsAgo.toISOString().split("T")[0];

    case PU.Quarter:
      const quartersAgo = new Date(now);
      quartersAgo.setMonth(now.getMonth() - periodicityMultiplier * 3);
      return quartersAgo.toISOString().split("T")[0];

    case PU.Year:
      const yearsAgo = new Date(now);
      yearsAgo.setFullYear(now.getFullYear() - periodicityMultiplier);
      return yearsAgo.toISOString().split("T")[0];

    default:
      return now.toISOString().split("T")[0];
  }
}

export async function habitTracking() {
  const componentId = "habitTracking";
  const cb = new ComponentBuilder(componentId);

  // Use ScheduleEvaluator to filter habits and get progress
  const habitProgressPromises = habitConfigs.map(async (habit) => {
    const shouldShow = await scheduleEvaluator.shouldShowInput(habit);

    if (!shouldShow) {
      return null;
    }

    const progress = await scheduleEvaluator.getInputProgress(habit);

    return {
      habit,
      completedCount: progress.targetProgress?.current || 0,
      targetCount: habit.schedule?.target?.count || 1,
      isComplete: progress.targetProgress?.isComplete || false,
      shouldShow: true,
      maxLimitProgress: progress.limitProgress
        ? {
            current: progress.limitProgress.current,
            max: progress.limitProgress.limit,
            percentage: progress.limitProgress.percentage,
          }
        : null,
    };
  });

  const habitProgressResults = await Promise.all(habitProgressPromises);
  const habitsToShow = habitProgressResults.filter(
    (hp) => hp !== null
  ) as Array<{
    habit: HabitConfig;
    completedCount: number;
    targetCount: number;
    isComplete: boolean;
    shouldShow: boolean;
    maxLimitProgress: {
      current: number;
      max: number;
      percentage: number;
    } | null;
  }>;

  // Fetch historical data for statistics (only for habits we're showing)
  const habitIds = habitsToShow.map((hp) => hp.habit.id);
  let showStatistics = false;

  try {
    const allHabitData = await dbService.getInputsLastNReports(
      ReportTypes.ALMOST_DAILY,
      habitIds,
      10
    );

    // Only show statistics section if we have data for at least one habit
    showStatistics = allHabitData.length > 0;

    if (showStatistics) {
      cb._md("## 📊 Habit Statistics (Last 10 Reports)");

      // Show statistics for each habit that we're displaying today
      for (const { habit } of habitsToShow) {
        const habitData = allHabitData.filter(
          (input) => input.inputId === habit.id
        );

        if (habitData.length >= 2) {
          // Only show if we have at least 2 data points
          const values = habitData.map(
            (input) => input.value as boolean | null
          );

          const stats = statisticsService.booleanStatistics(values);
          const sparkline = statisticsService.createSparkline(
            values.map((v) => (v === true ? 1 : 0))
          );

          // Compact statistics display - single line
          cb._md(
            `**${habit.label}:** ${stats.truePercentage.toFixed(0)}% (${
              stats.trueCount
            }/${stats.count}) · ${sparkline} · ${
              stats.currentStreakType === "true" ? "✨" : "❄️"
            } ${stats.currentStreak} streak`
          );
        }
      }

      cb._divider();
    }
  } catch (error) {
    console.error("Failed to fetch habit statistics:", error);
  }

  // Today's habits section
  cb._md("## ✅ Today's Habits (📌 CORE - 1 min)");

  cb._foldable(
    `**Atomic Habits** — every habit = Cue → Craving → Response → Reward.
**Taoist Wu Wei** — not perfection, but flow. Missed habits are okay—just return gently.
**Power of Habit** — the cue and reward make habits stick, not willpower alone.

**Check when complete:**`
  );

  if (habitsToShow.length > 0) {
    habitsToShow.forEach(
      ({ habit, completedCount, maxLimitProgress, targetCount }) => {
        // Check if this is a simple daily habit (1 per day)
        const perCount = habit.schedule?.target?.per.count || 1;
        const perUnit = habit.schedule?.target?.per.unit || PU.Day;
        const isSimpleDaily =
          targetCount === 1 && perCount === 1 && perUnit === PU.Day;

        let habitLabel: string;

        if (isSimpleDaily) {
          // For simple daily habits, just show the label without progress
          habitLabel = habit.label;
        } else {
          // For all other habits, show progress
          // Generate period label with proper singular/plural
          let periodLabel: string;
          if (perCount === 1) {
            periodLabel = perUnit;
          } else {
            // Add 's' for plural (day→days, week→weeks, etc.)
            periodLabel = `${perCount} ${perUnit}s`;
          }

          // Show progress inline: "Exercise (2/5 per week)"
          habitLabel = `${habit.label} (${completedCount}/${targetCount} per ${periodLabel})`;
        }

        cb._input(habit.inputOptions);

        cb._md(`*Cue*: ${habit.cue} · *Reward*: ${habit.reward}`);

        // Show max limit progress if defined
        if (maxLimitProgress) {
          const { current, max, percentage } = maxLimitProgress;

          // Generate period label for max limit
          let maxPeriodLabel: string;
          const limitPerCount = habit.schedule?.limit?.per.count || 1;
          const limitPerUnit = habit.schedule?.limit?.per.unit || "day";
          if (limitPerCount === 1) {
            maxPeriodLabel = limitPerUnit;
          } else {
            maxPeriodLabel = `${limitPerCount} ${limitPerUnit}s`;
          }

          // Create visual progress bar (20 characters wide)
          const barWidth = 20;
          const filledWidth = Math.round((current / max) * barWidth);
          const emptyWidth = barWidth - filledWidth;
          const progressBar = "█".repeat(filledWidth) + "░".repeat(emptyWidth);

          // Determine warning emoji and color based on percentage
          let statusEmoji = "✅";
          let warningText = "";
          if (percentage >= 100) {
            statusEmoji = "🚫";
            warningText = " **LIMIT REACHED**";
          } else if (percentage >= 80) {
            statusEmoji = "⚠️";
            warningText = " **Approaching limit**";
          } else if (percentage >= 60) {
            statusEmoji = "⚡";
          }

          cb._md(
            `${statusEmoji} **Limit tracker:** ${current}/${max} times per ${maxPeriodLabel} · ${progressBar} ${percentage.toFixed(
              0
            )}%${warningText}`
          );
        }
      }
    );

    cb._md(
      "**Wisdom** — missing once is an accident. Missing twice is the start of a pattern. Return gently."
    );
  } else {
    cb._md("*🎉 All habits completed for this period! Well done!*");
  }

  return cb.render();
}
