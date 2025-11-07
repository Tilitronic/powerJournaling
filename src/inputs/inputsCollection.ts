/**
 * Other Input Definitions
 *
 * This file documents all inputs that don't fit into the main categories
 * (habits, wellbeing, practices). These inputs are defined inline within
 * their respective components for context-specific flexibility.
 *
 * This file serves as a REFERENCE/DOCUMENTATION only - inputs are still
 * created directly in component files using ComponentBuilder methods.
 */
import { PeriodicityUnits as PU } from "src/services/ScheduleService";

import { InputsConst, InputType } from "src/services/InputCreator";
import { InputConfig } from "./types";
import { BooleanInputOptions } from "src/services/InputCreator";

/**
 * All other inputs in the system, organized by category
 */

type InputPreconfig = Omit<InputConfig, "id"> & { id?: string };

const generateInputConfigs = (ip: InputPreconfig): InputConfig => {
  let config = {
    id: ip.inputOptions.inputId,
    ...ip,
    description: ip.description || "",
  };
  if (ip.inputOptions.type === InputsConst.boolean) {
    (config.inputOptions as BooleanInputOptions).label = ip.label;
  }
  return config;
};

export const inputsPreconfigs: InputPreconfig[] = [
  // ==================== PLANNING ====================
  {
    label: "What Matters Most (Memento Mori)",
    inputOptions: {
      inputId: "memento_mori_focus",
      type: InputsConst.text,
    },
    description:
      "You will die. Your days are numbered. What truly matters? Which pillar deserves your limited time?",
  },
  {
    inputOptions: {
      inputId: "priority_plan",
      type: InputsConst.text,
    },
    label: "My #1 Task Today",
    description:
      "ONE concrete action serving what matters. When & where will I do it? What's my first 2-minute step?",
  },
  {
    inputOptions: {
      inputId: "tomorrow_priority",
      type: InputsConst.text,
    },
    label: "Tomorrow's #1 Priority",
  },
  {
    inputOptions: {
      inputId: "message_for_tomorrow",
      type: InputsConst.richText,
    },
    label: "Message for Tomorrow",
    description: "Short and meaningful message for your future self",
  },
  {
    inputOptions: {
      inputId: "plan_next_day",
      type: InputsConst.boolean,
    },
    label: "Plan next day",
    description: "Calendar events, tasks, notifications",
  },

  // ==================== REFLECTION ====================
  {
    inputOptions: {
      inputId: "accomplishments",
      type: InputsConst.text,
    },
    label: "My Win Today",
    description:
      "What was my proudest accomplishment? What effort/virtue made it possible?",
  },
  {
    inputOptions: {
      inputId: "obstacles",
      type: InputsConst.text,
    },
    label: "My Obstacle & Learning",
    description:
      "What happened? How did I respond? What did I learn? How will I use this?",
  },
  {
    inputOptions: {
      inputId: "if_then_plan",
      type: InputsConst.text,
    },
    label: "My Implementation Intention",
    description:
      "If this happens again, I will... (If [OBSTACLE], then I will [RESPONSE])",
  },
  {
    inputOptions: {
      inputId: "gratitudes",
      type: InputsConst.richText,
      placeholder: " 1. ",
    },
    label: "Three Good Things",
    description: "*What good happened? Why was it good? What was your role?*",
  },

  // ==================== AWARENESS ====================
  {
    inputOptions: {
      inputId: "main_distraction",
      type: InputsConst.text,
    },
    label: "What distracted me most today?",
    schedule: {
      showEvery: {
        count: 2,
        unit: PU.Day,
      },
    },
  },
  {
    inputOptions: {
      inputId: "flow_moments",
      type: InputsConst.text,
    },
    label: "What helped me focus?",
    description: "(Environment, time, task type)",
    schedule: {
      showEvery: {
        count: 2,
        unit: PU.Day,
      },
    },
  },
  {
    inputOptions: {
      inputId: "willpower_challenge",
      type: InputsConst.text,
    },
    label: "What was my biggest temptation/willpower challenge?",
    schedule: {
      showEvery: {
        count: 2,
        unit: PU.Day,
      },
    },
  },
  {
    inputOptions: {
      inputId: "strongest_emotion",
      type: InputsConst.text,
    },
    label: "What was my strongest emotion today?",
  },
  {
    inputOptions: {
      inputId: "emotion_trigger",
      type: InputsConst.text,
    },
    label: "What triggered it?",
    description: "Situation, person, thought",
  },
  {
    inputOptions: {
      inputId: "emotion_response",
      type: InputsConst.text,
    },
    label: "How did I respond?",
  },
  {
    inputOptions: {
      inputId: "better_emotion_response",
      type: InputsConst.text,
    },
    label: "What response would I choose next time?",
  },
  // ==================== STOIC EXERCISES ====================
  {
    inputOptions: {
      inputId: "negative_visualization",
      type: InputsConst.text,
    },
    label: "What you visualized",
    description: "5 min reflection on what I could lose",
    schedule: {
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    },
  },
  {
    inputOptions: {
      inputId: "voluntary_discomfort_practice",
      type: InputsConst.multicheckbox,
      options: [
        { label: "Cold shower (30-60 sec)", value: "cold_shower" },
        {
          label: "Less heat/AC than comfortable",
          value: "less_climate_control",
        },
        {
          label: "Skip stimulants (coffee, guarana, etc.)",
          value: "skip_stimulants",
        },
      ],
      singleChoice: true,
    },
    label: "Today's Voluntary Discomfort",
    description: "Choose ONE small discomfort to practice today",
    schedule: {
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    },
  },
  {
    inputOptions: {
      inputId: "mindful_pause_taken",
      type: InputsConst.boolean,
    },
    label: "I have taken a mindful pause",
    schedule: {
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    },
  },
] as const;

/**
 * Get inputs by category
 */
// export const inputsByCategory = {
//   planning: inputsCollection.filter((i) => i.category === "planning"),
//   reflection: inputsCollection.filter((i) => i.category === "reflection"),
//   awareness: inputsCollection.filter((i) => i.category === "awareness"),
//   preparation: inputsCollection.filter((i) => i.category === "preparation"),
//   exercise: inputsCollection.filter((i) => i.category === "exercise"),
// } as const;

/**
 * Get inputs by component
 */
// export function getInputsByComponent(componentName: string): InputReference[] {
//   return inputsCollection.filter((i) => i.component === componentName);
// }

/**
 * Get input by ID
 */

type InputId = (typeof inputsPreconfigs)[number]["inputOptions"]["inputId"];

export function getInputById(inputId: InputId): InputConfig | null {
  return inputsAr.find((i) => i.id === inputId) || null;
}

export const inputsAr: InputConfig[] =
  inputsPreconfigs.map(generateInputConfigs);

export const inputsObj = inputsAr.reduce(
  (acc, input) => ({
    ...acc,
    [String(input.id)]: input,
  }),
  {} as Record<InputId, InputConfig>
);
