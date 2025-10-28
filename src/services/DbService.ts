import { Low } from "lowdb";
import {
  CollectedInputsByReport,
  CollectedInput,
} from "./InputCollectorService";
import { config, useLogger, LNs, obApp } from "../globals";
import type { TFile } from "obsidian";

// Define the shape of the database
interface DbData {
  reports: CollectedInputsByReport;
}

const logger = useLogger(LNs.DbService);

// Custom lowdb adapter using Obsidian's file API
class ObsidianJSONAdapter<T> {
  constructor(private dbPath: string) {}

  async read(): Promise<T | null> {
    try {
      const file = obApp.vault.getAbstractFileByPath(this.dbPath);
      if (file && "extension" in file) {
        const content = await obApp.vault.read(file as TFile);
        return JSON.parse(content) as T;
      }
      return null;
    } catch (error) {
      logger.error(`Error reading database`, { error });
      return null;
    }
  }

  async write(data: T): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);
      const file = obApp.vault.getAbstractFileByPath(this.dbPath);

      if (file && "extension" in file) {
        // File exists, modify it
        await obApp.vault.modify(file as TFile, content);
        logger.dev(`Database saved to ${this.dbPath}`);
      } else {
        // File doesn't exist, create it
        await obApp.vault.create(this.dbPath, content);
        logger.info(`Database created at ${this.dbPath}`);
      }
    } catch (error) {
      logger.error(`Error writing database`, { error });
    }
  }
}

class DbService {
  private db: Low<DbData> | null = null;

  /** Vault-relative path to the database file */
  private getDbPath(): string {
    return `${config.projectDir}/${config.coreDir}/powerjournal-db.json`;
  }

  /** Ensure the core directory exists */
  private async ensureCoreDir() {
    const coreDir = `${config.projectDir}/${config.coreDir}`;
    const folder = obApp.vault.getAbstractFileByPath(coreDir);
    if (!folder) {
      logger.dev(`Creating core directory: ${coreDir}`);
      await obApp.vault.createFolder(coreDir);
    }
  }

  /** Initialize or get the database instance */
  private async ensureDb(): Promise<Low<DbData>> {
    if (!this.db) {
      await this.ensureCoreDir();
      const dbPath = this.getDbPath();
      const adapter = new ObsidianJSONAdapter<DbData>(dbPath);
      this.db = new Low<DbData>(adapter, { reports: {} });
      logger.dev(`Database adapter initialized for ${dbPath}`);
    }
    return this.db;
  }

  async init() {
    const db = await this.ensureDb();
    await db.read();
    db.data ||= { reports: {} };
    logger.dev("Database initialized");
  }

  async saveReportInputs(reportType: string, inputs: CollectedInput[]) {
    await this.init();
    const db = await this.ensureDb();
    db.data!.reports[reportType] = inputs;
    await db.write();
    logger.info(`Saved ${inputs.length} inputs for report type: ${reportType}`);
  }

  async appendReportInputs(reportType: string, inputs: CollectedInput[]) {
    await this.init();
    const db = await this.ensureDb();
    if (!db.data!.reports[reportType]) {
      db.data!.reports[reportType] = [];
    }
    db.data!.reports[reportType].push(...inputs);
    await db.write();
    logger.info(
      `Appended ${inputs.length} inputs to report type: ${reportType}`
    );
  }

  /**
   * Upsert report inputs - removes existing entries for the same reportDate+reportNumber, then adds new ones.
   * This prevents duplicates when regenerating reports.
   */
  async upsertReportInputs(reportType: string, inputs: CollectedInput[]) {
    await this.init();
    const db = await this.ensureDb();

    if (!db.data!.reports[reportType]) {
      db.data!.reports[reportType] = [];
    }

    // Get unique report identifiers from new inputs
    const newReportKeys = new Set(
      inputs.map((input) => `${input.reportDate}-${input.reportNumber}`)
    );

    // Remove existing inputs with the same reportDate+reportNumber
    const filtered = db.data!.reports[reportType].filter(
      (input: CollectedInput) => {
        const key = `${input.reportDate}-${input.reportNumber}`;
        return !newReportKeys.has(key);
      }
    );

    // Add new inputs
    db.data!.reports[reportType] = [...filtered, ...inputs];
    await db.write();

    logger.info(
      `Upserted ${inputs.length} inputs for ${reportType} (removed duplicates)`
    );
  }

  async getReportInputs(reportType: string): Promise<CollectedInput[]> {
    await this.init();
    const db = await this.ensureDb();
    const inputs = db.data!.reports[reportType] || [];
    logger.dev(
      `Retrieved ${inputs.length} inputs for report type: ${reportType}`
    );
    return inputs;
  }

  /**
   * Get inputs filtered by component and/or input names
   * @param reportType - The type of report (e.g., "almostDailyReport")
   * @param inputIds - Single input ID or array of input IDs to filter
   * @param componentName - Optional component name to filter by
   * @example
   * // Get all "exercise" inputs from any component
   * const exerciseInputs = await dbService.getInputsById("almostDailyReport", "exercise");
   *
   * // Get multiple inputs from a specific component
   * const habits = await dbService.getInputsById("almostDailyReport", ["exercise", "dayPlanning"], "habitTracking");
   *
   * // Get multiple inputs from any component
   * const allHabits = await dbService.getInputsById("almostDailyReport", ["exercise", "dayPlanning", "havingFun"]);
   */
  async getInputsById(
    reportType: string,
    inputIds: string | string[],
    componentId?: string
  ): Promise<CollectedInput[]> {
    await this.init();
    const db = await this.ensureDb();
    const allInputs = db.data!.reports[reportType] || [];

    const inputIdsArray = Array.isArray(inputIds) ? inputIds : [inputIds];

    const filtered = allInputs.filter((input: CollectedInput) => {
      const matchesInputId = inputIdsArray.includes(input.inputId);
      const matchesComponent = componentId
        ? input.componentId === componentId
        : true;
      return matchesInputId && matchesComponent;
    });

    logger.dev(
      `Filtered ${filtered.length} inputs for ${inputIdsArray.join(", ")}${
        componentId ? ` in ${componentId}` : ""
      }`
    );
    return filtered;
  }

  /**
   * Get the last N reports (not days) for specific inputs
   * @param reportType - The type of report
   * @param inputIds - Single input ID or array of input IDs
   * @param count - Number of most recent reports to retrieve
   * @param componentName - Optional component name to filter by
   * @example
   * // Get last 10 reports where exercise was logged
   * const last10 = await dbService.getInputsLastNReports("almostDailyReport", "exercise", 10);
   *
   * // Get last 20 reports with multiple habits
   * const habits = await dbService.getInputsLastNReports("almostDailyReport", ["exercise", "dayPlanning"], 20);
   */
  async getInputsLastNReports(
    reportType: string,
    inputIds: string | string[],
    count: number,
    componentId?: string
  ): Promise<CollectedInput[]> {
    const allInputs = await this.getInputsById(
      reportType,
      inputIds,
      componentId
    );

    // Sort by reportDate descending (newest first), then by reportNumber
    const sorted = allInputs.sort((a, b) => {
      const dateCompare = (b.reportDate || "").localeCompare(
        a.reportDate || ""
      );
      if (dateCompare !== 0) return dateCompare;
      return (b.reportNumber || "0").localeCompare(a.reportNumber || "0");
    });

    // Get unique report dates and take the first N
    const uniqueDates = Array.from(
      new Set(sorted.map((input) => input.reportDate))
    );
    const lastNDates = uniqueDates.slice(0, count);

    // Filter inputs that match those dates
    const result = sorted.filter((input) =>
      lastNDates.includes(input.reportDate)
    );

    logger.info(`Retrieved ${result.length} inputs from last ${count} reports`);
    return result;
  }

  /**
   * Get inputs within a specific date range
   * @param reportType - The type of report
   * @param inputIds - Single input name or array of input names
   * @param startDate - Start date in format "YYYY-MM-DD"
   * @param endDate - End date in format "YYYY-MM-DD"
   * @param componentName - Optional component name to filter by
   * @example
   * // Get exercise data for October
   * const octoberExercise = await dbService.getInputsInDateRange(
   *   "almostDailyReport",
   *   "exercise",
   *   "2025-10-01",
   *   "2025-10-31"
   * );
   *
   * // Get multiple habits for this week
   * const weekHabits = await dbService.getInputsInDateRange(
   *   "almostDailyReport",
   *   ["exercise", "dayPlanning", "havingFun"],
   *   "2025-10-13",
   *   "2025-10-19"
   * );
   */
  async getInputsInDateRange(
    reportType: string,
    inputIds: string | string[],
    startDate: string,
    endDate: string,
    componentId?: string
  ): Promise<CollectedInput[]> {
    const allInputs = await this.getInputsById(
      reportType,
      inputIds,
      componentId
    );

    const filtered = allInputs.filter((input) => {
      const date = input.reportDate || "";
      return date >= startDate && date <= endDate;
    });

    logger.info(
      `Retrieved ${filtered.length} inputs between ${startDate} and ${endDate}`
    );
    return filtered;
  }

  /**
   * Get all unique input names for a component across all dates
   * Useful for discovering what inputs exist
   */
  async getAvailableInputs(
    reportType: string,
    componentId: string
  ): Promise<string[]> {
    await this.init();
    const db = await this.ensureDb();
    const allInputs = db.data!.reports[reportType] || [];
    const inputIds = new Set(
      allInputs
        .filter((input: CollectedInput) => input.componentId === componentId)
        .map((input: CollectedInput) => input.inputId)
    );
    return Array.from(inputIds);
  }
}

export const dbService = new DbService();
