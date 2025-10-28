import { ComponentBuilder } from "src/services/ComponentBuilder";
import { practiceConfigs } from "src/inputs";

export async function morningReflection() {
  const componentName = "morningReflection";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🧘 Morning Reflection (⭐ RECOMMENDED)");
  practiceConfigs
    .filter((practice) => practice.component === componentName)
    .forEach((practice) => {
      cb._input(practice.inputOptions);
      cb._foldable(practice.guide, "Guide");
    });

  return cb.render();
}
