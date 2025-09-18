import { habitTracking } from "src/components/dailyReport";
import { savingService } from "src/services/SavingService";
import { config, createLogger } from "../globals"; // 👈 import globals

export function buildDailyReport() {
  const noteFragments = [habitTracking()];
  // console.log("Daily report content:\n", noteFragments.join("\n***\n"));
  // console.log(config);
  savingService.write({
    type: "almostDailyReport",
    data: noteFragments.join("\n***\n"),
  });
}
