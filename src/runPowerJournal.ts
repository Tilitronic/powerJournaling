import { setGlobals, useLogger, LNs } from "./globals";
import type { TemplaterApi } from "templater";
import { loadConfig } from "./pjconfig";
import { onStart } from "./onStart";
import { PowerJournalConfig } from "./pjconfig";

/**
 * Main entry point for running the Power Journal scripts.
 *
 * @param tp - The Templater API object provided by Obsidian.
 * @param configs - Configuration for Power Journal
 *
 * NOTE: We deliberately pass `tp` here and call `setGlobals(tp)` to make `tp`
 * available globally across other modules in our project.
 */
const logger = useLogger(LNs.FileService);

async function runPowerJournal(tp: TemplaterApi, configs: PowerJournalConfig) {
  logger.info("runPowerJournal started");

  // Load config and set globals - everything depends on this
  const config = await loadConfig(configs);
  setGlobals(tp, config);
  logger.dev("Globals set, config loaded");

  // Run the main workflow
  try {
    await onStart();
    logger.info("Power Journal workflow completed successfully");
  } catch (err) {
    logger.error("Error in Power Journal workflow", { error: err });
  }
}

module.exports = runPowerJournal;
