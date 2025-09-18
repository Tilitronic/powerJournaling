import { tagsService } from "./TagsService";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";

export const InputsConst = {
  text: "text",
  boolean: "boolean",
  multicheckbox: "multicheckbox",
  richText: "richText",
  number: "number",
} as const;

type InputType = (typeof InputsConst)[keyof typeof InputsConst];

// Base properties shared by all inputs
interface BaseInputOptions {
  componentName: string; // unique component identifier
  inputName: string; // unique input identifier inside component
  type: InputType;
}

interface BaseTextOptions extends BaseInputOptions {
  defaultValue?: string;
  placeholder?: string; // ignored if user doesn't input anything
}

// Single-line text input with optional placeholder
export interface TextInputOptions extends BaseTextOptions {
  type: typeof InputsConst.text;
}

// Rich-text block (free input, colored span)
export interface RichTextInputOptions extends BaseTextOptions {
  type: typeof InputsConst.richText;
}

// Boolean checkbox
export interface BooleanInputOptions extends BaseInputOptions {
  type: typeof InputsConst.boolean;
  label?: string; // user-visible label
  defaultValue?: boolean;
}

// Multi-checkbox input
export interface MultiCheckboxInputOptions extends BaseInputOptions {
  type: typeof InputsConst.multicheckbox;
  options: { label: string; value: string }[]; // array of objects ONLY
  defaultValue?: string[]; // selected values
  singleChoice?: boolean; //TODO: if true, parser wil treat first checked as the only one (and warn about it in logs and next report). There must be some way to notify user it is a single choice.
  collapsed?: boolean; //TODO: if true, all options are shown expanded (not collapsed)
}

// Number input
export interface NumberInputOptions extends BaseInputOptions {
  type: typeof InputsConst.number;
  defaultValue?: number;
}

// Union type for all inputs
export type CreateInputOptions =
  | TextInputOptions
  | BooleanInputOptions
  | MultiCheckboxInputOptions
  | RichTextInputOptions
  | NumberInputOptions;

export class InputService {
  /**
   * Create a Markdown input wrapped in tags
   * Automatically handles missing optional values with defaults
   */
  createInput(opts: CreateInputOptions): string {
    const { componentName, inputName, type } = opts;
    let mdContent = "";

    switch (type) {
      case InputsConst.text: {
        const value = opts.defaultValue ?? "";
        mdContent = `> ${value}`;
        break;
      }

      case InputsConst.richText: {
        const value = opts.defaultValue ?? "";
        mdContent = `> ${value}`;
        break;
      }

      case InputsConst.boolean: {
        const checked = opts.defaultValue === true ? "x" : " ";
        const label = opts.label ?? "Checkbox"; // default label if missing
        mdContent = `- [${checked}] ${label}`;
        break;
      }

      case InputsConst.multicheckbox: {
        const options = opts.options ?? [];
        if (!options.length) {
          throw new Error("multicheckbox must have non-empty options array");
        }

        mdContent = options
          .map((opt) => {
            const value = tagsService.hiddenValue(
              componentName,
              inputName,
              opt.value
            );
            return `- [ ] ${value} ${opt.label}`;
          })
          .join("\n");
        break;
      }

      case InputsConst.number: {
        const value = opts.defaultValue ?? ""; // default number
        mdContent = `> {Number} ${value}`;
        break;
      }

      default:
        throw new Error("Unknown input type: " + type);
    }

    return tagsService.input.wrap(componentName, inputName, mdContent);
  }

  parseMarkdown(md: string) {
    return unified().use(remarkParse).parse(md);
  }

  stringifyMarkdown(ast: any) {
    return unified().use(remarkStringify).stringify(ast);
  }
}

// Singleton
export const inputService = new InputService();
