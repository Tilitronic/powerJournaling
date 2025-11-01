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

  // Today's habits section
  cb._md("## ✅ Today's Habits (📌 CORE)");

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

        // Build label with target and limit info
        let labelParts: string[] = [habit.label];

        // Add target info if not a simple daily habit
        if (!isSimpleDaily) {
          let periodLabel: string;
          if (perCount === 1) {
            periodLabel = perUnit;
          } else {
            periodLabel = `${perCount} ${perUnit}s`;
          }
          labelParts.push(
            `target: ${completedCount}/${targetCount} per ${periodLabel}`
          );
        }

        // Add limit info if present
        if (maxLimitProgress) {
          const { current, max } = maxLimitProgress;
          const limitPerCount = habit.schedule?.limit?.per.count || 1;
          const limitPerUnit = habit.schedule?.limit?.per.unit || "day";
          const maxPeriodLabel =
            limitPerCount === 1
              ? limitPerUnit
              : `${limitPerCount} ${limitPerUnit}s`;

          labelParts.push(`limit: ${current}/${max} per ${maxPeriodLabel}`);
        }

        // Create updated input options with enriched label
        const updatedInputOptions = {
          ...habit.inputOptions,
          label: labelParts.join(" · "),
        };

        cb._input(updatedInputOptions);

        cb._md(`*Cue*: ${habit.cue} · *Reward*: ${habit.reward}`);
      }
    );

    cb._nl();
    cb._md(
      "Missing once is an accident. Missing twice is the start of a pattern. Return gently."
    );
  } else {
    cb._md("*🎉 All habits completed for this period! Well done!*");
  }

  // Fetch historical data for detailed statistics (only for habits we're showing)
  const habitIds = habitsToShow.map((hp) => hp.habit.id);
  let showStatistics = false;

  try {
    const allHabitData = await dbService.getInputsLastNReports({
      inputIds: habitIds,
      count: 10,
    });

    // Only show statistics section if we have data for at least one habit
    showStatistics = allHabitData.length > 0;

    if (showStatistics) {
      cb._divider();

      let statisticsContent = "";

      // Build statistics for each habit that we're displaying today
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
          statisticsContent += `**${
            habit.label
          }:** ${stats.truePercentage.toFixed(0)}% (${stats.trueCount}/${
            stats.count
          }) · ${sparkline} · ${
            stats.currentStreakType === "true" ? "✨" : "❄️"
          } ${stats.currentStreak} streak\n`;
        }
      }

      cb._foldable(
        statisticsContent.trim(),
        "📊 Habit Statistics (Last 10 Reports)"
      );
    }
  } catch (error) {
    console.error("Failed to fetch habit statistics:", error);
  }

  return await cb.render();
}
