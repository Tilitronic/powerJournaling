import { ComponentBuilder } from "src/services/ComponentBuilder";
import { practiceConfigs } from "src/inputs";

export async function morningReflection() {
  const componentName = "morningReflection";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🧘 Morning Reflection (⭐ RECOMMENDED)");
  practiceConfigs
    .filter((practice) => practice.component === componentName)
    .forEach((practice) => {
      cb._foldable(practice.guide, practice.label);
      cb._input(practice.inputOptions);
    });

  return cb.render();
}
