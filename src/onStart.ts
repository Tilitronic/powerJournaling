import { format } from "date-fns";
import type { MarkdownView, TFolder, TFile } from "obsidian";
import { useLogger, LNs, obApp, config } from "./globals";

// Global queue for deferred deletions (happens after script execution)
let deferredDeletions: { path: string; fileName: string }[] = [];
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
        `🕐 EARLY MORNING ABORT: Current time is ${format(
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

        // Collect file names to delete (don't iterate over stale folder.children array)
        const filesToDelete: string[] = [];
        for (const child of (folder as TFolder).children) {
          const isFile =
            "extension" in child && (child as TFile).extension === "md";
          const matchesPattern = datePattern.test(child.name);

          if (isFile && matchesPattern) {
            filesToDelete.push(child.name);
          }
        }

        // Delete script-triggering notes
        for (const fileName of filesToDelete) {
          try {
            const filePath = `${coreDir}/${fileName}`;
            const fileToDelete = obApp.vault.getAbstractFileByPath(filePath);

            if (
              fileToDelete &&
              "extension" in fileToDelete &&
              (fileToDelete as TFile).extension === "md"
            ) {
              // If it's today's note, defer deletion (script is running inside it)
              if (fileName === todayNote) {
                logger.dev(
                  `⏱️ Deferring deletion of today's note: ${fileName}`
                );
                deferredDeletions.push({ path: filePath, fileName });
                // Schedule the deferred deletion to run after this script completes
                requestIdleCallback(
                  () => {
                    processDeferredDeletions();
                  },
                  { timeout: 2000 }
                );
                deletedCount++;
              } else {
                // For old notes, try direct deletion
                try {
                  await obApp.vault.delete(fileToDelete as TFile);
                  logger.dev(`Deleted old script-triggering note: ${fileName}`);
                  deletedCount++;
                } catch (err) {
                  logger.error(
                    `Failed to delete ${fileName}, deferring:`,
                    err as Error
                  );
                  deferredDeletions.push({ path: filePath, fileName });
                  requestIdleCallback(
                    () => {
                      processDeferredDeletions();
                    },
                    { timeout: 2000 }
                  );
                  deletedCount++;
                }
              }
            }
          } catch (err) {
            logger.error(`Failed to process ${fileName}:`, err as Error);
          }
        }
        if (deletedCount > 0) {
          logger.info(
            `Cleaned up ${deletedCount} script-triggering note(s) for early morning abort`
          );
        }
      } else {
        logger.warn(
          `⚠️ Core directory not found or has no children: ${coreDir}`
        );
        if (!folder) {
          logger.warn(`⚠️ Folder object is null`);
        } else if (!("children" in folder)) {
          logger.warn(`⚠️ Folder doesn't have children property`);
        }
      }

      logger.info(
        "🚫 Report creation aborted. Please open after 04:00 to create today's report."
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
      for (const child of (folder as TFolder).children) {
        const isFile =
          "extension" in child && (child as TFile).extension === "md";
        if (
          isFile &&
          datePattern.test(child.name) &&
          child.name !== todayNote
        ) {
          logger.dev("Deleting old app-triggering note: " + child.path);
          await obApp.vault.delete(child as TFile);
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
 * Process deferred deletions after script execution.
 * This handles files that couldn't be deleted while the script was running.
 * Called via requestIdleCallback to ensure script has fully exited.
 *
 * Note: After deletion, Daily Notes plugin may try to access the file and throw ENOENT.
 * This is harmless and expected - the file is successfully deleted.
 */
export async function processDeferredDeletions() {
  if (deferredDeletions.length === 0) {
    return;
  }

  logger.info(
    `🔄 Processing ${deferredDeletions.length} deferred deletion(s)...`
  );

  for (const deletion of deferredDeletions) {
    try {
      const file = obApp.vault.getAbstractFileByPath(deletion.path);
      if (file && "extension" in file) {
        logger.info(`🗑️ Deferred deletion: ${deletion.fileName}`);
        await obApp.vault.delete(file as TFile);
        logger.info(`✅ Deferred deletion successful: ${deletion.fileName}`);
      } else {
        logger.info(
          `ℹ️ File already deleted (not found): ${deletion.fileName}`
        );
      }
    } catch (err) {
      // Only log real errors, not ENOENT (which means the file was already deleted)
      const errorMsg = (err as any)?.message || String(err);
      if (errorMsg.includes("ENOENT") || errorMsg.includes("not found")) {
        logger.info(
          `ℹ️ File already deleted during deferred cleanup: ${deletion.fileName}`
        );
      } else {
        logger.error(
          `❌ Failed to deferred delete ${deletion.fileName}:`,
          err as Error
        );
      }
    }
  }

  deferredDeletions = [];
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
