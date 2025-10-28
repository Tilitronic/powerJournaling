export interface ReportDefinition {
  folder: string;
  name: string;
  // Add more fields as needed (e.g., description, icon, etc.)
}

export const reportDefinitions = {
  almostDailyReport: {
    folder: "l1almostDailyReport",
    name: "Daily Report",
  },
  "10daysReport": {
    folder: "l2tenL1ReportsReview",
    name: "10 Days Review",
  },
  "30daysReport": {
    folder: "l3ThreeL2Review",
    name: "30 Days Review",
  },
  "150daysReport": {
    folder: "l4FiveL3Review",
    name: "150 Days Review",
  },
} as const;

export type ReportType = keyof typeof reportDefinitions;

// Report type constants for easy reference
export const ReportTypes = {
  ALMOST_DAILY: "almostDailyReport",
  TEN_DAYS: "10daysReport",
  THIRTY_DAYS: "30daysReport",
  ONE_FIFTY_DAYS: "150daysReport",
} as const satisfies Record<string, ReportType>;
