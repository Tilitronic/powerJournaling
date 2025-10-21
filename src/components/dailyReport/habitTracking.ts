import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { statisticsService } from "src/services/StatisticsService";

export async function habitTracking() {
  const componentName = "habitTracking";
  const cb = new ComponentBuilder(componentName);
  const habits = config.habits;

  // Get active habits
  const activeHabits = habits.filter((h) => h.active);

  // Fetch historical data for all habits
  const habitIds = activeHabits.map((h) => h.id);
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

      // Show statistics for each habit that has data
      for (const habit of activeHabits) {
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

  activeHabits.forEach((habit) => {
    cb._boolean(habit.id, habit.label);
    cb._md(`*Cue*: ${habit.cue} · *Reward*: ${habit.reward}`);
  });

  if (activeHabits.length > 0) {
    cb._md(
      "> **Wisdom** — missing once is an accident. Missing twice is the start of a pattern. Return gently."
    );
  } else {
    cb._md("*No active habits configured. Add habits in your config file.*");
  }

  return cb.render();
}
