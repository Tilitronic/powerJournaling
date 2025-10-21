import { ComponentBuilder } from "src/services/ComponentBuilder";

export function priorityPlanning() {
  const componentName = "priorityPlanning";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🎯 Priority Planning (📌 CORE - 3-5 min)");

  cb._guidance(
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

  cb._md(
    '**Death Reflection:** "If today were my last day, which pillar needs my attention most?"'
  );
  cb._text(
    "priority_pillar",
    "",
    "e.g., 'Relationships - my family needs more of my presence and love'"
  );

  cb._md("**My #1 Priority Today** (the ONE thing that matters most)");
  cb._text(
    "priority_today",
    "",
    "e.g., 'Call mom and have a real conversation'"
  );

  cb._md("**When & Where** (be specific)");
  cb._text(
    "when_where",
    "",
    "e.g., 'At 7 PM after dinner, sitting in the quiet room with no distractions'"
  );

  cb._md("**If-Then Plan** (prepare for obstacles)");
  cb._md("*If [OBSTACLE], then I will [SOLUTION]*");
  cb._text(
    "obstacle_plan",
    "",
    "e.g., 'If I feel awkward opening up, I'll remember she won't be here forever'"
  );

  return cb.render();
}
