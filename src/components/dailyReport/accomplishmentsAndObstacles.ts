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

  cb._md("**My proudest win today** (no matter how small)");
  cb._text("proudest_win", "", "e.g., Stayed calm when criticized");

  cb._md("**What effort/virtue made this possible?**");
  cb._text(
    "what_i_controlled",
    "",
    "e.g., I practiced patience, took 3 deep breaths first"
  );

  cb._fancyTitle("Obstacles & The Way Forward", "⚔️");

  cb._md("**The obstacle I faced** (what happened—the external event)");
  cb._text(
    "obstacle_event",
    "",
    "e.g., My proposal was rejected; Coworker criticized me harshly"
  );

  cb._md("**My response** (How did I react? Acceptance or resistance?)");
  cb._text(
    "my_response",
    "",
    "e.g., Initially angry, then realized it's not personal; Felt defensive"
  );

  cb._md("**The lesson** (What is this obstacle teaching me?)");
  cb._text(
    "obstacle_lesson",
    "",
    "e.g., I need to separate my ego from my work; I'm too attached to approval"
  );

  cb._md("**How I'll use this obstacle** (Turn adversity into advantage)");
  cb._text(
    "obstacle_advantage",
    "",
    "e.g., Revise proposal with feedback—make it stronger; Practice not seeking validation"
  );

  cb._md("**My implementation intention** (If this happens again, I will...)");
  cb._md("*If [OBSTACLE], then I will [RESPONSE]*");
  cb._text(
    "if_then_plan",
    "",
    "e.g., If criticized, I'll pause 10 seconds, say 'thank you,' then decide if it's useful"
  );

  cb._md(
    '> **Stoic Wisdom**: This obstacle is not blocking your path—it IS the path. It\'s revealing where you need to grow.'
  );

  return cb.render();
}
