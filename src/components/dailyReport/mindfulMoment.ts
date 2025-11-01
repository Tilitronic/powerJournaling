import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function mindfulMoment() {
  const componentId = "mindfulMoment";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 🧘 Mindful Moment (💡 OPTIONAL - 2-3 min)");

  cb._foldable(
    `**Present Moment Awareness** — The antidote to anxiety

Anxiety lives in the future (what if?). Regret lives in the past (if only...). Peace lives in NOW.

**The Problem** — your mind is NEVER here. You eat lunch while planning dinner. You're with friends while mentally at work. You miss your ENTIRE LIFE because you're always somewhere else.

**The Solution** — train yourself to return to the present moment—over and over.

**What this practice does:**
- **Reduces anxiety** — the present moment is usually fine. Suffering is in your head.
- **Increases joy** — life's beauty exists NOW, not in memory or anticipation
- **Improves focus** — your attention is your most valuable resource
- **Creates calm** — presence is inherently peaceful
- **Builds gratitude** — you notice what you usually miss

**Why it works** (neuroscience):
Your brain has two modes:
- **Default Mode** (wandering mind) — predicts, plans, worries, ruminates = stress
- **Present Mode** (focused attention) — observes, senses, experiences = calm

This practice trains you to shift from Default to Present mode at will.

**How to practice:**
This is NOT about emptying your mind. It's about NOTICING when you were present today, and appreciating that moment.

When you recall being fully present—even for 5 seconds—you're training your brain to recognize and seek presence.`,
    "Mindfulness Practice"
  );

  cb._md("### Practice (2 minutes)");

  cb._md("**Step 1** — ground yourself");
  cb._md(
    "Close your eyes or soften your gaze. Take three slow, deep breaths. Feel your body in the chair."
  );
  cb._md("**Step 2** — recall one present moment");
  cb._md(
    "Remember ONE moment from today when you were fully HERE — no past, no future, just NOW:"
  );
  cb._md("- Morning coffee warmth on your hands");
  cb._md("- A genuine laugh with someone");
  cb._md("- Sunlight on your skin");
  cb._md("- The taste of your lunch");
  cb._md("- Wind in your hair");
  cb._md("- A moment of quiet");
  cb._md("**Step 3** — explore the memory");
  cb._md("Hold that memory. Notice the details:");
  cb._md("- What did you SEE? (Colors, light, movement)");
  cb._md("- What did you HEAR? (Sounds, silence, rhythm)");
  cb._md("- What did you FEEL? (Temperature, texture, sensation)");
  cb._md("- What did you SMELL? TASTE?");
  cb._md("**Step 4** — appreciate");
  cb._md(
    "That simple moment—THAT is life. Not achievements or plans. Just being fully alive, right here, right now."
  );

  cb._input(ips.mindful_pause_taken);

  cb._md('> _"The present moment is all you ever have."_ — Eckhart Tolle');
  cb._md('> _"When you wash the dishes, wash the dishes."_ — Thích Nhất Hạnh');

  return await cb.render();
}
