import { ComponentBuilder } from "src/services/ComponentBuilder";

export function voluntaryDiscomfort() {
  const componentName = "voluntaryDiscomfort";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🧊 Voluntary Discomfort (💡 OPTIONAL - 2 min)");

  cb._guidance(
    `**Practicing Poverty** — Seneca's resilience training

The Stoics deliberately practiced small discomforts. Not to punish themselves, but to build mental strength and appreciation.

**The Problem** — modern life is TOO comfortable. We become weak, dependent on luxuries, and terrified of any discomfort. When hardship comes, we collapse.

**The Stoic Solution** — regularly choose small, voluntary discomforts. This trains your mind that discomfort is survivable—even beneficial.

**What this practice does:**
1. **Builds resilience** — when real hardship comes, you're prepared
2. **Breaks hedonic adaptation** — you stop taking comfort for granted
3. **Strengthens willpower** — you prove you can control urges  
4. **Increases appreciation** — comfort feels AMAZING after voluntary discomfort
5. **Reduces fear** — you learn: "Discomfort won't kill me. I'm stronger than I thought."

**The Science** — your brain predicts suffering based on past experience. If you've never been uncomfortable, small discomforts feel catastrophic. If you practice discomfort, your brain learns: "This is manageable."

**How to practice:**
Choose ONE small discomfort today. Not as punishment — as TRAINING.
- Physical: cold shower, skip a meal, exercise when tired
- Social: have the difficult conversation, say no to someone
- Habitual: skip coffee, no phone for 2 hours, sit in silence

**Key** — the discomfort should be VOLUNTARY and MILD. You're training, not torturing.

_"We suffer more often in imagination than in reality."_ — Seneca
_"Set aside a certain number of days to be content with little and practice poverty."_ — Seneca`,
    "Stoic Resilience Training"
  );

  cb._md("**Today's Voluntary Discomfort** (choose ONE):");
  cb._md(
    "- **Physical** — cold shower (30-60 sec), skip dessert, walk instead of drive"
  );
  cb._md(
    "- **Social** — difficult conversation, saying no, asking for what you need"
  );
  cb._md(
    "- **Habitual** — skip coffee/treat, no phone for 2 hrs, wake 30 min earlier"
  );
  cb._md("- **Environmental** — sit on floor, less heat/AC, simpler meal");

  cb._md("**Your choice** (be specific about what, when, and for how long):");
  cb._text(
    "voluntary_discomfort_choice",
    "",
    "e.g., 'Cold shower for 60 seconds after regular shower, at 7am'"
  );

  cb._boolean(
    "voluntary_discomfort_done",
    "I practiced voluntary discomfort today",
    false
  );

  return cb.render();
}
