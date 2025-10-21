import { ComponentBuilder } from "src/services/ComponentBuilder";

export function attentionAndWillpower() {
  const componentName = "attentionAndWillpower";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🎯 Attention & Willpower Check (💡 OPTIONAL - 3-5 min)");

  cb._foldable(
    `**Hyperfocus** — attention is your most valuable resource. Protect it fiercely.
**The Willpower Instinct** — willpower depletes throughout the day and needs recovery (rest, breaks, nature).
**Atomic Habits** — environment shapes behavior more than motivation.

Track patterns. Design better environments. Restore your willpower.`
  );

  cb._fancyTitle("Attention Reflection", "👁️");

  cb._inputLabel("What distracted me most today?");
  cb._text(
    "main_distraction",
    "",
    "e.g., Social media notifications, colleague interruptions"
  );

  cb._inputLabel("When was I most focused?", "(Flow state moments)");
  cb._text("flow_moments", "", "e.g., Morning deep work session from 9-11am");

  cb._inputLabel(
    "What made my focus possible?",
    "(Environment, time, task type)"
  );
  cb._text(
    "flow_enablers",
    "",
    "e.g., Quiet office, early morning energy, challenging but doable task"
  );

  cb._fancyTitle("Willpower Reflection", "💪");

  cb._inputLabel("What was my biggest temptation/willpower challenge?");
  cb._text(
    "willpower_challenge",
    "",
    "e.g., Urge to check phone during work, skip workout"
  );

  cb._inputLabel(
    "What time did my willpower feel weakest?",
    "(Morning/afternoon/evening)"
  );
  cb._text("willpower_time", "", "e.g., Late afternoon around 4pm");

  cb._inputLabel("Did I resist or give in?", "(No judgment—just awareness)");
  cb._text(
    "willpower_outcome",
    "",
    "e.g., Gave in after lunch, resisted in the morning"
  );

  cb._inputLabel(
    "How did I restore my willpower today?",
    "(Rest, breaks, nature, nourishment)"
  );
  cb._text(
    "willpower_recovery",
    "",
    "e.g., Took a walk outside, ate a healthy snack, got good sleep"
  );

  cb._inputLabel(
    "Environmental fix",
    "What can I change tomorrow to make the right choice easier?"
  );
  cb._text(
    "environment_fix",
    "",
    "e.g., Put phone in another room, lay out workout clothes tonight"
  );

  cb._md(
    "> **Insight** — you can't control urges, but you can control your environment. Make good choices the easy choices."
  );

  return cb.render();
}
