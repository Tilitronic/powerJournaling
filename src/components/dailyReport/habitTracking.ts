import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { statisticsService } from "src/services/StatisticsService";
import { scheduleEvaluator } from "src/services/ScheduleService/ScheduleEvaluator";
import { HabitConfig, habitConfigs } from "src/inputs";
import { PeriodicityUnits as PU } from "src/services/ScheduleService";
import { ReportTypes } from "src/reportDefinitions";

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

          // Simple, objective limit display
          cb._md(
            `**Limit:** ${current}/${max} per ${maxPeriodLabel} (${percentage.toFixed(
              0
            )}%)`
          );
        }
      }
    );

    cb._nl();
    cb._md(
      "Missing once is an accident. Missing twice is the start of a pattern. Return gently."
    );
  } else {
    cb._md("*🎉 All habits completed for this period! Well done!*");
  }

  return cb.render();
}
