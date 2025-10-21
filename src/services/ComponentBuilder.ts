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

  // --- Dividers ---
  /**
   * Add a simple subsection divider (three asterisks).
   * Use for separating subsections WITHIN a component.
   */
  _divider() {
    this.content.push("***");
    return this;
  }

  /**
   * Add a fancy centered title divider using HTML center tag.
   * Auto-adjusts to screen width with horizontal rule above/below.
   * @param title - Title text to display
   * @param emoji - Optional emoji to include (default: ⚛︎)
   * @example
   * _fancyDivider("Wins & Accomplishments", "🏆")
   * // Produces:
   * // ---
   * // <center>🏆 Wins & Accomplishments 🏆</center>
   * // ---
   */
  _fancyDivider(title?: string, emoji: string = "⚛︎") {
    if (title) {
      this.content.push("---");
      this.content.push(
        `<center>${emoji} <strong>${title}</strong> ${emoji}</center>`
      );
      this.content.push("---");
    } else {
      this.content.push("---");
    }
    return this;
  }

  /**
   * Add a themed divider using heading with emoji.
   * Renders beautifully in Obsidian with auto-width.
   * @param title - Title text
   * @param emoji - Emoji to use
   * @example
   * _themedDivider("Today's Accomplishments", "🏆")
   * // Produces: ### 🏆 Today's Accomplishments
   */
  _themedDivider(title: string, emoji: string) {
    this.content.push(`### ${emoji} ${title}`);
    return this;
  }

  /**
   * Add a blockquote divider - renders as a nice accent line.
   * @param text - Optional text to include in the blockquote
   * @example
   * _blockquoteDivider("✦ Section Break ✦")
   * // Produces: > ✦ Section Break ✦
   */
  _blockquoteDivider(text?: string) {
    if (text) {
      this.content.push(`> ${text}`);
    } else {
      this.content.push("> ---");
    }
    return this;
  }

  // --- Guidance ---
  /**
   * Add a guidance callout box. Automatically wraps content in "> [!note] Guidance" syntax.
   * @param content - The guidance text (can be multiline). If not provided, uses default habit tracking guidance.
   * @param title - Optional custom title (default: "Guidance")
   * @example
   * _guidance("**Stoicism**: Focus on what you can control.\n**Taoist Wu Wei**: Flow like water.")
   * // Produces: > [!note] Guidance
   * //           > **Stoicism**: Focus on what you can control.
   * //           > **Taoist Wu Wei**: Flow like water.
   */
  _guidance(content?: string, title: string = "Guidance") {
    const defaultContent =
      "Keep it simple — research shows even a basic ticksheet improves habit consistency.\nPrompts: Which habits do you want to track today?";

    const guidanceContent = content ?? defaultContent;

    // Split content into lines and prefix each with "> " for Obsidian callout syntax
    const lines = guidanceContent.split("\n");
    const formattedLines = lines.map((line) => `> ${line}`);

    const guidanceText = `> [!note] ${title}\n${formattedLines.join("\n")}`;

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
    // Add visual top boundary (outside input tags)
    this.content.push("<center>· · · · · · · · · · · · · · · ·</center>");

    // Create the actual input (will be wrapped in tags by inputCreator)
    const value = inputCreator.createInput({
      componentName: this.componentName,
      type: InputsConst.richText,
      inputName,
      defaultValue,
      placeholder,
    });
    this.content.push(value);

    // Add visual bottom boundary (outside input tags)
    this.content.push("<center>· · · · · · · · · · · · · · · ·</center>");

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

  _multiCheckboxSC(
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
      singleChoice: true,
      defaultValue,
      collapsed,
    });
    this.content.push(value);
    return this;
  }

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
