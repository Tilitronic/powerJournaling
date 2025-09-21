import { format } from "date-fns";
import { MarkdownView, TFolder, TFile, TAbstractFile } from "obsidian";
import { useLogger, LNs, obApp, config } from "./globals";

const logger = useLogger(LNs.FileService);

export async function onStart() {
  try {
    const todayNote = `${format(new Date(), "dd.MM.yyyy")}.md`;

    // 1. Close today's note if open
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

    // 2. Remove old script-triggering notes in core directory
    const coreDir = `${config.projectDir}/${config.coreDir}`;
    const folder = obApp.vault.getAbstractFileByPath(coreDir);
    if (folder && folder instanceof TFolder) {
      const datePattern = /^\d{2}\.\d{2}\.\d{4}\.md$/;
      for (const child of folder.children) {
        if (
          child instanceof TFile &&
          child.extension === "md" &&
          datePattern.test(child.name) &&
          child.name !== todayNote
        ) {
          logger.dev("Deleting old app-triggering note: " + child.path);
          await obApp.vault.delete(child);
        }
      }
    }
  } catch (err) {
    logger.error("Failed to run onStart:", err as Error);
  }
}
