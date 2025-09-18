// src/pfconfigs.ts
import fs from "fs-extra";
import { merge } from "lodash";
import { Habit } from "./types";
import { habits } from "./habits";
import { wellbeingParameters } from "./wellbeingParameters";
import { WellbeingParameter } from "./types";

export interface PowerJournalConfig {
  projectDir: string;
  componentsPath: string;
  outputDir: string;
  scriptsDir: string;
  databaseDir: "database";
  reportFolderPairs: { folder: string; report: string }[];
  componentVariables: Record<string, any>;
  habits: Habit[] | [];
  wellbeingParameters: WellbeingParameter[] | [];
  devLogging: boolean;
}

export const defaultConfig: PowerJournalConfig = {
  projectDir: "powerJournal",
  componentsPath: "components",
  outputDir: "reports",
  scriptsDir: "scripts",
  databaseDir: "database",
  reportFolderPairs: [
    { folder: "l1almostDailyReport", report: "almostDailyReport" },
    { folder: "l2tenL1ReportsReview", report: "10daysReport" },
    { folder: "l3ThreeL2Review", report: "30daysReport" },
    { folder: "l4FiveL3Review", report: "150daysReport" },
  ],
  componentVariables: {},
  devLogging: true,
  habits: habits,
  wellbeingParameters: wellbeingParameters,
};

export async function loadConfig(
  configFilePath?: string
): Promise<PowerJournalConfig> {
  if (!configFilePath) {
    return defaultConfig;
  }
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
