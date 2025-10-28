export const PeriodicityUnits = {
  Day: "day",
  Week: "week",
  Month: "month",
  Quarter: "quarter",
  Year: "year",
  Decade: "decade",
} as const;

export type PeriodicityUnit =
  (typeof PeriodicityUnits)[keyof typeof PeriodicityUnits];
