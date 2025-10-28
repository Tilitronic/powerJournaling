import { tagsService } from "./TagsService";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { useLogger, LNs } from "../globals";

export const InputsConst = {
  text: "text",
  boolean: "boolean",
  multicheckbox: "multicheckbox",
  richText: "richText",
  number: "number",
} as const;

export type InputType = (typeof InputsConst)[keyof typeof InputsConst];

// Base properties shared by all inputs
interface BaseInputOptions {
  componentId?: string;
  inputId: string;
  type: InputType;
}

interface BaseTextOptions extends BaseInputOptions {
  defaultValue?: string;
  placeholder?: string;
}

export interface TextInputOptions extends BaseTextOptions {
  type: typeof InputsConst.text;
}

export interface RichTextInputOptions extends BaseTextOptions {
  type: typeof InputsConst.richText;
}

export interface BooleanInputOptions extends BaseInputOptions {
  type: typeof InputsConst.boolean;
  label?: string;
  defaultValue?: boolean;
}

export interface MultiCheckboxInputOptions extends BaseInputOptions {
  type: typeof InputsConst.multicheckbox;
  options: { label: string; value: string }[];
  defaultValue?: string[];
  singleChoice?: boolean;
  collapsed?: boolean;
}

export interface NumberInputOptions extends BaseInputOptions {
  type: typeof InputsConst.number;
  defaultValue?: number;
}

export type CreateInputOptions =
  | TextInputOptions
  | BooleanInputOptions
  | MultiCheckboxInputOptions
  | RichTextInputOptions
  | NumberInputOptions;

export class InputCreator {
  private logger = useLogger(LNs.InputCreator);

  /**
   * Create a Markdown input wrapped in tags
   */
  createInput(opts: CreateInputOptions): string {
    const { componentId, inputId, type } = opts;
    let mdContent = "";

    try {
      switch (type) {
        case InputsConst.text:
        case InputsConst.richText: {
          const value = opts.defaultValue ?? "";
          mdContent = `> ${value}`;
          break;
        }

        case InputsConst.boolean: {
          const checked = opts.defaultValue === true ? "x" : " ";
          const label = opts.label ?? "Checkbox";
          mdContent = `- [${checked}] ${label}`;
          break;
        }

        case InputsConst.multicheckbox: {
          const options = opts.options ?? [];
          if (!options.length) {
            this.logger.error(
              "multicheckbox must have non-empty options array",
              { opts }
            );
            throw new Error("multicheckbox must have non-empty options array");
          }

          mdContent = options
            .map((opt) => {
              const value = tagsService.hiddenValue(
                componentId,
                inputId,
                opt.value
              );
              return `- [ ] ${value} ${opt.label}`;
            })
            .join("\n");
          break;
        }

        case InputsConst.number: {
          const value = opts.defaultValue ?? "";
          mdContent = `> {Number} ${value}`;
          break;
        }

        default:
          this.logger.error(`Unknown input type: ${type}`, { opts });
          throw new Error("Unknown input type: " + type);
      }
    } catch (err) {
      this.logger.error("Failed to create input", { error: err, opts });
      throw err;
    }

    return tagsService.input.wrap({
      componentId,
      inputId,
      content: mdContent,
      inputType: type,
    });
  }

  parseMarkdown(md: string) {
    try {
      return unified().use(remarkParse).parse(md);
    } catch (err) {
      this.logger.error("Failed to parse Markdown", { error: err, md });
      throw err;
    }
  }

  stringifyMarkdown(ast: any) {
    try {
      return unified().use(remarkStringify).stringify(ast);
    } catch (err) {
      this.logger.error("Failed to stringify Markdown", { error: err, ast });
      throw err;
    }
  }
}

// Singleton
export const inputCreator = new InputCreator();
