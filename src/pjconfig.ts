// src/pfconfigs.ts
import fs from "fs-extra";
import { merge } from "lodash";

export interface PowerJournalConfig {
  projectDir: string;
  componentsPath: string;
  outputDir: string;
  scriptsDir: string;
  reportFolderPairs: { folder: string; report: string }[];
  componentVariables: Record<string, any>;
  devLogging: boolean;
}

export const defaultConfig: PowerJournalConfig = {
  projectDir: "PowerJournaling",
  componentsPath: "components",
  outputDir: "reports",
  scriptsDir: "scripts",
  reportFolderPairs: [],
  componentVariables: {},
  devLogging: false,
};

export async function loadConfig(
  configFilePath?: string
): Promise<PowerJournalConfig> {
  if (!configFilePath) return defaultConfig;

  try {
    const userConfig = await fs.readJson(configFilePath);
    return merge({}, defaultConfig, userConfig); // deep merge
  } catch (err) {
    console.warn(
      `[PowerJournal] Failed to load config at ${configFilePath}, using defaults.`,
      err
    );
    return defaultConfig;
  }
}
