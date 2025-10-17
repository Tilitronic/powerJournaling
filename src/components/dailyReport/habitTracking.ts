import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";

export function habitTracking() {
  const componentName = "habitTracking";
  const cb = new ComponentBuilder(componentName);
  const habits = config.habits;

  habits.forEach((habit) => {
    if (!habit.active) return;

    cb._boolean(habit.id, habit.label);
    cb._md(`*Cue*. ${habit.cue} · *Reward*. ${habit.reward}`);
    // cb._md(`*Cue*. ${habit.cue}`);
    // cb._md(`*Reward*. ${habit.reward}`);
  });
  cb._text("Test Text Input");
  cb._md("***");
  cb._number("Test Number Input 1");
  cb._md("***");
  cb._number("Test Number Input 2");
  cb._md("***");
  cb._multiCheckbox("Test MultiCheckbox Input", [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
    { label: "Option 3", value: "option_3" },
  ]);
  cb._md("***");
  cb._richText("Test Rich Text Input");
  cb._md("***");
  cb._multiCheckbox("Test MultiCheckbox Input", [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
    { label: "Option 3", value: "option_3" },
  ]);

  return cb.render();
}
