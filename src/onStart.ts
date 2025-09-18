import { format } from "date-fns";
import { MarkdownView } from "obsidian";
import { createLogger, obApp } from "./globals";
import { DevLog } from "./globals";

const dl = new DevLog("OnStart");

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
          dl.l("Closing today's note: " + file.path);
          await leaf.detach();
        }
      }
    }

    dl.l("Currently open files: " + openFiles.join(", "));
  } catch (err) {
    console.error("[FileService] onStart error:", err);
  }
}
