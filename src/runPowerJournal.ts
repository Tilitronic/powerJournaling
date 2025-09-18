import { setGlobals } from "./globals";
import type { TemplaterApi } from "templater-obsidian";
import { loadConfig } from "./pjconfig";
import { onStart } from "./onStart";
import { buildDailyReport } from "./reportBuiders/buildDailyReport";
import { DevLog } from "./globals";
/**
 * Main entry point for running the Power Journal scripts.
 *
 * @param tp - The Templater API object provided by Obsidian.
 *
 * NOTE: We deliberately pass `tp` here and call `setGlobals(tp)` to make `tp`
 * available globally across other modules in our project.
 * This is a conscious pattern that relies on JS module evaluation order:
 * top-level code in modules can access the globally set `tp` safely after this call.
 *
 * This allows other scripts/functions to use the `tp` object without passing it around everywhere,
 * while still keeping Templater happy (all user scripts must receive `tp` as a parameter).
 */

const dl = new DevLog("runPowerJournal");
async function runPowerJournal(tp: TemplaterApi, configFilePath = "") {
  console.log("[PowerJournal] runPowerJournal started");
  const config = await loadConfig(configFilePath); //EVERYTHING that uses config must be executed AFTER this line being run
  setGlobals(tp, config);
  dl.l("Globals set, config loaded.");
  onStart();
  buildDailyReport();
}

module.exports = runPowerJournal; // important for Templater
