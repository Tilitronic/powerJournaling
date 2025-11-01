import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function voluntaryDiscomfort() {
  const componentId = "voluntaryDiscomfort";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 🧊 Voluntary Discomfort (💡 OPTIONAL - 2 min)");

  cb._foldable(
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

  cb._input(ips.voluntary_discomfort_practice);

  return await cb.render();
}
