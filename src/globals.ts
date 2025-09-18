// src/globals.ts
import type { TemplaterApi } from "templater-obsidian";
import type { PowerJournalConfig } from "./pjconfig";
import { App } from "obsidian";

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

export function createLogger(prefix: string) {
  return (message: string) => {
    logDev(`[${prefix}] ${message}`);
  };
}

export class DevLog {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  l(message: string) {
    if (config?.devLogging) {
      console.log(`[PJ][${this.prefix}] ${message}`);
    }
  }
}

//@ts-expect-error app is global in Obsidian
export const obApp = app as App;
