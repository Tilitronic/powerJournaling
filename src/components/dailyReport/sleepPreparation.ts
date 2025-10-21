import { ComponentBuilder } from "src/services/ComponentBuilder";

export function sleepPreparation() {
  const componentName = "sleepPreparation";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 💤 Sleep Preparation (💡 OPTIONAL - 2-3 min)");

  cb._foldable(
    `**Atomic Habits**: Make tomorrow's good habits obvious and easy tonight.
**Sleep Science**: Evening routine signals the brain to prepare for rest.

Set yourself up for success tomorrow. Prepare your environment tonight.`,
    "Tomorrow's Setup"
  );

  cb._md("### Make Tomorrow Easy");

  cb._inputLabel(
    "What can I prepare tonight to make tomorrow easier?",
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

  cb._md("### Sleep Environment");

  cb._boolean(
    "sleep_environment_ready",
    "I have prepared my sleep environment (devices away, room cool/dark)",
    false
  );

  cb._md(
    '> _"Tomorrow is a new opportunity to live with wisdom, courage, and kindness."_'
  );

  return cb.render();
}
