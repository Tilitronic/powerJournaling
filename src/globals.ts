// src/globals.ts
import type { TemplaterApi } from "templater";
import type { PowerJournalConfig } from "./pjconfig";
import type { App } from "obsidian";
import {
  LoggerService,
  LoggerName,
  LoggerNames,
} from "./services/LoggerService";

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

//TODO: rewrite all devlogging to this loggerService
export const loggerService = new LoggerService(() => config);
export function useLogger(prefix: LoggerName) {
  return loggerService.withPrefix(prefix);
}
export const LNs = LoggerNames;

//@ts-expect-error app is global in Obsidian
export const obApp = app as App;
