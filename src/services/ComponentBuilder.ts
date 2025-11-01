// import { tagsService } from "./TagsService";
import { inputCreator } from "./InputCreator";
import type { CreateInputOptions } from "./InputCreator";
import { InputsConst } from "./InputCreator";
import { useLogger, LNs } from "../globals";
import { Schedule } from "./ScheduleService";
import { scheduleEvaluator } from "./ScheduleService/ScheduleEvaluator";
import { tagsService } from "./TagsService";
import type { InputConfig } from "src/inputs/types";

interface ContentItem {
  md: string;
  schedule?: Schedule;
  isInput?: boolean; // Track if this item is an input
}

export class ComponentBuilder {
  private componentId: string;
  private content: ContentItem[] = [];
  private logger = useLogger(LNs.ComponentBuilder);
  private componentSchedule: Schedule | null = null;

  constructor(componentId: string) {
    this.componentId = componentId;
  }

  // --- Markdown ---
  _md(md: string | (() => string), schedule?: Schedule) {
    const value = typeof md === "function" ? md() : md;
    this.content.push({ md: value, schedule });
    return this;
  }

  // --- Dividers ---
  /**
   * Add a simple subsection divider (three asterisks).
   * Use for separating subsections WITHIN a component.
   */
  _divider(schedule?: Schedule) {
    this.content.push({ md: "\n***\n", schedule });
    return this;
  }

  /**
   * Add a fancy centered title using HTML center tag.
   * @param title - Title text to display
   * @param emoji - Optional emoji to include (default: ⚛︎)
   * @param schedule - Optional schedule to control when this appears
   * @example
   * _fancyTitle("Wins & Accomplishments", "🏆")
   * // Produces:
   * // <center>🏆 Wins & Accomplishments 🏆</center>
   */
  _fancyTitle(title?: string, emoji: string = "⚛︎", schedule?: Schedule) {
    if (title) {
      this.content.push({
        md: `<center>${emoji} <strong>${title}</strong> ${emoji}</center>`,
        schedule,
      });
    } else {
      this.content.push({ md: "---", schedule });
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
   * @param schedule - Optional schedule to control when this appears
   * @example
   * _themedDivider("Today's Accomplishments", "🏆")
   * // Produces: ### 🏆 Today's Accomplishments
   */
  _themedDivider(title: string, emoji: string, schedule?: Schedule) {
    this.content.push({ md: `### ${emoji} ${title}`, schedule });
    return this;
  }

  /**
   * Add a blockquote divider - renders as a nice accent line.
   * @param text - Optional text to include in the blockquote
   * @param schedule - Optional schedule to control when this appears
   * @example
   * _blockquoteDivider("✦ Section Break ✦")
   * // Produces: > ✦ Section Break ✦
   */
  _blockquoteDivider(text?: string, schedule?: Schedule) {
    if (text) {
      this.content.push({ md: `> ${text}`, schedule });
    } else {
      this.content.push({ md: "> ---", schedule });
    }
    return this;
  }

  // --- Guidance ---
  /**
   * Add a foldable callout box. Automatically wraps content in "> [!note]- Title" syntax (collapsed by default).
   * @param content - The guidance text (can be multiline). Required.
   * @param title - Optional custom title (default: "Guidance")
   * @param schedule - Optional schedule to control when this appears
   * @example
   * _foldable("**Stoicism**: Focus on what you can control.\n**Taoist Wu Wei**: Flow like water.")
   * // Produces: > [!note]- Guidance
   * //           > **Stoicism**: Focus on what you can control.
   * //           > **Taoist Wu Wei**: Flow like water.
   */
  _foldable(content: string, title: string = "Guidance", schedule?: Schedule) {
    // Split content into lines and prefix each with "> " for Obsidian callout syntax
    const lines = content.split("\n");
    const formattedLines = lines.map((line: string) => `> ${line}`);

    // Use [!note]- to make the callout collapsed by default
    const guidanceText = `> [!note]- ${title}\n${formattedLines.join("\n")}`;

    this.content.push({ md: guidanceText, schedule });
    this.content.push({ md: "", schedule });
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

  _input(opts: CreateInputOptions | InputConfig) {
    // Check if it's an InputConfig (has 'id' and 'inputOptions' properties)
    const isInputConfig = "id" in opts && "inputOptions" in opts;

    if (isInputConfig) {
      const config = opts as InputConfig;

      // For non-boolean inputs, add label first
      // Booleans have their own built-in label, so we skip _inputLabel for them
      if (config.inputOptions.type !== InputsConst.boolean) {
        this._inputLabel(config.label, config.description);
      }

      // Now add the actual input with schedule, marked as input
      const optsWithComponent = {
        ...config.inputOptions,
        componentId: this.componentId,
      };
      this.content.push({
        md: inputCreator.createInput(optsWithComponent),
        schedule: config.schedule,
        isInput: true, // Mark as input
      });

      // Add newline after text/number inputs for proper spacing with following content
      // (especially important before markdown like foldables that start with ">")
      // Booleans and multicheckbox don't need this extra spacing
      const needsSpacing =
        config.inputOptions.type !== InputsConst.boolean &&
        config.inputOptions.type !== InputsConst.multicheckbox;

      if (needsSpacing) {
        this.content.push({ md: "" });
      }
    } else {
      // It's just CreateInputOptions, use directly (backward compatibility)
      const optsWithComponent = { ...opts, componentId: this.componentId };
      this.content.push({
        md: inputCreator.createInput(optsWithComponent),
        isInput: true, // Mark as input
      });
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
    this.content.push({ md: label });
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
    this.content.push({ md: value });
    this.content.push({ md: "" });
    return this;
  }

  _richText(inputId: string, defaultValue?: string, placeholder?: string) {
    // Add visual top boundary (outside input tags)
    this.content.push({
      md: "<center>· · · · · · · · · · · · · · · ·</center>",
    });

    // Create the actual input (will be wrapped in tags by inputCreator)
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.richText,
      inputId,
      defaultValue,
      placeholder,
    });
    this.content.push({ md: value });

    // Add visual bottom boundary (outside input tags)
    this.content.push({
      md: "<center>· · · · · · · · · · · · · · · ·</center>",
    });

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
    this.content.push({ md: value });
    return this;
  }

  _number(inputId: string, defaultValue?: number) {
    const value = inputCreator.createInput({
      componentId: this.componentId,
      type: InputsConst.number,
      inputId,
      defaultValue,
    });
    this.content.push({ md: value });
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
    this.content.push({ md: value });
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
    this.content.push({ md: value });
    return this;
  }

  _nl() {
    this.content.push({ md: "\n" });
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

    // Evaluate all content items and filter by schedule
    const evaluatedContent: string[] = [];
    let hasInputs = false;
    let renderedInputCount = 0;

    for (const item of this.content) {
      // Track if this component has any inputs at all
      if (item.isInput) {
        hasInputs = true;
      }

      // If no schedule, always include
      if (!item.schedule) {
        evaluatedContent.push(item.md);
        if (item.isInput) renderedInputCount++;
        continue;
      }

      // Check if scheduled item should show
      const shouldShow = await scheduleEvaluator.shouldShowInput({
        id: `${this.componentId}_item`,
        inputOptions: {
          inputId: `${this.componentId}_item`,
          type: InputsConst.text,
        },
        label: `${this.componentId}_item`,
        schedule: item.schedule,
      });

      if (shouldShow) {
        evaluatedContent.push(item.md);
        if (item.isInput) renderedInputCount++;
      }
    }

    // If component has inputs but none were rendered after schedule evaluation, hide component
    if (hasInputs && renderedInputCount === 0) {
      this.logger.dev(
        "Component hidden - has inputs but none passed schedule evaluation",
        {
          componentId: this.componentId,
        }
      );
      return "";
    }

    // If no content after evaluation, return empty
    if (evaluatedContent.length === 0) {
      this.logger.dev(
        "Component hidden - no content after schedule evaluation",
        {
          componentId: this.componentId,
        }
      );
      return "";
    }

    const output = tagsService.component.wrap(
      this.componentId,
      evaluatedContent.join("\n")
    );
    this.logger.dev("Component rendered", {
      outputLength: output.length,
      itemsEvaluated: this.content.length,
      itemsRendered: evaluatedContent.length,
      inputsRendered: renderedInputCount,
    });
    return output;
  }
}
