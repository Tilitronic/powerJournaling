import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { inputsObj as ips } from "src/inputs";
import { format, parse } from "date-fns";

// Helper to format ISO date to DD.MM.YYYY
const formatDate = (isoDate: string) => {
  try {
    const date = parse(isoDate, "yyyy-MM-dd", new Date());
    return format(date, "dd.MM.yyyy");
  } catch {
    return isoDate; // Return as-is if parsing fails
  }
};

export async function messageFromYesterday() {
  const componentId = "messageFromYesterday";
  const cb = new ComponentBuilder(componentId);

  const lastData = await dbService.getInputsLastNReports({
    inputIds: [ips.message_for_tomorrow.id, ips.tomorrow_priority.id],
    count: 1,
  });

  // Separate message and priority
  const lastMessage = lastData.find(
    (item) => item.inputId === ips.message_for_tomorrow.id
  );
  const lastPriority = lastData.find(
    (item) => item.inputId === ips.tomorrow_priority.id
  );

  const hasMessage =
    lastMessage && (lastMessage.value as string)?.trim().length > 0;
  const hasPriority =
    lastPriority && (lastPriority.value as string)?.trim().length > 0;

  // Only render if there's something to show
  if (!hasMessage && !hasPriority) {
    return "";
  }

  cb._md("## 📨 Message from Your Past Self (⭐ RECOMMENDED)");

  // Show priority if exists
  if (hasPriority) {
    const priorityText = lastPriority.value as string;
    const priorityDate = formatDate(lastPriority.reportDate);
    cb._md(`### 🎯 Today's Priority (set ${priorityDate})`);
    cb._md(`> ${priorityText}`);
  }

  // Show message if exists
  if (hasMessage) {
    const messageText = lastMessage.value as string;
    const messageDate = formatDate(lastMessage.reportDate);
    cb._md(`### 💌 Message (from ${messageDate})`);
    cb._md(`> ${messageText}`);
  }

  return await cb.render();
}
