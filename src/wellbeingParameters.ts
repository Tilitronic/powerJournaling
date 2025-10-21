import { WellbeingParameter } from "./types";

export const wellbeingParameters: WellbeingParameter[] = [
  {
    id: "positiveEmotions",
    label: "Positive Emotions",
    info: "Feelings of joy, gratitude, contentment, hope, and pleasure. Includes savoring the moment, reflecting on past positives, and hopeful anticipation of the future.",
    active: true,
  },
  {
    id: "engagement",
    label: "Engagement",
    info: "Deep involvement in activities; being absorbed, losing sense of time (‘flow’). Doing work or hobbies that challenge your skills just enough that you’re fully present.",
    active: true,
  },
  {
    id: "relationships",
    label: "Relationships",
    info: "Supportive, meaningful social connections. Feeling loved, valued, belonging; giving and receiving support. Close friendships, family bonds, community ties.",
    active: true,
    periodicity: 2,
  },
  {
    id: "meaning",
    label: "Meaning",
    info: "Having a sense of purpose, belonging to something bigger than yourself. Knowing what matters in your life and using your strengths in service of values, causes or goals.",
    active: true,
  },
  {
    id: "accomplishment",
    label: "Accomplishment",
    info: "Mastery, achievement, working toward goals. Sense of progress, competence, whether or not it brings immediate joy—achieving things that matter to you.",
    active: true,
  },
  {
    id: "sleepQuality",
    label: "Sleep Quality",
    info: "How well-rested you feel. Quality of sleep, sufficient hours, feeling refreshed upon waking. Sleep is foundational to physical and mental wellbeing.",
    active: true,
  },
  {
    id: "embodiment",
    label: "Embodiment",
    info: "Body acceptance and feeling at home in your body. Being present in your physical self, body image, self-compassion toward your body, feeling connected rather than disconnected from your physical form.",
    active: true,
    periodicity: 3,
  },
  {
    id: "physicalPleasure",
    label: "Physical Pleasure",
    info: "Sensory experiences and bodily comfort. Enjoying food, warmth, movement, relaxation. The simple joys of physical existence—a hot shower, soft blanket, delicious meal, or stretching your body.",
    active: true,
    periodicity: 2,
  },
  {
    id: "touchAndIntimacy",
    label: "Touch & Intimacy",
    info: "Physical affection, connection, and love. Hugs, cuddles, holding hands, sexual intimacy. The warmth and safety of physical closeness with loved ones. Human touch is a fundamental need.",
    active: true,
    periodicity: 3,
  },
  {
    id: "physicalCondition",
    label: "Physical Condition",
    info: "Your bodily health: exercise, energy levels and how physically capable you feel. General fitness and vitality.",
    active: true,
  },
  {
    id: "nutrition",
    label: "Nutrition",
    info: "Quality of your food choices and eating patterns. Nourishing your body with balanced meals, adequate hydration, and mindful eating. Good nutrition fuels energy, mood, and long-term health.",
    active: true,
  },
  {
    id: "mindset",
    label: "Mindset",
    info: "Cultivating optimism, resilience, self-efficacy, and a growth mindset. A positive mindset shapes how you interpret setbacks, sustain motivation, and approach challenges.",
    active: true,
  },
  {
    id: "environment",
    label: "Environment",
    info: "Living and working in spaces that feel safe, comfortable, and supportive of wellbeing. Includes access to nature, orderliness, and resources that help you thrive.",
    active: true,
    periodicity: 3,
  },
  {
    id: "economicSecurity",
    label: "Economic Security",
    info: "Having financial stability, freedom from chronic money stress, and satisfaction with work. Economic security supports autonomy and reduces background stress that erodes wellbeing.",
    active: true,
    periodicity: 10,
  },
] as const;
