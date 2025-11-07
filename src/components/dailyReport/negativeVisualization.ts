import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";
import { dbService } from "src/services/DbService";
import { ReportTypes } from "src/reportDefinitions";
import { subMonths, format } from "date-fns";

export async function negativeVisualization() {
  const componentId = "negativeVisualization";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 🪞 Negative Visualization (💡 OPTIONAL)");

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

  // Get top 10 most frequently visualized things from last 6 months
  try {
    const allInputs = await dbService.getInputsById(
      ReportTypes.ALMOST_DAILY,
      "negative_visualization"
    );

    if (allInputs && allInputs.length > 0) {
      // Filter to last 6 months
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");
      const recentInputs = allInputs.filter(
        (input) => input.reportDate >= sixMonthsAgo && input.value
      );

      if (recentInputs.length > 0) {
        // Count frequencies (normalize to lowercase)
        const frequencyMap = new Map<string, number>();
        recentInputs.forEach((input) => {
          const value = String(input.value).trim().toLowerCase();
          if (value) {
            frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
          }
        });

        // Sort by frequency and get top 10
        const topItems = Array.from(frequencyMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([item, count]) => ({ item, count }));

        if (topItems.length > 0) {
          cb._md("\n**Your Most Visualized (Last 6 Months):**");
          topItems.forEach(({ item, count }) => {
            cb._md(`- ${item} (${count}×)`);
          });
        }
      }
    }
  } catch (err) {
    console.error("Error fetching negative visualization history:", err);
  }

  cb._input(ips.negative_visualization);

  return await cb.render();
}
