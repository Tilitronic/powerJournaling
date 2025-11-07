import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";
import { dbService } from "src/services/DbService";
import { ReportTypes } from "src/reportDefinitions";
import { subDays, format } from "date-fns";

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

  cb._input(ips.memento_mori_focus);

  // Check if there's a tomorrow_priority from yesterday's report
  let showPriorityPlan = true;

  try {
    // Get yesterday's date
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    // Get all tomorrow_priority inputs from yesterday
    const yesterdayPriorities = await dbService.getInputsInDateRange(
      ReportTypes.ALMOST_DAILY,
      "tomorrow_priority",
      yesterday,
      yesterday
    );

    // If there's a non-empty priority from yesterday, don't show priority_plan
    const hasYesterdayPriority = yesterdayPriorities.some(
      (input) => input.value && (input.value as string).trim().length > 0
    );

    if (hasYesterdayPriority) {
      showPriorityPlan = false;
    }
  } catch (err) {
    console.error("Error checking yesterday's priority:", err);
    // On error, show the input anyway
  }

  if (showPriorityPlan) {
    cb._input(ips.priority_plan);
  }

  return await cb.render();
}
