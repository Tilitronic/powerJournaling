// src/globals.ts
import type { TemplaterApi } from "templater-obsidian";
import type { PowerJournalConfig } from "./pjconfig";

export let tp: TemplaterApi;
export let config: PowerJournalConfig;

/**
 * Initialize global state (tp + config).
 */
export function setGlobals(
  templaterApi: TemplaterApi,
  loadedConfig: PowerJournalConfig
) {
  tp = templaterApi;
  config = loadedConfig;
}

/**
 * Dev logging helper, checks config.devLogging
 */
export function logDev(msg: string) {
  if (config?.devLogging) {
    console.log(`[PJ] ${msg}`);
  }
}
