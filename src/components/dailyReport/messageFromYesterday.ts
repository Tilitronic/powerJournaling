import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";

export async function messageFromYesterday() {
  const componentName = "messageFromYesterday";
  const cb = new ComponentBuilder(componentName);

  const lastData = await dbService.getInputsLastNReports(
    "almostDailyReport",
    ["message_for_tomorrow", "tomorrow_priority"],
    1 // Get the last report
  );

  // Separate message and priority
  const lastMessage = lastData.find(
    (item) => item.inputName === "message_for_tomorrow"
  );
  const lastPriority = lastData.find(
    (item) => item.inputName === "tomorrow_priority"
  );

  const hasMessage =
    lastMessage && (lastMessage.value as string)?.trim().length > 0;
  const hasPriority =
    lastPriority && (lastPriority.value as string)?.trim().length > 0;

  // Only render if there's something to show
  if (!hasMessage && !hasPriority) {
    return "";
  }

  cb._md("## 📨 Message from Your Past Self (⭐ RECOMMENDED - 30 sec)");

  // Show priority if exists
  if (hasPriority) {
    const priorityText = lastPriority.value as string;
    cb._md(`### 🎯 Today's Priority (set ${lastPriority.reportDate})`);
    cb._md(`> ${priorityText}`);
  }

  // Show message if exists
  if (hasMessage) {
    const messageText = lastMessage.value as string;
    cb._md(`### 💌 Message (from ${lastMessage.reportDate})`);
    cb._md(`> ${messageText}`);
  }

  cb._guidance(
    `Your past self sent you guidance! Take a moment to reflect on it.`,
    "A Gift from Yesterday"
  );

  return cb.render();
}
