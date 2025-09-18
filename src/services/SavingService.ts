// src/services/SavingService.ts
import { config, createLogger, obApp } from "../globals";
import { format } from "date-fns";
import type { TFile, TFolder, TAbstractFile } from "obsidian";

const log = createLogger("FileService");

export const savingService = {
  // Vault-relative base path for all reports
  get baseOutput() {
    return `${config.projectDir}/${config.outputDir}`;
  },

  // Map report types to folder paths
  get reportFolders() {
    const folders: Record<string, string> = {};
    for (const pair of config.reportFolderPairs ?? []) {
      folders[pair.report] = `${this.baseOutput}/${pair.folder}`;
    }
    return folders;
  },

  /** Returns today’s date in YYYYMMDD format */
  _today(): string {
    return format(new Date(), "yyyyMMdd");
  },

  /** Ensure folder exists in vault */
  async _ensureFolder(folderPath: string) {
    const folder = obApp.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      log(`Creating folder: ${folderPath}`);
      await obApp.vault.createFolder(folderPath);
    }
  },

  /** List markdown files in a vault folder */
  async _listFiles(folderPath: string): Promise<string[]> {
    await this._ensureFolder(folderPath);

    const folder = obApp.vault.getAbstractFileByPath(
      folderPath
    ) as TFolder | null;
    if (!folder || !folder.children) return [];

    return folder.children
      .filter((f): f is TFile => "extension" in f && f.extension === "md")
      .map((f) => f.name);
  },

  /** Write a report file with automatic numbering */
  async write(options: { type: string; data?: string; content?: string }) {
    const content = options.data ?? options.content;
    if (!content) throw new Error("No content provided for write()");

    const folder = this.reportFolders[options.type];
    if (!folder) throw new Error(`Unknown report type: ${options.type}`);

    await this._ensureFolder(folder);

    const todayPrefix = this._today();
    const files = await this._listFiles(folder);
    const nextIndex = files.length + 1;
    const indexStr = String(nextIndex).padStart(5, "0");

    const fileName = `${todayPrefix}-${indexStr}-${options.type}.md`;
    const filePath = `${folder}/${fileName}`;

    const exists = obApp.vault.getAbstractFileByPath(filePath);
    if (exists) {
      log(`File already exists: ${filePath}. Skipping write.`);
      return filePath;
    }

    log(`Writing new file: ${filePath}`);
    await obApp.vault.create(filePath, content);
    return filePath;
  },

  /** General-purpose write */
  async writeGeneral(filePath: string, data: string): Promise<string> {
    const existing = obApp.vault.getAbstractFileByPath(filePath);

    if (existing) {
      // Assert at runtime that it's a TFile
      if ("extension" in existing) {
        log(`Overwriting existing file: ${filePath}`);
        await obApp.vault.modify(existing as TFile, data); // <-- type assertion
      } else {
        log(`Path exists but is not a file, cannot modify: ${filePath}`);
        throw new Error(`Path exists but is not a file: ${filePath}`);
      }
    } else {
      log(`Creating new file: ${filePath}`);
      await obApp.vault.create(filePath, data);
    }

    return filePath;
  },

  /** Delete a file */
  async delete(filePath: string) {
    const file = obApp.vault.getAbstractFileByPath(filePath);
    if (file) {
      log(`Deleting file: ${filePath}`);
      await obApp.vault.delete(file);
    }
  },
};
