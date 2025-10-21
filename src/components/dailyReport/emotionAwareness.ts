import { ComponentBuilder } from "src/services/ComponentBuilder";

export function emotionAwareness() {
  const componentName = "emotionAwareness";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 💭 Emotion Awareness (💡 OPTIONAL - 3-5 min)");

  cb._guidance(
    `**Emotional Intelligence** — recognizing emotions is the first step to managing them.
**Stoicism** — you can't control feelings arising, but you can control your response.
**Neuroscience** — naming emotions reduces their intensity (affect labeling).

No judgment—just awareness and learning.`
  );

  cb._md("### Today's Emotional Landscape");

  cb._inputLabel("What was the strongest emotion I felt today?");
  cb._text("strongest_emotion", "", "e.g., Frustration, joy, anxiety, pride");

  cb._inputLabel("What triggered it?");
  cb._text(
    "emotion_trigger",
    "",
    "e.g., Criticism from colleague, completing a goal"
  );

  cb._inputLabel("How did I respond?", "(What did I do/say?)");
  cb._text("emotion_response", "", "e.g., Snapped back, withdrew, celebrated");

  cb._inputLabel(
    "On reflection, was this in my control or outside my control?"
  );
  cb._text(
    "emotion_control_assessment",
    "",
    "e.g., The trigger was outside; my response was in my control"
  );

  cb._inputLabel("What would my 'wise self' do next time?");
  cb._text(
    "emotion_wise_response",
    "",
    "e.g., Pause and breathe before responding, express needs calmly"
  );

  cb._md(
    '> **Practice** — when strong emotions arise, pause and label: _"I\'m feeling [emotion]."_ This creates space between feeling and reaction.'
  );

  return cb.render();
}
