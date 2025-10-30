import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function messageForTomorrow() {
  const componentId = "messageForTomorrow";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 💌 Message & Intention for Tomorrow (📌 CORE - 2 min)");

  cb._foldable(
    `Set yourself up for success tomorrow with clarity and encouragement.

**Tomorrow's Priority**: What's the ONE thing that matters most? When and where will you do it?
**Message to Future Self**: A reminder, encouragement, or lesson you don't want to forget.

What can I prepare tonight to make tomorrow easier?

Which PERMA plus parameter needs special attention tomorrow?

Keep it short and meaningful. Your future self will thank you.`
  );

  await cb._input(ips.tomorrow_priority);
  await cb._input(ips.message_for_tomorrow);
  await cb._input(ips.plan_next_day);

  return cb.render();
}
