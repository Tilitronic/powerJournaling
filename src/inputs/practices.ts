/**
 * Contemplative practices and mindfulness exercises
 * These are practices the user performs and then checks off when complete
 */
import { PeriodicityUnits as PU } from "src/services/ScheduleService";
import { MindPracticeConfig } from "./types";
import { InputsConst } from "src/services/InputCreator";

type MindPracticePreconfig = Omit<MindPracticeConfig, "inputOptions">;

const createMindPracticeConfig = (practice: MindPracticePreconfig) => ({
  ...practice,
  inputOptions: {
    inputId: practice.id,
    type: InputsConst.boolean,
    label: practice.label,
  },
});

export const meditationPractices: MindPracticePreconfig[] = [
  // Morning Reflection - Stoic & Taoist Practices
  {
    id: "dichotomy_of_control_practice",
    label: "Stoic Practice. The Dichotomy of Control",
    category: "stoic",
    component: "morningReflection",
    description:
      "Epictetus' core practice and foundational Stoic exercise that eliminates suffering by training you to focus only on what you can control",
    guide: `**The Core Principle:**
The Stoics discovered that **all suffering comes from desiring things outside your control**. When you stop struggling against the unchangeable and channel your energy into what you CAN control, you gain peace of mind.

**✅ COMPLETELY IN YOUR CONTROL:**
- Your judgments, opinions, and interpretations
- Your responses and reactions to events
- Your character, virtues, and values
- Your effort, attention, and choices
- How you treat others
- What you pursue and avoid

**❌ OUTSIDE YOUR CONTROL:**
- Other people's opinions, actions, and judgments
- Outcomes, results, and consequences
- Past events and future circumstances
- Your reputation and what others think
- External events (weather, traffic, delays)
- Natural processes (aging, sickness, death)

**How to Practice:**
When faced with any situation today, ask yourself: "Is this within my control?" If yes, take action. If no, accept it and focus on your response instead.

_"Make the best use of what is in your power, and take the rest as it happens."_ — Epictetus`,
  },
  {
    id: "wu_wei_practice",
    label: "Taoist Practice. Wu Wei (Effortless Action)",
    category: "taoist",
    component: "morningReflection",
    description:
      "Wu Wei teaches effortless action: responding to life's obstacles with flexibility rather than rigid resistance.",
    guide: `**The Core Principle:**
From Taoism comes the wisdom of "flowing like water." Water doesn't fight obstacles – it adapts, flows around them, and finds a way through. When you stop resisting what you cannot change, you conserve energy and discover creative solutions.

**How to Practice Wu Wei Today:**

1. **When you encounter an obstacle, pause and ask:**
   - "Can I change this?" → If yes, take calm action. If no, accept it.
   - "What can I learn from this?"
   - "How would water respond to this?"

2. **Remember:** Fighting against unchangeable circumstances drains your energy. Flowing with them preserves it.

3. **The shift:** From "This shouldn't be happening" to "This IS happening – how do I respond skillfully?"

_"The rigid tree breaks in the wind. The flexible tree bends and survives."_ — Taoist wisdom`,
  },
  {
    id: "obstacle_is_way_practice",
    label: "Stoic Practice. The Obstacle Is The Way",
    category: "stoic",
    component: "morningReflection",
    description:
      "Marcus Aurelius' teaching: obstacles contain hidden opportunities for growth",
    guide: `**The Core Principle:**
Marcus Aurelius taught: **"The impediment to action advances action. What stands in the way becomes the way."**

This means every obstacle contains hidden opportunity:
- **Blocked plan?** → Forces you to become more creative and resourceful
- **Frustrating person?** → Opportunity to practice patience and understanding
- **Failure?** → Valuable data for learning and improvement
- **Delay?** → Gift of time to prepare better or rest

**The Reframe:**
Stop seeing obstacles as enemies. Start seeing them as **training equipment** for your character. Each challenge makes you stronger, wiser, more resilient.

**How to Practice:**
When you face a setback today, ask: "What opportunity is hidden in this obstacle? How is this making me better?"

_"The obstacle is not blocking your path – it IS your path. It's revealing where you need to grow."_ — Ryan Holiday`,
  },

  // Other potential meditation/practice checkboxes from other components
  // Add more as we identify them
] as const;

export const practiceConfigs: MindPracticeConfig[] = meditationPractices.map(
  createMindPracticeConfig
);
