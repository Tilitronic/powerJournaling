import { format } from "date-fns";
import { MarkdownView } from "obsidian";
import { useLogger, LNs, obApp } from "./globals";

const logger = useLogger(LNs.FileService);

export async function onStart() {
  try {
    const todayNote = `${format(new Date(), "dd.MM.yyyy")}.md`;

    const leaves = obApp.workspace.getLeavesOfType("markdown");
    const openFiles: string[] = [];

    // Collect paths for logging + close matching leaves
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
  } catch (err) {
    logger.error("Failed to run onStart:", err as Error);
  }
}
