import { ComponentBuilder } from "src/services/ComponentBuilder";

export function gratitudeAndSavoring() {
  const componentName = "gratitudeAndSavoring";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🙏 Gratitude & Savoring (⭐ RECOMMENDED - 3-7 min)");

  cb._foldable(
    `**Three Good Things Intervention** — writing WHY things went well is crucial for wellbeing.
**Stoicism** — negative visualization—appreciate what you have by imagining its loss.
**Positive Psychology** — gratitude is one of the strongest wellbeing predictors.

Savor simple pleasures: friendship, beauty, learning, nature. Your role matters.`
  );

  cb._md("### Three Good Things Today");

  // First good thing
  cb._inputLabel(
    "1. Good Thing #1",
    "*What happened? Why was it good? What was your role?*"
  );
  cb._richText(
    "gratitude_1",
    "",
    "e.g., Had a great conversation with a friend. Felt understood and connected. I reached out and asked how they were doing."
  );

  cb._divider();

  // Second good thing
  cb._inputLabel(
    "2. Good Thing #2",
    "*What happened? Why was it good? What was your role?*"
  );
  cb._richText(
    "gratitude_2",
    "",
    "e.g., Enjoyed a beautiful sunset. Felt peaceful and present. I paused my work to step outside and notice it."
  );

  cb._divider();

  // Third good thing
  cb._inputLabel(
    "3. Good Thing #3",
    "*What happened? Why was it good? What was your role?*"
  );
  cb._richText(
    "gratitude_3",
    "",
    "e.g., Made progress on a difficult task. Felt capable and proud of my effort. I stayed focused and didn't give up."
  );

  cb._md(
    "> **Practice** — before sleep, briefly imagine losing one thing you're grateful for. Then appreciate that you still have it."
  );

  return cb.render();
}
