import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function priorityPlanning() {
  const componentId = "priorityPlanning";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 🎯 Priority Planning (📌 CORE - 3-5 min)");

  cb._foldable(
    `**Start with Death, Plan with Clarity**

**Memento Mori** (from Stoicism) — "Remember you will die." This isn't morbid—it's the ultimate focusing tool. When you remember death, trivialities fade and what truly matters becomes crystal clear.

**The Four Pillars of Life:**
1. **Happiness & Peace of Mind** — inner tranquility and joy
2. **Body & Health** — physical wellbeing and vitality  
3. **People & Relationships** — love, connection, community
4. **Meaningful Work** — contributing something valuable

_"You could leave life right now. Let that determine what you do and say and think."_ — Marcus Aurelius

**Implementation Intentions** (from Atomic Habits) — being specific doubles success rates:
"I will [BEHAVIOR] at [TIME] in [LOCATION]."

**The Process:**
1. Remember death → What pillar needs attention?
2. Choose ONE priority that serves that pillar
3. Make a specific plan with when/where
4. Prepare for obstacles`,
    "Memento Mori + Implementation Intentions"
  );

  await cb._input(ips.priority_pillar);
  await cb._input(ips.priority_plan);

  return cb.render();
}
