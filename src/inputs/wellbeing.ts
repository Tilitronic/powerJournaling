import { PeriodicityUnits as PU } from "src/services/ScheduleService";
import { WellbeingConfig } from "src/inputs/types";
import { InputsConst } from "src/services/InputCreator";

const ratingOptions = [
  { label: "3 - Great", value: "3" },
  { label: "2 - Adequate", value: "2" },
  { label: "1 - Struggling", value: "1" },
];

type WellbeingPreconfig = Omit<WellbeingConfig, "inputOptions">;

const createWellbeingConfig = (param: WellbeingPreconfig) => ({
  ...param,
  inputOptions: {
    inputId: param.id,
    type: InputsConst.multicheckbox,
    options: ratingOptions,
    singleChoice: true,
  },
});

const wellbeingPreconfigs: WellbeingPreconfig[] = [
  {
    id: "positiveEmotions",
    label: "Positive Emotions",
    description:
      "Feelings of joy, gratitude, contentment, hope, and pleasure. Includes savoring the moment, reflecting on past positives, and hopeful anticipation of the future.",
  },
  {
    id: "engagement",
    label: "Engagement",
    description:
      "Deep involvement in activities; being absorbed, losing sense of time (‘flow’). Doing work or hobbies that challenge your skills just enough that you’re fully present.",
  },
  {
    id: "relationships",
    label: "Relationships",
    description:
      "Supportive, meaningful social connections. Feeling loved, valued, belonging; giving and receiving support. Close friendships, family bonds, community ties.",
    schedule: {
      showEvery: { count: 2, unit: PU.Day },
    },
  },
  {
    id: "meaning",
    label: "Meaning",
    description:
      "Having a sense of purpose, belonging to something bigger than yourself. Knowing what matters in your life and using your strengths in service of values, causes or goals.",
  },
  {
    id: "accomplishment",
    label: "Accomplishment",
    description:
      "Mastery, achievement, working toward goals. Sense of progress, competence, whether or not it brings immediate joy—achieving things that matter to you.",
  },
  {
    id: "sleepQuality",
    label: "Sleep Quality",
    description:
      "How well-rested you feel. Quality of sleep, sufficient hours, feeling refreshed upon waking. Sleep is foundational to physical and mental wellbeing.",
  },
  {
    id: "embodiment",
    label: "Embodiment",
    description:
      "Body acceptance and feeling at home in your body. Being present in your physical self, body image, self-compassion toward your body, feeling connected rather than disconnected from your physical form.",
    schedule: {
      showEvery: { count: 3, unit: PU.Day },
    },
  },
  {
    id: "physicalPleasure",
    label: "Physical Pleasure",
    description:
      "Sensory experiences and bodily comfort. Enjoying food, warmth, movement, relaxation. The simple joys of physical existence—a hot shower, soft blanket, delicious meal, or stretching your body.",
    schedule: {
      showEvery: { count: 2, unit: PU.Day },
    },
  },
  {
    id: "touchAndIntimacy",
    label: "Touch & Intimacy",
    description:
      "Physical affection, connection, and love. Hugs, cuddles, holding hands, sexual intimacy. The warmth and safety of physical closeness with loved ones. Human touch is a fundamental need.",
    schedule: {
      showEvery: { count: 3, unit: PU.Day },
    },
  },
  {
    id: "physicalCondition",
    label: "Physical Condition",
    description:
      "Your bodily health: exercise, energy levels and how physically capable you feel. General fitness and vitality.",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    description:
      "Quality of your food choices and eating patterns. Nourishing your body with balanced meals, adequate hydration, and mindful eating. Good nutrition fuels energy, mood, and long-term health.",
  },
  {
    id: "mindset",
    label: "Mindset",
    description:
      "Cultivating optimism, resilience, self-efficacy, and a growth mindset. A positive mindset shapes how you interpret setbacks, sustain motivation, and approach challenges.",
  },
  {
    id: "environment",
    label: "Environment",
    description:
      "Living and working in spaces that feel safe, comfortable, and supportive of wellbeing. Includes access to nature, orderliness, and resources that help you thrive.",
    schedule: {
      showEvery: { count: 3, unit: PU.Day },
    },
  },
  {
    id: "economicSecurity",
    label: "Economic Security",
    description:
      "Having financial stability, freedom from chronic money stress, and satisfaction with work. Economic security supports autonomy and reduces background stress that erodes wellbeing.",
    schedule: {
      showEvery: { count: 10, unit: PU.Day },
    },
  },
] as const;

export const wellbeingConfigs: WellbeingConfig[] = wellbeingPreconfigs.map(
  createWellbeingConfig
);
