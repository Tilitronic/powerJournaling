import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function accomplishmentsAndObstacles() {
  const componentId = "accomplishmentsAndObstacles";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 📊 Wins & Obstacles (⭐ RECOMMENDED)");

  cb._foldable(
    `**The Stoic Path** — "The obstacle is the way." Every setback is training.

_"The impediment to action advances action. What stands in the way becomes the way."_ — Marcus Aurelius

**Three Questions for Obstacles:**
1. **What happened?** (The external event—not in your control)
2. **How did I respond?** (Your reaction—entirely in your control)
3. **How will I overcome this?** (Your action plan—growth through adversity)

**Atomic Habits:** Every obstacle reveals a system flaw. Fix the system, not just the symptom.
**Growth Mindset:** You haven't mastered this *yet*. Struggle = growth happening.

Remember: You control your **effort, attitude, and response** — not outcomes.`
  );

  cb._fancyTitle("Wins & Accomplishments", "🏆");

  await cb._input(ips.accomplishments);
  cb._nl();

  cb._fancyTitle("Obstacles & The Way Forward", "⚔️");

  await cb._input(ips.obstacles);
  cb._nl();

  await cb._input(ips.if_then_plan);
  cb._nl();

  cb._md(
    "**Stoic Wisdom**: This obstacle is not blocking your path—it IS the path. It's revealing where you need to grow."
  );

  return cb.render();
}
