import { tagsService } from "./TagsService";
import { inputService } from "./InputService";
import type { CreateInputOptions } from "./InputService";
import { InputsConst } from "./InputService";

export class ComponentBuilder {
  private componentName: string;
  private content: string[] = [];

  constructor(componentName: string) {
    this.componentName = componentName;
  }

  // --- Markdown ---
  _md(md: string | (() => string)) {
    const value = typeof md === "function" ? md() : md;
    this.content.push(value);
    return this;
  }

  // --- Guidance ---
  _guidance(customText?: string) {
    const guidanceText =
      customText ??
      "> [!note] Guidance  \nKeep it simple — research shows even a basic ticksheet improves habit consistency.\nPrompts: Which habits do you want to track today?";
    this.content.push(guidanceText);
    return this;
  }

  _input(opts: CreateInputOptions) {
    const optsWithComponent = { ...opts, componentName: this.componentName };
    this.content.push(inputService.createInput(optsWithComponent));
    return this;
  }

  // --- Convenience methods ---
  _text(inputName: string, defaultValue?: string, placeholder?: string) {
    const value = inputService.createInput({
      componentName: this.componentName,
      type: InputsConst.text,
      inputName,
      defaultValue,
      placeholder,
    });
    this.content.push(value);
    return this;
  }

  _richText(inputName: string, defaultValue?: string, placeholder?: string) {
    const value = inputService.createInput({
      componentName: this.componentName,
      type: InputsConst.richText,
      inputName,
      defaultValue,
      placeholder,
    });
    this.content.push(value);
    return this;
  }

  _boolean(inputName: string, label: string, defaultValue?: boolean) {
    const value = inputService.createInput({
      componentName: this.componentName,
      type: InputsConst.boolean,
      inputName,
      label,
      defaultValue,
    });
    this.content.push(value);
    return this;
  }

  _number(inputName: string, defaultValue?: number) {
    const value = inputService.createInput({
      componentName: this.componentName,
      type: InputsConst.number,
      inputName,
      defaultValue,
    });
    this.content.push(value);
    return this;
  }

  _multiCheckbox(
    inputName: string,
    options: { label: string; value: string }[],
    defaultValue?: string[],
    singleChoice?: boolean,
    collapsed?: boolean
  ) {
    const value = inputService.createInput({
      componentName: this.componentName,
      type: InputsConst.multicheckbox,
      inputName,
      options,
      defaultValue,
      singleChoice,
      collapsed,
    });
    this.content.push(value);
    return this;
  }

  // --- Render final component ---
  render() {
    return tagsService.component.wrap(
      this.componentName,
      this.content.join("\n\n")
    );
  }
}
