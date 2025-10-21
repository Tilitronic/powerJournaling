import { ComponentBuilder } from "src/services/ComponentBuilder";

export function eveningPreparation() {
  const componentName = "eveningPreparation";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🌙 Evening Preparation Ritual");

  cb._guidance(
    `**Atomic Habits**: Make tomorrow's good habits obvious and easy tonight.
**Stoicism**: End each day without regret—you did what was in your control.
**Sleep Science**: Evening routine signals the brain to prepare for rest.

Close the day gracefully. Set up tomorrow for success.`
  );

  cb._md("---");
  cb._md("### Step 1: Tomorrow's Setup (Make It Easy)");

  cb._md("**What can I prepare tonight to make tomorrow easier?**");
  cb._md(
    "_Examples: Lay out workout clothes, prep lunch, charge devices, set out book_"
  );
  cb._text(
    "tomorrow_prep_action",
    "",
    "e.g., Lay out gym clothes, prepare breakfast ingredients"
  );

  cb._boolean(
    "tomorrow_prep_done",
    "I have prepared something for tomorrow",
    false
  );

  cb._md("---");
  cb._md("### Step 2: Closing Reflection");

  cb._md("**Stoic Evening Question:**");
  cb._md("_Did I do my best with what was in my control today?_");

  cb._multiCheckboxSC(
    "stoic_evening_reflection",
    [
      { label: "Yes - I showed up with virtue", value: "virtue" },
      { label: "No - But I learned something", value: "learned" },
      { label: "Partially - Progress, not perfection", value: "progress" },
    ],
    undefined,
    false
  );

  cb._md("**What's one thing I'm better at today than yesterday?**");
  cb._text(
    "daily_improvement",
    "",
    "e.g., More patient, better listener, clearer thinking"
  );

  cb._md("---");
  cb._md("### Step 3: Gratitude & Sleep Preparation");

  cb._md("**Negative Visualization Practice** (Stoic gratitude):");
  cb._md(
    "_Take a moment to imagine losing one thing you're grateful for today._"
  );
  cb._md("_Then appreciate that you still have it._");

  cb._boolean(
    "sleep_environment_ready",
    "I have prepared my sleep environment (devices away, room cool/dark)",
    false
  );

  cb._md("**Final thought before sleep:**");
  cb._md(
    '_"I release what I cannot control. I am grateful for this day. Tomorrow is a new opportunity to live with wisdom, courage, and kindness."_'
  );

  cb._boolean(
    "evening_reflection_complete",
    "I have completed my evening reflection",
    false
  );

  return cb.render();
}
