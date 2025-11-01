import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function attentionAndWillpower() {
  const componentId = "attentionAndWillpower";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 🎯 Attention & Willpower Check (💡 OPTIONAL - 3-5 min)");

  cb._foldable(
    `**Hyperfocus** — attention is your most valuable resource. Protect it fiercely.
**The Willpower Instinct** — willpower depletes throughout the day and needs recovery (rest, breaks, nature).
**Atomic Habits** — environment shapes behavior more than motivation.

Track patterns. Design better environments. Restore your willpower.`
  );

  cb._fancyTitle("Attention Reflection", "👁️");

  cb._input(ips.main_distraction);
  cb._input(ips.flow_moments);

  cb._fancyTitle("Willpower Reflection", "💪");

  cb._input(ips.willpower_challenge);

  cb._md(
    "**Insight** — you can't control urges, but you can control your environment. Make good choices the easy choices."
  );

  return await cb.render();
}
