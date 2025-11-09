import { format } from "date-fns";
import type { MarkdownView } from "obsidian";
import { useLogger, LNs, obApp, config } from "./globals";
import {
  inputCollector,
  CollectedInputsByReport,
} from "./services/InputCollectorService";
import { savingService } from "./services/SavingService";
import { dbService } from "./services/DbService";
import { buildDailyReport } from "./reportBuiders/buildDailyReport";
import { wellbeingBackfiller } from "./services/WellbeingBackfiller";

const logger = useLogger(LNs.FileService);

/**
 * Main workflow for Power Journal.
 * Runs all initialization, data collection, and report building.
 */
export async function onStart() {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const todayNote = `${format(now, "dd.MM.yyyy")}.md`;

    // Early morning abort (00:00 - 03:59) - do minimal work and exit
    if (currentHour >= 0 && currentHour < 4) {
      logger.info(
        `Current time is ${format(
          now,
          "HH:mm"
        )} (before 04:00) - aborting report creation`
      );

      // Delete both yesterday's and today's script-triggering notes
      const coreDir = `${config.projectDir}/${config.coreDir}`;
      const folder = obApp.vault.getAbstractFileByPath(coreDir);

      if (folder && "children" in folder) {
        const datePattern = /^\d{2}\.\d{2}\.\d{4}\.md$/;
        let deletedCount = 0;
        for (const child of folder.children as any[]) {
          if (
            "extension" in child &&
            child.extension === "md" &&
            datePattern.test(child.name)
          ) {
            try {
              logger.info(
                `Deleting script-triggering note (early morning abort): ${child.name}`
              );
              await obApp.vault.delete(child);
              deletedCount++;
            } catch (err) {
              logger.error(`Failed to delete ${child.name}:`, err as Error);
            }
          }
        }
        logger.info(
          `Early morning cleanup: deleted ${deletedCount} script-triggering note(s)`
        );
      } else {
        logger.warn(`Core directory not found or has no children: ${coreDir}`);
      }

      logger.info(
        "Report creation aborted. Please open after 04:00 to create today's report."
      );
      return; // Exit early - do nothing else
    }

    // Normal flow (after 04:00) - collect yesterday's data and create today's report

    // 1. Collect inputs from yesterday and delete empty reports
    const collectedInputs = await deleteEmptyReports();
    logger.dev("Input collection and empty report cleanup completed");

    // 2. Close today's note if open
    const leaves = obApp.workspace.getLeavesOfType("markdown");
    const openFiles: string[] = [];
    for (const leaf of leaves) {
      const view = leaf.view as MarkdownView;
      const file = view.file;
      if (file) {
        openFiles.push(file.path);
        if (file.path.endsWith(todayNote)) {
          logger.dev("Closing today's note: " + file.path);
          await leaf.detach();
        }
      }
    }
    logger.dev("Currently open files: " + openFiles.join(", "));

    // 3. Remove old script-triggering notes in core directory
    const coreDir = `${config.projectDir}/${config.coreDir}`;
    const folder = obApp.vault.getAbstractFileByPath(coreDir);
    if (folder && "children" in folder) {
      const datePattern = /^\d{2}\.\d{2}\.\d{4}\.md$/;
      for (const child of folder.children as any[]) {
        if (
          "extension" in child &&
          child.extension === "md" &&
          datePattern.test(child.name) &&
          child.name !== todayNote
        ) {
          logger.dev("Deleting old app-triggering note: " + child.path);
          await obApp.vault.delete(child);
        }
      }
    }

    // 4. Save collected inputs to database (with wellbeing backfilling)
    if (collectedInputs) {
      for (const [reportType, inputs] of Object.entries(collectedInputs)) {
        if (inputs && inputs.length > 0) {
          // Backfill wellbeing parameters with periodicity before saving
          const expandedInputs =
            await wellbeingBackfiller.backfillPeriodicParameters(inputs);

          await dbService.upsertReportInputs(reportType, expandedInputs);
          logger.info(
            `Saved ${expandedInputs.length} inputs (${
              inputs.length
            } original + ${
              expandedInputs.length - inputs.length
            } backfilled) for ${reportType} to database`
          );
        }
      }
    }

    // 5. Build today's daily report
    await buildDailyReport();
    logger.info("Daily report built successfully");
  } catch (err) {
    logger.error("Failed to run onStart:", err as Error);
  }
}

/**
 * Delete reports from yesterday if all inputs are empty.
 * This prevents empty reports from messing up report numbers and statistics.
 * Returns the collected inputs (even if some reports were deleted).
 */
async function deleteEmptyReports(): Promise<CollectedInputsByReport> {
  try {
    logger.dev("Checking for empty reports from yesterday...");

    // Collect all inputs from yesterday's reports
    const collectedByReport = await inputCollector.collectFromYesterday();

    for (const [reportType, inputs] of Object.entries(collectedByReport)) {
      if (!inputs || inputs.length === 0) {
        logger.dev(`No inputs found for report: ${reportType}`);
        continue;
      }

      // Check if ALL inputs are empty (null, undefined, empty string, empty array, or false for booleans)
      const allEmpty = inputs.every((input) => {
        if (input.value === null || input.value === undefined) return true;
        if (typeof input.value === "string" && input.value.trim() === "")
          return true;
        if (Array.isArray(input.value) && input.value.length === 0) return true;
        if (typeof input.value === "boolean" && input.value === false)
          return true;
        if (typeof input.value === "number" && input.value === 0) return true;
        return false;
      });

      if (allEmpty) {
        // All inputs are empty - delete the report file
        const reportFolder = savingService.reportFolders[reportType];
        const files = await savingService._listFiles(reportFolder);

        if (files.length > 0) {
          // Get the most recent file (should match the one we just analyzed)
          const lastFile = files.sort().reverse()[0];

          // Double-check it matches the reportType and has the same date/number
          const firstInput = inputs[0];
          if (
            firstInput &&
            lastFile.includes(firstInput.reportDate.replace(/-/g, "")) &&
            lastFile.includes(firstInput.reportNumber)
          ) {
            const filePath = `${reportFolder}/${lastFile}`;
            const file = obApp.vault.getAbstractFileByPath(filePath);

            if (file && "extension" in file) {
              logger.info(`Deleting empty report: ${lastFile}`);
              await obApp.vault.delete(file);
            }
          }
        }
      } else {
        logger.dev(`Report ${reportType} has content - keeping it`);
      }
    }

    return collectedByReport;
  } catch (err) {
    logger.error("Failed to delete empty reports:", err as Error);
    return {};
  }
}
