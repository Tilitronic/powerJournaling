export const PeriodicityUnit = {
  Day: "day",
  Week: "week",
  Month: "month",
  Quarter: "quarter",
  Year: "year",
  Decade: "decade",
} as const;

export type PeriodicityUnit =
  (typeof PeriodicityUnit)[keyof typeof PeriodicityUnit];

export interface Habit {
  id: string;
  label: string;
  cue: string;
  reward: string;
  targetCount: number;
  periodicityMultiplier: number;
  periodicityUnit: PeriodicityUnit;
  active: boolean;
  permanent?: boolean;
}
