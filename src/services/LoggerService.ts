// src/services/LoggerService.ts
import { PowerJournalConfig } from "src/pjconfig";

export type LogLevel = "dev" | "info" | "warn" | "error";

// Define service names as const for type safety
export const LoggerNames = {
  ComponentBuilder: "ComponentBuilder",
  SavingService: "SavingService",
  TagsService: "TagsService",
  InputService: "InputService",
  FileService: "FileService",
  OnStart: "OnStart",
} as const;

export type LoggerName = (typeof LoggerNames)[keyof typeof LoggerNames];

// Structured log entry
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  service: LoggerName | "global";
  message: string;
  // Optional extra metadata
  meta?: Record<string, any>;
}

// Per-service log configuration
export interface LoggerConfig {
  [service: string]: Partial<Record<LogLevel, boolean>>;
}

// Logger service
export class LoggerService {
  private logs: LogEntry[] = [];
  private getConfig: () => PowerJournalConfig;
  private prefix: LoggerName | "global";
  private serviceConfig: LoggerConfig = {};

  constructor(getConfig: () => PowerJournalConfig, prefix?: LoggerName) {
    this.getConfig = getConfig;
    this.prefix = prefix ?? "global";
  }

  // Set per-service log configuration
  setServiceConfig(config: LoggerConfig) {
    this.serviceConfig = config;
  }

  // Internal log handler
  private addLog(level: LogLevel, message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      service: this.prefix,
      message,
      meta,
    };
    this.logs.push(entry);

    // Determine if we should print to console
    const cfg = this.getConfig?.() ?? {};
    const serviceLevelConfig = this.serviceConfig[this.prefix] ?? {};
    const shouldPrint =
      serviceLevelConfig[level] ?? (level !== "dev" || cfg?.devLogging);

    if (!shouldPrint) return;

    // Safe console logging
    try {
      const prefixStr = `[PJ][${this.prefix}]`;
      if (level === "dev")
        console.log(`${prefixStr}[DEV] ${message}`, meta ?? "");
      else if (level === "info")
        console.log(`${prefixStr} ${message}`, meta ?? "");
      else if (level === "warn")
        console.warn(`${prefixStr} ${message}`, meta ?? "");
      else if (level === "error")
        console.error(`${prefixStr} ${message}`, meta ?? "");
    } catch {
      console.log(
        `[PJ][${this.prefix}][SAFE][${level.toUpperCase()}] ${message}`,
        meta ?? ""
      );
    }
  }

  // Convenience methods
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

  // Return all saved logs
  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  // Create a logger for a specific service
  withPrefix(prefix: LoggerName) {
    return new LoggerService(this.getConfig, prefix);
  }
}
