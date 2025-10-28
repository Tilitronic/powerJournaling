import { merge } from "lodash";

/**
 * Main configuration interface for PowerJournaling.
 * All paths are relative to the vault root unless otherwise specified.
 */
export interface PowerJournalConfig {
  projectDir: string;
  outputDir: string;
  coreDir: string;
  devLogging: boolean;
  devMode: boolean;
  reportFileExtension?: string;
}

export const defaultConfig: PowerJournalConfig = {
  projectDir: "powerJournal",
  outputDir: "reports",
  coreDir: "core",
  devLogging: true,
  devMode: false,
  reportFileExtension: ".pjf.md",
};

// Accepts a config object (or undefined) and merges with defaults
export async function loadConfig(
  userConfig?: Partial<PowerJournalConfig>
): Promise<PowerJournalConfig> {
  if (
    !userConfig ||
    typeof userConfig !== "object" ||
    Array.isArray(userConfig)
  ) {
    return defaultConfig;
  }
  try {
    return merge({}, defaultConfig, userConfig); // deep merge
  } catch (err) {
    console.warn(
      `[PowerJournal] Failed to merge user config, using defaults.`,
      err
    );
    return defaultConfig;
  }
}
