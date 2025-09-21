import { setGlobals, useLogger, LNs } from "./globals";
import type { TemplaterApi } from "templater";
import { loadConfig } from "./pjconfig";
import { onStart } from "./onStart";
import { buildDailyReport } from "./reportBuiders/buildDailyReport";
import { inputCollector } from "./services/InputCollectorService";
import { PowerJournalConfig } from "./pjconfig";

/**
 * Main entry point for running the Power Journal scripts.
 *
 * @param tp - The Templater API object provided by Obsidian.
 *
 * NOTE: We deliberately pass `tp` here and call `setGlobals(tp)` to make `tp`
 * available globally across other modules in our project.
 */
const logger = useLogger(LNs.FileService); // or create a new LoggerName for this module

async function runPowerJournal(tp: TemplaterApi, configs: PowerJournalConfig) {
  logger.info("runPowerJournal started");

  const config = await loadConfig(configs); // Everything using config must run after this
  setGlobals(tp, config);

  logger.dev("Globals set, config loaded");

  try {
    onStart();
    logger.dev("onStart executed successfully");
  } catch (err) {
    logger.error("Error running onStart", { error: err });
  }

  let collectedInputs = null;
  try {
    collectedInputs = await inputCollector.collectFromYesterday();
    logger.dev("Input collection completed", { collected: collectedInputs });
  } catch (err) {
    logger.error("Error collecting inputs", { error: err });
  }

  try {
    buildDailyReport();
    logger.dev("Daily report built successfully");
  } catch (err) {
    logger.error("Error building daily report", { error: err });
  }
}

module.exports = runPowerJournal;
