import { ComponentBuilder } from "src/services/ComponentBuilder";

export function messageForTomorrow() {
  const componentName = "messageForTomorrow";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 💌 Message & Intention for Tomorrow (📌 CORE - 2 min)");

  cb._guidance(
    `Set yourself up for success tomorrow with clarity and encouragement.

**Tomorrow's Priority**: What's the ONE thing that matters most? When and where will you do it?
**Message to Future Self**: A reminder, encouragement, or lesson you don't want to forget.

Keep it short and meaningful. Your future self will thank you. �`
  );

  cb._md("**Tomorrow's #1 Priority**");
  cb._text("tomorrow_priority");

  cb._md("**Message for Tomorrow**");
  cb._richText("message_for_tomorrow");

  return cb.render();
}
