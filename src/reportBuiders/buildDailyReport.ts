import { habitTracking } from "src/components/dailyReport";
import { savingService } from "src/services/SavingService";

export async function buildDailyReport() {
  const noteFragments = [await habitTracking()];
  // console.log("Daily report content:\n", noteFragments.join("\n***\n"));
  // console.log(config);
  savingService.write({
    type: "almostDailyReport",
    data: noteFragments.join("\n***\n"),
  });
}
