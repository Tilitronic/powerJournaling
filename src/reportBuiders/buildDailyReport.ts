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
  eveningReflection,
  sleepPreparation,
  messageForTomorrow,
} from "src/components/dailyReport";
import { savingService } from "src/services/SavingService";
import { componentScheduler } from "src/services/ComponentScheduler";

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

  // Negative Visualization: Mon/Wed/Fri, or if shown yesterday but not completed
  if (
    await componentScheduler.shouldShowComponent("negative_visualization_done", [
      1, 3, 5,
    ])
  ) {
    noteFragments.push(negativeVisualization());
  }

  // mementoMori is now integrated into priorityPlanning
  noteFragments.push(priorityPlanning());

  // Voluntary Discomfort: Mon/Wed/Fri, or if shown yesterday but not completed
  if (
    await componentScheduler.shouldShowComponent("voluntary_discomfort_done", [
      1, 3, 5,
    ])
  ) {
    noteFragments.push(voluntaryDiscomfort());
  }

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

  // Mindful Moment: Mon/Wed/Fri, or if shown yesterday but not completed
  if (
    await componentScheduler.shouldShowComponent("mindful_pause_taken", [
      1, 3, 5,
    ])
  ) {
    noteFragments.push(mindfulMoment());
  }

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
