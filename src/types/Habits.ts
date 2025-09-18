export interface Habit {
  id: string;
  label: string;
  cue: string;
  reward: string;
  targetCount: number;
  periodicityMultiplier: number;
  periodicityUnit: "day" | "week" | "month";
  active: boolean;
}
