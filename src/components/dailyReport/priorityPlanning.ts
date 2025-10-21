import { ComponentBuilder } from "src/services/ComponentBuilder";

export function priorityPlanning() {
  const componentName = "priorityPlanning";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🎯 Priority Planning (📌 CORE - 3 min)");

  cb._guidance(
    `**Atomic Habits Principle** — implementation intentions double success rates.

**Template** — "I will [BEHAVIOR] at [TIME] in [LOCATION]."

Be specific. Clarity creates commitment.`,
    "Implementation Intentions"
  );

  cb._md("**My #1 Priority Today** (the ONE thing that matters most):");
  cb._text("priority_today", "", "e.g., 'Finish the project proposal'");

  cb._md("**When & Where** (be specific):");
  cb._text(
    "when_where",
    "",
    "e.g., 'At 9 AM in my home office with phone on airplane mode'"
  );

  cb._md("**If-Then Plan** (prepare for obstacles):");
  cb._md("*If [OBSTACLE], then I will [SOLUTION]*");
  cb._text(
    "obstacle_plan",
    "",
    "e.g., 'If I feel distracted, then I'll take a 5-minute walk and return'"
  );

  return cb.render();
}
