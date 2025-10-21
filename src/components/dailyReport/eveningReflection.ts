import { ComponentBuilder } from "src/services/ComponentBuilder";

export function eveningReflection() {
  const componentName = "eveningReflection";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🌙 Evening Reflection (⭐ RECOMMENDED - 2-3 min)");

  cb._guidance(
    `**The Stoic Evening Review** — Ancient wisdom for modern peace

The Stoics ended each day with self-examination. Not to judge themselves harshly, but to **learn, release, and sleep peacefully**.

**The Problem** — most people replay their day with regret or worry. They obsess over what they said, what went wrong, what others think. They carry the whole day into their sleep—and wake up still carrying it.

**The Stoic Solution** — examine your day through the lens of CONTROL. Did you do your best with what you COULD control? If yes—peace. If no—learn and release.

**What this practice does:**
- **Ends the day cleanly** — nothing carried into tomorrow that doesn't belong
- **Promotes learning** — every day becomes data for improvement
- **Reduces rumination** — you examined it once, mindfully. No need to replay endlessly.
- **Cultivates self-compassion** — you did your best with what you knew and what you could control
- **Improves sleep** — a peaceful mind sleeps deeply

**The Daily Question** (from Marcus Aurelius):
Not "Was I perfect?" but "Did I show up with virtue?"

**How to practice:**
Take 2 minutes. Review your day through the Dichotomy of Control:
- What was IN your control? (Your actions, responses, effort, character)
- What was NOT in your control? (Outcomes, other people, circumstances)
- Did you do your best with what you COULD control?

Then: learn if needed. Release what wasn't yours. Sleep in peace.`,
    "Stoic Review"
  );

  cb._inputLabel(
    "The Stoic Evening Question:",
    "_Did I do my best with what was in my control today?_"
  );

  cb._multiCheckboxSC(
    "stoic_evening_reflection",
    [
      { label: "Yes - I showed up with virtue", value: "virtue" },
      { label: "No - But I learned something valuable", value: "learned" },
      { label: "Partially - Progress, not perfection", value: "progress" },
    ],
    undefined,
    false
  );

  cb._inputLabel(
    "What's one thing I'm better at today than yesterday?",
    "Even 1% improvement compounds."
  );
  cb._text(
    "daily_improvement",
    "",
    "e.g., More patient, better listener, clearer thinking"
  );

  cb._boolean(
    "evening_reflection_done",
    "I have completed this evening reflection",
    false
  );

  cb._md(
    '> _"When you lie down, review your day. What did I do well? What could I improve? What did I leave undone?"_ — Epictetus'
  );
  cb._md('> _"I release what I cannot control. I am grateful for this day."_');

  return cb.render();
}
