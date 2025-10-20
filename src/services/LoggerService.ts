// src/services/LoggerService.ts
import { PowerJournalConfig } from "src/pjconfig";

export type LogLevel = "dev" | "info" | "warn" | "error";

export const LoggerNames = {
  ComponentBuilder: "ComponentBuilder",
  SavingService: "SavingService",
  TagsService: "TagsService",
  InputCreator: "InputCreator",
  FileService: "FileService",
  OnStart: "OnStart",
  InputCollector: "InputCollector",
  ValueExtractor: "ValueExtractor",
  DbService: "DbService",
  StatisticsService: "StatisticsService",
} as const;

export type LoggerName = (typeof LoggerNames)[keyof typeof LoggerNames];

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  service: LoggerName | "global";
  message: string;
  meta?: Record<string, any>;
}

export interface LoggerConfig {
  [service: string]: Partial<Record<LogLevel, boolean>>;
}

/**
 * Default logger configuration with all services and all levels enabled.
 * Use this as a reference to toggle specific services/levels off during development.
 */
export const defaultLoggerConfig: LoggerConfig = {
  [LoggerNames.ComponentBuilder]: {
    dev: false,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.SavingService]: {
    dev: true,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.TagsService]: {
    dev: false,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.InputCreator]: {
    dev: false,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.FileService]: { dev: true, info: true, warn: true, error: true },
  [LoggerNames.OnStart]: { dev: true, info: true, warn: true, error: true },
  [LoggerNames.InputCollector]: {
    dev: true,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.ValueExtractor]: {
    dev: true,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.DbService]: {
    dev: true,
    info: true,
    warn: true,
    error: true,
  },
  [LoggerNames.StatisticsService]: {
    dev: true,
    info: true,
    warn: true,
    error: true,
  },
};

// 🎨 ANSI colors
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  gray: "\x1b[90m",
  purple: "\x1b[35m",
};

// 🎨 Background colors per log level
const levelColors: Record<LogLevel, string> = {
  dev: "\x1b[44m\x1b[37m", // blue bg + white text
  info: "\x1b[42m\x1b[30m", // green bg + black text
  warn: "\x1b[43m\x1b[30m", // yellow bg + black text
  error: "\x1b[41m\x1b[37m", // red bg + white text
};

// ✨ Emojis per log level
const levelEmojis: Record<LogLevel, string> = {
  dev: "🛠",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
};

// 🎨 Service colors (dynamic assignment)
const serviceColors: Record<string, string> = {};
const palette = [
  "\x1b[36m", // cyan
  "\x1b[33m", // yellow
  "\x1b[32m", // green
  "\x1b[34m", // blue
  "\x1b[31m", // red
  "\x1b[95m", // magenta bright
  "\x1b[96m", // cyan bright
  "\x1b[92m", // green bright
  "\x1b[93m", // yellow bright
];
let paletteIndex = 0;

function getServiceColor(service: string): string {
  if (!serviceColors[service]) {
    serviceColors[service] = palette[paletteIndex % palette.length];
    paletteIndex++;
  }
  return serviceColors[service];
}

export class LoggerService {
  private logs: LogEntry[] = [];
  private getConfig: () => PowerJournalConfig;
  private prefix: LoggerName | "global";
  private serviceConfig: LoggerConfig = {};

  constructor(getConfig: () => PowerJournalConfig, prefix?: LoggerName) {
    this.getConfig = getConfig;
    this.prefix = prefix ?? "global";
  }

  setServiceConfig(config: LoggerConfig) {
    this.serviceConfig = config;
  }

  private addLog(level: LogLevel, message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      service: this.prefix,
      message,
      meta,
    };
    this.logs.push(entry);

    const serviceLevelConfig = this.serviceConfig[this.prefix] ?? {};
    // Default to true if not explicitly configured
    const shouldPrint = serviceLevelConfig[level] ?? true;

    if (!shouldPrint) return;

    // 🔥 Pretty console output
    const ts = entry.timestamp.toISOString().split("T")[1].split(".")[0]; // HH:MM:SS
    const timestampStr = `${colors.gray}${ts}${colors.reset}`;

    const pjStr = `${colors.purple}[PJ]${colors.reset}`;

    const serviceStr = `${getServiceColor(this.prefix)}${colors.bold}[${
      this.prefix
    }]${colors.reset}`;

    const levelStr = `${levelColors[level]}[${levelEmojis[level]} ${level
      .toUpperCase()
      .padEnd(5)}]${colors.reset}`;

    const final = `${timestampStr} ${pjStr}${serviceStr}${levelStr} ${message}`;

    try {
      if (level === "warn") console.warn(final, meta ?? "");
      else if (level === "error") console.error(final, meta ?? "");
      else console.log(final, meta ?? "");
    } catch {
      console.log(
        `${timestampStr} ${pjStr}[${
          this.prefix
        }][${level.toUpperCase()}] ${message}`,
        meta ?? ""
      );
    }
  }

  dev(message: string, meta?: Record<string, any>) {
    this.addLog("dev", message, meta);
  }
  info(message: string, meta?: Record<string, any>) {
    this.addLog("info", message, meta);
  }
  warn(message: string, meta?: Record<string, any>) {
    this.addLog("warn", message, meta);
  }
  error(message: string, meta?: Record<string, any>) {
    this.addLog("error", message, meta);
  }

  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  withPrefix(prefix: LoggerName) {
    const newLogger = new LoggerService(this.getConfig, prefix);
    newLogger.setServiceConfig(this.serviceConfig);
    return newLogger;
  }
}
