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

  return cb.render();
}
