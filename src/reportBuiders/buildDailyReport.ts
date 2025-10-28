import {
  // Statistics & tracking
  consistencyStats,
  // Morning components
  morningReflection,
  negativeVisualization,
  priorityPlanning,
  voluntaryDiscomfort,
  // Throughout day
  habitTracking,
  messageFromYesterday,
  // Evening components
  accomplishmentsAndObstacles,
  attentionAndWillpower,
  gratitudeAndSavoring,
  mindfulMoment,
  emotionAwareness,
  permaPlus,
  messageForTomorrow,
} from "src/components/dailyReport";
import { savingService } from "src/services/SavingService";
import { ReportTypes } from "src/reportDefinitions";

export async function buildDailyReport() {
  const noteFragments = [];

  // =============================================================================
  // 📊 CONSISTENCY TRACKER
  // =============================================================================
  noteFragments.push(await consistencyStats());

  // =============================================================================
  // 🌅 MORNING SECTION: Set the Day
  // =============================================================================
  noteFragments.push("\n---\n"); // Major section divider
  noteFragments.push("# 🌅 MORNING: Set the Day");
  noteFragments.push(
    "*Win the morning, win the day. Start with intention and clarity.*"
  );
  noteFragments.push("\n---\n"); // Major section divider

  noteFragments.push(await messageFromYesterday());
  noteFragments.push(await morningReflection());
  noteFragments.push(await negativeVisualization());
  noteFragments.push(await mindfulMoment());
  noteFragments.push(await priorityPlanning());

  // =============================================================================
  // 📋 DAILY HABITS & PRACTICES
  // =============================================================================
  noteFragments.push("\n---\n"); // Major section divider
  noteFragments.push("# 📋 DAILY HABITS & PRACTICES");
  noteFragments.push(
    "*Small actions, repeated daily, create remarkable results.*"
  );
  noteFragments.push("\n---\n"); // Major section divider

  noteFragments.push(await habitTracking());
  noteFragments.push(await voluntaryDiscomfort());

  // =============================================================================
  // 🌙 EVENING SECTION: Reflect & Close the Day
  // =============================================================================
  noteFragments.push("\n---\n"); // Major section divider
  noteFragments.push("# 🌙 EVENING: Reflect & Close the Day");
  noteFragments.push(
    "*Review your day with honesty and gratitude. Learn, grow, prepare.*"
  );
  noteFragments.push("\n---\n"); // Major section divider

  noteFragments.push(await accomplishmentsAndObstacles());
  noteFragments.push(await attentionAndWillpower());
  noteFragments.push(await gratitudeAndSavoring());
  noteFragments.push(await emotionAwareness());
  noteFragments.push(await permaPlus());
  noteFragments.push(await messageForTomorrow());

  // =============================================================================
  // Save the complete report
  // =============================================================================
  savingService.write({
    type: ReportTypes.ALMOST_DAILY,
    data: noteFragments.join("\n"),
  });
}
