import {
  // Statistics & tracking
  consistencyStats,
  // Morning components
  morningReflection,
  negativeVisualization,
  mementoMori,
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
  eveningReflection,
  sleepPreparation,
  messageForTomorrow,
} from "src/components/dailyReport";
import { savingService } from "src/services/SavingService";

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

  const messageYesterday = await messageFromYesterday();
  if (messageYesterday) {
    noteFragments.push(messageYesterday);
  }

  noteFragments.push(morningReflection());
  noteFragments.push(negativeVisualization());
  noteFragments.push(mementoMori());
  noteFragments.push(priorityPlanning());
  noteFragments.push(voluntaryDiscomfort());

  // =============================================================================
  // 📋 DAILY HABITS
  // =============================================================================
  noteFragments.push("\n---\n"); // Major section divider
  noteFragments.push("# 📋 DAILY HABITS");
  noteFragments.push(
    "*Small actions, repeated daily, create remarkable results.*"
  );
  noteFragments.push("\n---\n"); // Major section divider

  noteFragments.push(await habitTracking());

  // =============================================================================
  // 🌙 EVENING SECTION: Reflect & Close the Day
  // =============================================================================
  noteFragments.push("\n---\n"); // Major section divider
  noteFragments.push("# 🌙 EVENING: Reflect & Close the Day");
  noteFragments.push(
    "*Review your day with honesty and gratitude. Learn, grow, prepare.*"
  );
  noteFragments.push("\n---\n"); // Major section divider

  noteFragments.push(accomplishmentsAndObstacles());
  noteFragments.push(attentionAndWillpower());
  noteFragments.push(gratitudeAndSavoring());
  noteFragments.push(mindfulMoment());
  noteFragments.push(emotionAwareness());
  noteFragments.push(await permaPlus());
  noteFragments.push(eveningReflection());
  noteFragments.push(sleepPreparation());
  noteFragments.push(messageForTomorrow());

  // =============================================================================
  // Save the complete report
  // =============================================================================
  savingService.write({
    type: "almostDailyReport",
    data: noteFragments.join("\n"),
  });
}
