import fs from "fs-extra";
import path from "path";
import { format } from "date-fns";

export interface ReportFolderPair {
  folder: string;
  report: string;
}

export interface FileServiceConfig {
  projectDir: string;
  outputDir: string;
  reportFolderPairs: ReportFolderPair[];
  devLogging?: boolean;
}

export class FileService {
  private config: FileServiceConfig;
  private devLogging: boolean;
  private baseOutput: string;
  private reportFolders: Record<string, string>;

  constructor(config: FileServiceConfig) {
    this.config = config;
    this.devLogging = config.devLogging ?? false;

    this.baseOutput = path.join(config.projectDir, config.outputDir);

    // Map report types to folder paths
    this.reportFolders = {};
    for (const pair of config.reportFolderPairs ?? []) {
      this.reportFolders[pair.report] = path.join(this.baseOutput, pair.folder);
    }

    this._log("FileService initialized with baseOutput: " + this.baseOutput);
  }

  private _log(msg: string) {
    if (this.devLogging) console.log(`[FileService] ${msg}`);
  }

  private _today(): string {
    return format(new Date(), "yyyyMMdd");
  }

  private _todayHuman(): string {
    return format(new Date(), "dd.MM.yyyy");
  }

  private async _ensureFolder(folderPath: string) {
    if (!(await fs.pathExists(folderPath))) {
      this._log(`Creating folder: ${folderPath}`);
      await fs.mkdirp(folderPath);
    }
  }

  private async _listFiles(folderPath: string): Promise<string[]> {
    await this._ensureFolder(folderPath);
    const files = await fs.readdir(folderPath);
    return files.filter((f) => f.endsWith(".md"));
  }

  /** Write a report file with automatic numbering */
  async write(options: {
    type: string;
    data?: string;
    content?: string;
  }): Promise<string> {
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
    const filePath = path.join(folder, fileName);

    if (await fs.pathExists(filePath)) {
      this._log(`File already exists: ${filePath}. Skipping write.`);
      return filePath;
    }

    this._log(`Writing new file: ${filePath}`);
    await fs.writeFile(filePath, content, "utf-8");
    return filePath;
  }

  /** General-purpose write */
  async writeGeneral(filePath: string, data: string): Promise<string> {
    await fs.writeFile(filePath, data, "utf-8");
    this._log(`writeGeneral: ${filePath}`);
    return filePath;
  }

  /** Delete a file */
  async delete(filePath: string) {
    if (await fs.pathExists(filePath)) {
      this._log(`Deleting file: ${filePath}`);
      await fs.remove(filePath);
    }
  }
}
