import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { statisticsService } from "src/services/StatisticsService";
import { Habit, PeriodicityUnit } from "src/types/Habits";

/**
 * Get the start date of the current period for a habit
 */
function getPeriodStartDate(habit: Habit): string {
  const now = new Date();

  switch (habit.periodicityUnit) {
    case PeriodicityUnit.Day:
      // For daily habits, period is just today
      return now.toISOString().split("T")[0];

    case PeriodicityUnit.Week:
      // Week starts on Monday
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return monday.toISOString().split("T")[0];

    case PeriodicityUnit.Month:
      // Month starts on the 1st
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-01`;

    case PeriodicityUnit.Quarter:
      // Quarter starts on Jan 1, Apr 1, Jul 1, or Oct 1
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = quarter * 3 + 1;
      return `${now.getFullYear()}-${String(quarterStartMonth).padStart(
        2,
        "0"
      )}-01`;

    case PeriodicityUnit.Year:
      // Year starts on Jan 1
      return `${now.getFullYear()}-01-01`;

    case PeriodicityUnit.Decade:
      // Decade starts on year ending in 0 (e.g., 2020, 2030)
      const decadeStartYear = Math.floor(now.getFullYear() / 10) * 10;
      return `${decadeStartYear}-01-01`;

    default:
      return now.toISOString().split("T")[0];
  }
}

/**
 * Calculate how many times a habit has been completed in the current period
 */
async function getHabitProgressInPeriod(habit: Habit): Promise<number> {
  const periodStart = getPeriodStartDate(habit);

  // Get all inputs for this habit from the database
  const allInputs = await dbService.getInputsByName(
    "almostDailyReport",
    habit.id
  );

  // Filter inputs that are within the current period
  const periodInputs = allInputs.filter((input) => {
    return input.reportDate && input.reportDate >= periodStart;
  });

  // Count how many times the habit was checked (value === true)
  const completionCount = periodInputs.filter(
    (input) => input.value === true
  ).length;

  return completionCount;
}

export async function habitTracking() {
  const componentName = "habitTracking";
  const cb = new ComponentBuilder(componentName);
  const habits = config.habits;

  // Get active habits
  const activeHabits = habits.filter((h) => h.active);

  // Calculate progress for each habit and filter out completed non-permanent habits
  const habitProgress = await Promise.all(
    activeHabits.map(async (habit) => {
      const completedCount = await getHabitProgressInPeriod(habit);
      return {
        habit,
        completedCount,
        isComplete: completedCount >= habit.targetCount,
        shouldShow: habit.permanent || completedCount < habit.targetCount,
      };
    })
  );

  // Filter habits to show (not completed OR permanent)
  const habitsToShow = habitProgress.filter((hp) => hp.shouldShow);

  // Fetch historical data for statistics (only for habits we're showing)
  const habitIds = habitsToShow.map((hp) => hp.habit.id);
  let showStatistics = false;

  try {
    const allHabitData = await dbService.getInputsLastNReports(
      "almostDailyReport",
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
          (input) => input.inputName === habit.id
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

  cb._guidance(
    `**Atomic Habits** — every habit = Cue → Craving → Response → Reward.
**Taoist Wu Wei** — not perfection, but flow. Missed habits are okay—just return gently.
**Power of Habit** — the cue and reward make habits stick, not willpower alone.

**Check when complete:**`
  );

  if (habitsToShow.length > 0) {
    habitsToShow.forEach(({ habit, completedCount }) => {
      // Check if this is a simple daily habit (1 per day)
      const isSimpleDaily =
        habit.targetCount === 1 &&
        habit.periodicityMultiplier === 1 &&
        habit.periodicityUnit === PeriodicityUnit.Day;

      let habitLabel: string;

      if (isSimpleDaily) {
        // For simple daily habits, just show the label without progress
        habitLabel = habit.label;
      } else {
        // For all other habits, show progress
        // Generate period label with proper singular/plural
        let periodLabel: string;
        if (habit.periodicityMultiplier === 1) {
          periodLabel = habit.periodicityUnit;
        } else {
          // Add 's' for plural (day→days, week→weeks, etc.)
          periodLabel = `${habit.periodicityMultiplier} ${habit.periodicityUnit}s`;
        }

        // Show progress inline: "Exercise (2/5 per week)"
        habitLabel = `${habit.label} (${completedCount}/${habit.targetCount} per ${periodLabel})`;
      }

      cb._boolean(habit.id, habitLabel);
      cb._md(`*Cue*: ${habit.cue} · *Reward*: ${habit.reward}`);
    });

    cb._md(
      "> **Wisdom** — missing once is an accident. Missing twice is the start of a pattern. Return gently."
    );
  } else {
    cb._md("*🎉 All habits completed for this period! Well done!*");
  }

  return cb.render();
}
