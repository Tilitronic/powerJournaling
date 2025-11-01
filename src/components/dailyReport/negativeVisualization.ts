import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function negativeVisualization() {
  const componentId = "negativeVisualization";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 🪞 Negative Visualization (💡 OPTIONAL - 2 min)");

  cb._foldable(
    `**Praemeditatio Malorum** — Ancient Stoic gratitude practice

This is NOT pessimism. This is **appreciation training** that the Stoics practiced daily.

**The Problem** — we take everything for granted. Your health, your home, your loved ones — you stop seeing them. Hedonic adaptation makes you numb to your blessings.

**The Solution** — briefly imagine losing what you value. When you mentally "lose" something, you suddenly SEE it again with fresh eyes.

**What this practice does:**
- **Breaks hedonic adaptation** — stop taking good things for granted
- **Generates genuine gratitude** — feel appreciation, not just think it  
- **Prepares you mentally** — if loss happens, the shock is less severe
- **Increases present joy** — savor what you have RIGHT NOW

**How to practice:**
1. Close your eyes for 10-20 seconds
2. Vividly imagine ONE thing you value being gone (person, health, home, ability)
3. Feel the loss — let it be uncomfortable for a moment
4. Open your eyes and appreciate that you STILL HAVE IT

This isn't dwelling on loss. It's a quick mental exercise to restore wonder.

_"He robs present ills of their power who has perceived their coming beforehand."_ — Seneca`,
    "Stoic Gratitude Practice"
  );

  cb._md("**Practice Steps:**");
  cb._md("1. **Close your eyes** — take a slow breath");
  cb._md(
    "2. **Imagine the loss** — picture losing someone/something you love (10 seconds)"
  );
  cb._md("3. **Feel it** — don't rush past the discomfort");
  cb._md(
    "4. **Open your eyes** — look around. You still have them. Feel that relief."
  );

  cb._input(ips.negative_visualization_done);

  return await cb.render();
}
