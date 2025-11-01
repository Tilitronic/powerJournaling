import { ComponentBuilder } from "src/services/ComponentBuilder";
import { inputsObj as ips } from "src/inputs";
export async function gratitudeAndSavoring() {
  const componentName = "gratitudeAndSavoring";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🙏 Gratitude & Savoring (⭐ RECOMMENDED)");

  cb._foldable(
    `**Three Good Things Intervention** — writing WHY things went well is crucial for wellbeing.
**Stoicism** — negative visualization—appreciate what you have by imagining its loss.
**Positive Psychology** — gratitude is one of the strongest wellbeing predictors.

Savor simple pleasures: friendship, beauty, learning, nature. Your role matters.`
  );

  cb._md("### Three Good Things Today");

  cb._input(ips.gratitudes);

  return await cb.render();
}
