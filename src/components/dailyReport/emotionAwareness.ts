import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";

export async function emotionAwareness() {
  const componentId = "emotionAwareness";
  const cb = new ComponentBuilder(componentId);

  cb._md("## 💭 Emotion Awareness (💡 OPTIONAL - 3-5 min)");

  cb._foldable(
    `**Emotional Intelligence** — recognizing emotions is the first step to managing them.
**Stoicism** — you can't control feelings arising, but you can control your response.
**Neuroscience** — naming emotions reduces their intensity (affect labeling).

No judgment—just awareness and learning.`
  );

  cb._md("### Today's Emotional Landscape");

  cb._input(ips.strongest_emotion);
  cb._input(ips.emotion_trigger);
  cb._input(ips.emotion_response);
  cb._input(ips.better_emotion_response);

  cb._md(
    '> **Practice** — when strong emotions arise, pause and label: _"I\'m feeling [emotion]."_ This creates space between feeling and reaction.'
  );

  return await cb.render();
}
