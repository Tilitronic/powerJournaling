import { reportDefinitions } from "../reportDefinitions";
// src/services/InputCollectorService.ts
import { obApp, useLogger, LNs, config } from "../globals";
import { savingService } from "./SavingService";
import { PowerJournalConfig } from "src/pjconfig";
import { valueExtractor } from "./ValueExtractor";

const logger = useLogger(LNs.InputCollector);

export interface CollectedInput {
  componentName: string;
  inputName: string;
  type: string;
  value: string | number | boolean | string[] | null;
  label?: string;
  reportType: string;
  errors?: string[];
  reportDate: string; // e.g., '2025-09-21'
  reportNumber: string; // e.g., '00003'
}

export type CollectedInputsByReport = Record<string, CollectedInput[]>;

export class InputCollectorService {
  private getConfig: () => PowerJournalConfig;

  constructor(getConfig: () => PowerJournalConfig) {
    this.getConfig = getConfig;
  }

  async collectFromYesterday(): Promise<CollectedInputsByReport> {
    logger.dev("Starting collection of inputs from yesterday’s reports");
    const collectedByReport: CollectedInputsByReport = {};
    const cfg = this.getConfig();

    for (const [reportType, { folder, name }] of Object.entries(
      reportDefinitions
    )) {
      try {
        const folderPath = `${savingService.baseOutput}/${folder}`;
        logger.dev(`Checking folder "${folderPath}" for report: ${reportType}`);

        const files = await savingService._listFiles(folderPath);
        if (!files.length) {
          logger.warn(
            `No files found in "${folderPath}" for report: ${reportType}`
          );
          continue;
        }

        const lastFile = files.sort().reverse()[0];
        if (!lastFile.includes(reportType)) {
          logger.warn(
            `Newest file "${lastFile}" in folder "${folderPath}" does not match report type: ${reportType}`
          );
          continue;
        }

        const filePath = `${folderPath}/${lastFile}`;
        const file = obApp.vault.getAbstractFileByPath(filePath);
        if (!file || !("vault" in obApp)) {
          logger.error(`Could not load file for report ${reportType}`, {
            filePath,
          });
          continue;
        }

        // Extract date and report number from file name
        // Example: 20250921-00003-almostDailyReport.pjf.md
        const fileNameMatch = lastFile.match(/^(\d{8})-(\d{5})-/);
        let reportDate = "";
        let reportNumber = "";
        if (fileNameMatch) {
          // Convert YYYYMMDD to YYYY-MM-DD
          reportDate = `${fileNameMatch[1].slice(
            0,
            4
          )}-${fileNameMatch[1].slice(4, 6)}-${fileNameMatch[1].slice(6, 8)}`;
          reportNumber = fileNameMatch[2];
        }

        logger.dev(`Reading file: "${filePath}"`);
        const content = await obApp.vault.read(file as any);

        const extracted = valueExtractor.extract(content);

        // Map to CollectedInput and attach reportType, date, and number
        const collectedInputs: CollectedInput[] = extracted.map((e) => ({
          componentName: e.componentName,
          inputName: e.inputName,
          type: e.inputType ?? "unknown",
          value: e.value,
          errors: e.errors && e.errors.length > 0 ? e.errors : undefined,
          reportType: reportType,
          reportDate,
          reportNumber,
        }));

        collectedByReport[reportType] = collectedInputs;
        logger.dev(
          `Parsed ${collectedInputs.length} inputs for report: ${reportType}`
        );
      } catch (err) {
        logger.error(`Failed collecting inputs for ${reportType}`, {
          error: err,
        });
      }
    }

    logger.info(
      `InputCollector finished. Collected reports: ${
        Object.keys(collectedByReport).length
      }`
    );
    logger.dev("Collected inputs summary:", { collectedByReport });

    return collectedByReport;
  }
}

// Singleton
export const inputCollector = new InputCollectorService(() => config);
