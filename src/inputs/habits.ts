import { PeriodicityUnits as PU } from "src/services/ScheduleService";
import { HabitConfig } from "./types";
import { InputsConst } from "src/services/InputCreator";

type HabitPreconfig = Omit<HabitConfig, "inputOptions">;
const createHabitConfig = (habit: HabitPreconfig): HabitConfig => ({
  ...habit,
  inputOptions: {
    inputId: habit.id,
    type: InputsConst.boolean,
    label: habit.label,
  },
});
export const habitPreconfigs: HabitPreconfig[] = [
  {
    id: "dayPlanning",
    label: "Planning my day",
    cue: "After breakfast",
    reward: "More productive and organized day",
    schedule: {
      active: true,
      target: {
        count: 1,
        per: { count: 1, unit: PU.Day },
      },
    },
  },
  {
    id: "exercise",
    label: "Exercise",
    cue: "Any suitable time during the day",
    reward: "Better health, more energy, and improved mood",
    schedule: {
      active: true,
      target: {
        count: 5,
        per: { count: 1, unit: PU.Week },
        keepShowing: true,
      },
    },
  },
  {
    id: "morningWarmUp",
    label: "Morning Physical Warm-Up",
    cue: "After waking up",
    reward: "Increased energy and readiness for the day",
    schedule: {
      active: true,
      target: {
        count: 1,
        per: { count: 1, unit: PU.Day },
      },
    },
  },
  {
    id: "recreation",
    label: "Having fun",
    cue: "In the evening or during free time",
    reward: "Relaxation, joy, and stress relief",
    schedule: {
      active: true,
      target: {
        count: 1,
        per: { count: 1, unit: PU.Day },
      },
    },
  },
  {
    id: "selfPleasure",
    label: "FPF",
    cue: "At free from work personal time",
    reward: "Better focus and increasing ability to feel joy",
    schedule: {
      active: true,
      target: {
        count: 7,
        per: { count: 10, unit: PU.Day },
      },
    },
  },
  {
    id: "poetryEngaging",
    label: "Spend time with poetry",
    cue: "At leisure time",
    reward:
      "Happiness and healthy feelings expression from engaging with poetry",
    schedule: {
      active: true,
      target: {
        count: 3,
        per: { count: 1, unit: PU.Month },
      },
    },
  },
  {
    id: "programmingLearning",
    label: "Programming study",
    cue: "Dedicated learning time",
    reward: "Skill development, career growth, and problem-solving mastery",
    schedule: {
      active: true,
      target: {
        count: 3,
        per: { count: 1, unit: PU.Week },
      },
    },
  },
  {
    id: "recreationalCannabis",
    label: "Getting high",
    cue: "Day off (if next day is also day off, then) in safe calm well prepared environment and mood",
    reward: "Self-care routine, relaxation, stress relief",
    schedule: {
      active: true,
      target: {
        count: 1,
        per: { count: 1, unit: PU.Week },
      },
      limit: {
        max: 20,
        per: { count: 6, unit: PU.Month },
      },
    },
  },
  {
    id: "fastMorningEveningRoutine",
    label: "Complete morning & evening routine efficiently",
    cue: "During morning (breakfast, hygiene) and evening (cleaning teeth, preparing for bed) routines",
    reward: "Save up to 1 hour daily, more productive day, less stress",
  },
  {
    id: "phoneDetox",
    label: "No phone for 3 hours",
    cue: "During focused work or leisure time",
    reward:
      "Better focus, reduced distractions, mental clarity, reclaimed time",
    schedule: {
      active: true,
      target: {
        count: 3,
        per: { count: 1, unit: PU.Week },
        keepShowing: true,
      },
    },
  },
] as const;

export const habitConfigs: HabitConfig[] =
  habitPreconfigs.map(createHabitConfig);
