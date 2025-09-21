import { reportDefinitions } from "../reportDefinitions";
// src/services/SavingService.ts
import { config, obApp, useLogger, LNs } from "../globals";
import { format } from "date-fns";
import type { TFile, TFolder } from "obsidian";

const logger = useLogger(LNs.SavingService);

export const savingService = {
  /** Vault-relative base path for all reports */
  get baseOutput() {
    return `${config?.projectDir ?? "vault"}/${config?.outputDir ?? "outputs"}`;
  },

  /** File extension for reports */
  get fileExtension() {
    // Default to standard markdown
    return config?.reportFileExtension ?? ".md";
  },

  /** Map report types to folder paths */
  get reportFolders(): Record<string, string> {
    const folders: Record<string, string> = {};
    for (const [reportType, { folder }] of Object.entries(reportDefinitions)) {
      folders[reportType] = `${this.baseOutput}/${folder}`;
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
      logger.dev(`Creating folder: ${folderPath}`);
      await obApp.vault.createFolder(folderPath);
    }
  },

  /** List markdown files in a vault folder */ //TODO: make listing by format configurable
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

  /** Open a file in Obsidian, optionally split/source for devMode */
  async _openFile(file: TFile) {
    try {
      logger.dev(`_openFile start: ${file.path}`);

      // Open file in main leaf
      const leaf = obApp.workspace.getLeaf(true);
      await leaf.openFile(file);
      logger.dev(`Main leaf opened file: ${file.path}`);

      // If devMode, split right leaf and force source mode
      if (config?.devMode) {
        const rightLeaf = obApp.workspace.createLeafBySplit(
          leaf,
          "vertical",
          false
        );
        await rightLeaf.openFile(file);

        // Force source mode (disables live preview)
        const viewState = {
          type: "markdown",
          state: {
            file: file.path,
            mode: "source",
          },
        };

        try {
          await rightLeaf.setViewState(viewState);
          logger.dev(`DevMode: right leaf forced to source mode`);
        } catch (err) {
          logger.warn(
            `Failed to force right leaf to source mode: ${
              (err as Error).message
            }`
          );
        }
      }
    } catch (err) {
      logger.error(
        `Failed to open file ${file.path}: ${(err as Error).message}`
      );
    }
  },
  /** Write a report file with automatic numbering */
  async write(options: {
    type: string;
    data?: string;
    content?: string;
    open?: boolean; // optional, default is true
  }) {
    const content = options.data ?? options.content;
    if (!content) throw new Error("No content provided for write()");

    const folder = this.reportFolders[options.type];
    if (!folder) throw new Error(`Unknown report type: ${options.type}`);

    await this._ensureFolder(folder);

    const todayPrefix = this._today();
    const files = await this._listFiles(folder);
    const nextIndex = files.length + 1;
    const indexStr = String(nextIndex).padStart(5, "0");
    const fileName = `${todayPrefix}-${indexStr}-${options.type}${this.fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    const exists = obApp.vault.getAbstractFileByPath(filePath);
    if (exists) {
      logger.warn(`File already exists: ${filePath}. Skipping write.`);
      return filePath;
    }

    logger.info(`Writing new file: ${filePath}`);
    const file = await obApp.vault.create(filePath, content);

    if (options?.open !== false) {
      await this._openFile(file);
    }

    return filePath;
  },

  /** General-purpose write */
  async writeGeneral(
    filePath: string,
    data: string,
    open = false
  ): Promise<string> {
    let file: TFile;
    const existing = obApp.vault.getAbstractFileByPath(filePath);

    if (existing) {
      if ("extension" in existing) {
        logger.info(`Overwriting existing file: ${filePath}`);
        await obApp.vault.modify(existing as TFile, data);
        file = existing as TFile;
      } else {
        logger.error(`Path exists but is not a file: ${filePath}`);
        throw new Error(`Path exists but is not a file: ${filePath}`);
      }
    } else {
      logger.info(`Creating new file: ${filePath}`);
      file = await obApp.vault.create(filePath, data);
    }

    if (open) await this._openFile(file);

    return filePath;
  },

  /** Delete a file */
  async delete(filePath: string) {
    const file = obApp.vault.getAbstractFileByPath(filePath);
    if (file) {
      logger.info(`Deleting file: ${filePath}`);
      await obApp.vault.delete(file);
    } else {
      logger.warn(`Cannot delete; file not found: ${filePath}`);
    }
  },
};
