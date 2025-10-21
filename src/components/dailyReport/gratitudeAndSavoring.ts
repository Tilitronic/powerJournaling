import { ComponentBuilder } from "src/services/ComponentBuilder";

export function gratitudeAndSavoring() {
  const componentName = "gratitudeAndSavoring";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🙏 Gratitude & Savoring (⭐ RECOMMENDED - 3-7 min)");

  cb._guidance(
    `**Three Good Things Intervention** — writing WHY things went well is crucial for wellbeing.
**Stoicism** — negative visualization—appreciate what you have by imagining its loss.
**Positive Psychology** — gratitude is one of the strongest wellbeing predictors.

Savor simple pleasures: friendship, beauty, learning, nature. Your role matters.`
  );

  cb._md("### Three Good Things Today");

  // First good thing
  cb._md("**1. What happened:**");
  cb._text(
    "gratitude_1_what",
    "",
    "e.g., Had a great conversation with a friend"
  );

  cb._md("**Why it was good:**");
  cb._text("gratitude_1_why", "", "e.g., Felt understood and connected");

  cb._md("**My role in making it happen:**");
  cb._text(
    "gratitude_1_role",
    "",
    "e.g., I reached out and asked how they were doing"
  );

  cb._divider();

  // Second good thing
  cb._md("**2. What happened:**");
  cb._text("gratitude_2_what", "", "e.g., Enjoyed a beautiful sunset");

  cb._md("**Why it was good:**");
  cb._text("gratitude_2_why", "", "e.g., Felt peaceful and present");

  cb._md("**My role in making it happen:**");
  cb._text(
    "gratitude_2_role",
    "",
    "e.g., I paused my work to step outside and notice it"
  );

  cb._divider();

  // Third good thing
  cb._md("**3. What happened:**");
  cb._text("gratitude_3_what", "", "e.g., Made progress on a difficult task");

  cb._md("**Why it was good:**");
  cb._text("gratitude_3_why", "", "e.g., Felt capable and proud of my effort");

  cb._md("**My role in making it happen:**");
  cb._text("gratitude_3_role", "", "e.g., I stayed focused and didn't give up");

  cb._md(
    "> **Practice** — before sleep, briefly imagine losing one thing you're grateful for. Then appreciate that you still have it."
  );

  return cb.render();
}
