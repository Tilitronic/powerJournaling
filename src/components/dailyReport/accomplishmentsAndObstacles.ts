import { ComponentBuilder } from "src/services/ComponentBuilder";

export function accomplishmentsAndObstacles() {
  const componentName = "accomplishmentsAndObstacles";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 📊 Today's Wins & Lessons (⭐ RECOMMENDED - 3-5 min)");

  cb._guidance(
    `**Progress Principle** — tracking wins boosts motivation. Reframing setbacks builds resilience.
**Stoicism** — focus on what you CONTROLLED—your effort, not the outcome. "The obstacle is the way."
**Growth Mindset** — reflecting on WHY you succeeded or failed builds self-awareness.

Celebrate your wins. Learn from your setbacks. Both shape your character.`
  );

  cb._fancyTitle("Wins & Accomplishments", "🏆");

  cb._md("**Which win am I most proud of today?**");
  cb._text("proudest_win", "", "e.g., Finally finished that difficult task");

  cb._md("**Why did this matter to me?** (Connect to your values)");
  cb._text(
    "why_it_mattered",
    "",
    "e.g., It showed I can push through resistance"
  );

  cb._md(
    "**What virtue did I practice today?** (courage, wisdom, justice, self-control)"
  );
  cb._text(
    "virtue_practiced",
    "",
    "e.g., Self-control: I paused before reacting in anger"
  );

  cb._fancyTitle("Obstacles & Lessons", "🌊");

  cb._md("**What obstacle or failure did I face today?**");
  cb._text(
    "obstacle_today",
    "",
    "e.g., Procrastinated for 3 hours, missed deadline"
  );

  cb._md("**How did I respond?** (With resistance or acceptance?)");
  cb._text(
    "obstacle_response",
    "",
    "e.g., Got frustrated, then took a break to reset"
  );

  cb._md("**What can this teach me?** (The hidden opportunity)");
  cb._text(
    "obstacle_lesson",
    "",
    "e.g., I need better environment design to avoid distractions"
  );

  cb._md(
    '> **Stoic Reminder**: _"The impediment to action advances action. What stands in the way becomes the way."_ — Marcus Aurelius'
  );

  return cb.render();
}
