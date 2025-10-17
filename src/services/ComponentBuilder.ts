import { tagsService } from "./TagsService";
import { inputCreator } from "./InputCreator";
import type { CreateInputOptions } from "./InputCreator";
import { InputsConst } from "./InputCreator";
import { useLogger, LNs } from "../globals";

export class ComponentBuilder {
  private componentName: string;
  private content: string[] = [];
  private logger = useLogger(LNs.ComponentBuilder);

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
    this.content.push(inputCreator.createInput(optsWithComponent));
    return this;
  }

  // --- Convenience methods ---
  _text(inputName: string, defaultValue?: string, placeholder?: string) {
    const value = inputCreator.createInput({
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
    const value = inputCreator.createInput({
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
    const value = inputCreator.createInput({
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
    const value = inputCreator.createInput({
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
    collapsed?: boolean
  ) {
    const value = inputCreator.createInput({
      componentName: this.componentName,
      type: InputsConst.multicheckbox,
      inputName,
      options,
      defaultValue,
      collapsed,
    });
    this.content.push(value);
    return this;
  }

  // _multiCheckboxSC(
  //   inputName: string,
  //   options: { label: string; value: string }[],
  //   defaultValue?: string[],
  //   collapsed?: boolean
  // ) {
  //   const value = inputCreator.createInput({
  //     componentName: this.componentName,
  //     type: InputsConst.multicheckbox,
  //     inputName,
  //     options,
  //     singleChoice: true,
  //     defaultValue,
  //     collapsed,
  //   });
  //   this.content.push(value);
  //   return this;
  // }

  // --- Render final component ---
  render() {
    const output = tagsService.component.wrap(
      this.componentName,
      this.content.join("\n\n")
    );
    this.logger.dev("Component rendered", { outputLength: output.length });
    return output;
  }
}
