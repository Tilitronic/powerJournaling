import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { statisticsService } from "src/services/StatisticsService";

export async function habitTracking() {
  const componentName = "habitTracking";
  const cb = new ComponentBuilder(componentName);
  const habits = config.habits;

  // Show exercise statistics with visualizations
  try {
    const exerciseData = await dbService.getInputsLastNReports(
      "almostDailyReport",
      ["exercise"],
      30
    );

    if (exerciseData.length > 0) {
      // Extract boolean values and dates from the data
      const values = exerciseData.map((input) => input.value as boolean | null);
      const dates = exerciseData.map((input) => input.reportDate || "");

      // Create full visual report with date context
      // Only show charts that make sense based on data points
      const report = statisticsService.createBooleanVisualReport(
        values,
        "Exercise Habit",
        {
          showSparkline: values.length >= 2,
          showBarChart: true,
          showAsciiChart: values.length >= 3,
          showPieChart: values.length >= 2,
          dates: dates, // Pass dates for time axis context
        }
      );

      cb._md(report);
    } else {
      cb._md(
        "## 📊 Exercise Habit\n\n*No exercise data yet. Start tracking today!*"
      );
    }
  } catch (error) {
    cb._md("## 📊 Exercise Habit\n\n*Unable to load exercise history*");
  }

  cb._md("---\n## 📝 Today's Habits");

  habits.forEach((habit) => {
    if (!habit.active) return;

    cb._boolean(habit.id, habit.label);
    cb._md(`*Cue*. ${habit.cue} · *Reward*. ${habit.reward}`);
  });

  cb._md("---\n## 🧪 Test Inputs");
  cb._text("Test Text Input");
  cb._md("***");
  cb._number("Test Number Input 1");
  cb._md("***");
  cb._number("Test Number Input 2");
  cb._md("***");
  cb._multiCheckbox("Test MultiCheckbox Input", [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
    { label: "Option 3", value: "option_3" },
  ]);
  cb._md("***");
  cb._richText("Test Rich Text Input");

  return cb.render();
}
