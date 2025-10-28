// import { tagsService } from "./TagsService";
import { inputCreator } from "./InputCreator";
import type { CreateInputOptions } from "./InputCreator";
import { InputsConst } from "./InputCreator";
import { useLogger, LNs } from "../globals";
import { Schedule } from "./ScheduleService";
import { scheduleEvaluator } from "./ScheduleService/ScheduleEvaluator";
import { tagsService } from "./TagsService";
import type { InputConfig } from "src/inputs/types";

export class ComponentBuilder {
  private componentId: string;
  private content: string[] = [];
  private logger = useLogger(LNs.ComponentBuilder);
  private componentSchedule: Schedule | null = null;
  private hasRenderedInputs: boolean = false;

  constructor(componentId: string) {
    this.componentId = componentId;
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
    this.content.push("\n***\n");
    return this;
  }

  /**
   * Add a fancy centered title using HTML center tag.
   * @param title - Title text to display
   * @param emoji - Optional emoji to include (default: ⚛︎)
   * @example
   * _fancyTitle("Wins & Accomplishments", "🏆")
   * // Produces:
   * // <center>🏆 Wins & Accomplishments 🏆</center>
   */
  _fancyTitle(title?: string, emoji: string = "⚛︎") {
    if (title) {
      this.content.push(
        `<center>${emoji} <strong>${title}</strong> ${emoji}</center>`
      );
    } else {
      this.content.push("---");
    }
    return this;
  }

  /**
   * @deprecated Use _fancyTitle instead
   */
  _fancyDivider(title?: string, emoji: string = "⚛︎") {
    return this._fancyTitle(title, emoji);
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
   * Add a foldable callout box. Automatically wraps content in "> [!note]- Title" syntax (collapsed by default).
   * @param content - The guidance text (can be multiline). Required.
   * @param title - Optional custom title (default: "Guidance")
   * @example
   * _foldable("**Stoicism**: Focus on what you can control.\n**Taoist Wu Wei**: Flow like water.")
   * // Produces: > [!note]- Guidance
   * //           > **Stoicism**: Focus on what you can control.
   * //           > **Taoist Wu Wei**: Flow like water.
   */
  _foldable(content: string, title: string = "Guidance") {
    // Split content into lines and prefix each with "> " for Obsidian callout syntax
    const lines = content.split("\n");
    const formattedLines = lines.map((line: string) => `> ${line}`);

    // Use [!note]- to make the callout collapsed by default
    const guidanceText = `> [!note]- ${title}\n${formattedLines.join("\n")}`;

    this.content.push(guidanceText);
    this.content.push("");
    return this;
  }

  /**
   * Set component-level schedule. Component will only render if schedule allows.
   * @param scheduleOrInput - Either a Schedule object or an InputConfig to use its schedule
   * @example
   * cb.schedule({ daysOfWeek: [1, 3, 5] }) // Monday, Wednesday, Friday
   * cb.schedule(ips.mindful_pause_taken) // Use schedule from that input
   */
  schedule(scheduleOrInput: Schedule | InputConfig) {
    if ("schedule" in scheduleOrInput && scheduleOrInput.schedule) {
      // It's an InputConfig, use its schedule
      this.componentSchedule = scheduleOrInput.schedule;
    } else {
      // It's a Schedule object
      this.componentSchedule = scheduleOrInput as Schedule;
    }
    return this;
  }

  async _input(opts: CreateInputOptions | InputConfig) {
    // Check if it's an InputConfig (has 'id' and 'inputOptions' properties)
    const isInputConfig = "id" in opts && "inputOptions" in opts;

    if (isInputConfig) {
      const config = opts as InputConfig;

      // If schedule is configured, check if input should be shown
      if (config.schedule) {
        const shouldShow = await scheduleEvaluator.shouldShowInput(config);
        if (!shouldShow) {
          return this; // Skip this input - don't render it
        }
      }

      // Track that we rendered an input
      this.hasRenderedInputs = true;

      // For non-boolean inputs, add label first
      // Booleans have their own built-in label, so we skip _inputLabel for them
      if (config.inputOptions.type !== InputsConst.boolean) {
        this._inputLabel(config.label, config.description);
      }

      // Now add the actual input
      const optsWithComponent = {
        ...config.inputOptions,
        componentId: this.componentId,
      };
      this.content.push(inputCreator.createInput(optsWithComponent));

      // Add newline after text/number inputs for proper spacing with following content
      // (especially important before markdown like foldables that start with ">")
      // Booleans and multicheckbox don't need this extra spacing
      const needsSpacing =
        config.inputOptions.type !== InputsConst.boolean &&
        config.inputOptions.type !== InputsConst.multicheckbox;

      if (needsSpacing) {
        this.content.push("");
      }
    } else {
      // It's just CreateInputOptions, use directly (backward compatibility)
      this.hasRenderedInputs = true;
      const optsWithComponent = { ...opts, componentId: this.componentId };
      this.content.push(inputCreator.createInput(optsWithComponent));
    }

    return this;
  }

  /**
   * Add an input description/label with proper formatting.
   * Automatically adds a blank line before the description to prevent markdown rendering issues.
   * @param name - The main question/label (will be bold)
   * @param description - Optional additional description (can be any markdown, e.g., "(Flow state moments)" or "*Environment, time, task type*")
   * @example
   * _inputLabel("When was I most focused?", "(Flow state moments)")
   * // Produces:
   * //
   * // [blank line added here automatically]
   * // **When was I most focused?** (Flow state moments)
   */
  _inputLabel(name: string, optionalText?: string) {
    const label = optionalText ? `**${name}** ${optionalText}` : `**${name}**`;
    this.content.push(label);
    return this;
  }

  // --- Convenience methods ---
  _text(inputId: string, defaultValue?: string, placeholder?: string) {
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.text,
      inputId,
      defaultValue,
      placeholder,
    });
    this.content.push(value);
    this.content.push("");
    return this;
  }

  _richText(inputId: string, defaultValue?: string, placeholder?: string) {
    // Add visual top boundary (outside input tags)
    this.content.push("<center>· · · · · · · · · · · · · · · ·</center>");

    // Create the actual input (will be wrapped in tags by inputCreator)
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.richText,
      inputId,
      defaultValue,
      placeholder,
    });
    this.content.push(value);

    // Add visual bottom boundary (outside input tags)
    this.content.push("<center>· · · · · · · · · · · · · · · ·</center>");

    return this;
  }

  _boolean(inputId: string, label: string, defaultValue?: boolean) {
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.boolean,
      inputId,
      label,
      defaultValue,
    });
    this.content.push(value);
    return this;
  }

  _number(inputId: string, defaultValue?: number) {
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.number,
      inputId,
      defaultValue,
    });
    this.content.push(value);
    return this;
  }

  _multiCheckbox(
    inputId: string,
    options: { label: string; value: string }[],
    defaultValue?: string[],
    collapsed?: boolean
  ) {
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.multicheckbox,
      inputId,
      options,
      defaultValue,
      collapsed,
    });
    this.content.push(value);
    return this;
  }

  _multiCheckboxSC(
    inputId: string,
    options: { label: string; value: string }[],
    defaultValue?: string[],
    collapsed?: boolean
  ) {
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.multicheckbox,
      inputId,
      options,
      singleChoice: true,
      defaultValue,
      collapsed,
    });
    this.content.push(value);
    return this;
  }

  _nl() {
    this.content.push("\n");
    return this;
  }

  // --- Render final component ---
  async render() {
    // If component has explicit schedule, check it first
    if (this.componentSchedule) {
      const shouldShow = await scheduleEvaluator.shouldShowInput({
        id: this.componentId,
        inputOptions: { inputId: this.componentId, type: InputsConst.text },
        label: this.componentId,
        schedule: this.componentSchedule,
      });
      if (!shouldShow) {
        this.logger.dev("Component hidden by explicit schedule", {
          componentId: this.componentId,
        });
        return "";
      }
    }

    // If no inputs were rendered and no explicit schedule override,
    // return empty string (component is all scheduled inputs that didn't show)
    if (!this.hasRenderedInputs && !this.componentSchedule) {
      this.logger.dev("Component hidden - no inputs rendered", {
        componentId: this.componentId,
      });
      return "";
    }

    const output = tagsService.component.wrap(
      this.componentId,
      this.content.join("\n")
    );
    this.logger.dev("Component rendered", { outputLength: output.length });
    return output;
  }
}
