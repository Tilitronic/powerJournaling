import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import {
  CollectedInputsByReport,
  CollectedInput,
} from "./InputCollectorService";
import path from "path";
import fs from "fs-extra";
import { config } from "../globals";

// Define the shape of the database
interface DbData {
  reports: CollectedInputsByReport;
}

function getDbDir() {
  // Use config.projectDir/coreDir for database location
  return path.resolve(
    __dirname,
    `../../${config.projectDir}/${config.coreDir}`
  );
}
function getDbFile() {
  return path.join(getDbDir(), "powerjournal-db.json");
}

class DbService {
  private db: Low<DbData>;

  constructor() {
    // Ensure the database directory exists
    fs.ensureDirSync(getDbDir());
    const adapter = new JSONFile<DbData>(getDbFile());
    this.db = new Low<DbData>(adapter, { reports: {} });
  }

  async init() {
    await this.db.read();
    this.db.data ||= { reports: {} };
  }

  async saveReportInputs(reportType: string, inputs: CollectedInput[]) {
    await this.init();
    this.db.data!.reports[reportType] = inputs;
    await this.db.write();
  }

  async appendReportInputs(reportType: string, inputs: CollectedInput[]) {
    await this.init();
    if (!this.db.data!.reports[reportType]) {
      this.db.data!.reports[reportType] = [];
    }
    this.db.data!.reports[reportType].push(...inputs);
    await this.db.write();
  }

  async getReportInputs(reportType: string): Promise<CollectedInput[]> {
    await this.init();
    return this.db.data!.reports[reportType] || [];
  }

  // Add more query/filter methods as needed
}

export const dbService = new DbService();
