import { InputType } from "src/services/InputCreator";
import { Schedule } from "src/services/ScheduleService";
import { InputsConst } from "src/services/InputCreator";

import { CreateInputOptions } from "src/services/InputCreator";

export interface InputConfig {
  id: string;
  inputOptions: CreateInputOptions;
  label: string;
  inputLabel?: string;
  description?: string;
  schedule?: Schedule;
  active?: boolean;
  component?: string;
}

export interface MindPracticeConfig extends InputConfig {
  category?: "stoic" | "taoist" | "buddhist" | "mindfulness";
  guide: string;
  id: string;
}

export interface HabitConfig extends InputConfig {
  cue: string;
  reward: string;
  id: string;
}

export interface WellbeingConfig extends InputConfig {
  id: string;
}
