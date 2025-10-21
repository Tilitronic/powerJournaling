import { ComponentBuilder } from "src/services/ComponentBuilder";

export function accomplishmentsAndObstacles() {
  const componentName = "accomplishmentsAndObstacles";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 📊 Wins & Obstacles (⭐ RECOMMENDED - 4-6 min)");

  cb._guidance(
    `**The Stoic Path** — "The obstacle is the way." Every setback is training.

_"The impediment to action advances action. What stands in the way becomes the way."_ — Marcus Aurelius

**Three Questions for Obstacles:**
1. **What happened?** (The external event—not in your control)
2. **How did I respond?** (Your reaction—entirely in your control)
3. **How will I overcome this?** (Your action plan—growth through adversity)

**Atomic Habits:** Every obstacle reveals a system flaw. Fix the system, not just the symptom.
**Growth Mindset:** You haven't mastered this *yet*. Struggle = growth happening.

Remember: You control your **effort, attitude, and response**—not outcomes.`
  );

  cb._fancyTitle("Wins & Accomplishments", "🏆");

  cb._inputLabel(
    "My Win Today",
    "*What was my proudest accomplishment? What effort/virtue made it possible?*"
  );
  cb._text(
    "wins_combined",
    "",
    "e.g., Stayed calm when criticized. I practiced patience by taking 3 deep breaths first and remembering it's not personal."
  );

  cb._fancyTitle("Obstacles & The Way Forward", "⚔️");

  cb._inputLabel(
    "My Obstacle & Learning",
    "*What happened? How did I respond? What did I learn? How will I use this?*"
  );
  cb._text(
    "obstacle_combined",
    "",
    "e.g., My proposal was rejected. Initially angry, then realized it's not personal. Learned I'm too attached to approval. Will practice not seeking validation and revise with feedback to make it stronger."
  );

  cb._inputLabel(
    "My Implementation Intention",
    "(If this happens again, I will...) *If [OBSTACLE], then I will [RESPONSE]*"
  );
  cb._text(
    "if_then_plan",
    "",
    "e.g., If criticized, I'll pause 10 seconds, say 'thank you,' then decide if it's useful"
  );

  cb._md(
    "> **Stoic Wisdom**: This obstacle is not blocking your path—it IS the path. It's revealing where you need to grow."
  );

  return cb.render();
}
