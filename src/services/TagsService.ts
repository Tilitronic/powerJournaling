// TagsService.ts
import { InferTypeNode } from "typescript";
import { useLogger, LNs } from "../globals";
import { InputType } from "./InputCreator";
interface InputWrapperOptions {
  componentName: string;
  inputName: string;
  inputType: InputType;
  withNewLines?: boolean;
  content: string;
}

export const TagsClassesConst = {
  component: "mdc-component",
  input: "mdc-input",
  hiddenValue: "mdc-hidden-value",
} as const;

export class TagsService {
  private logger = useLogger(LNs.TagsService);

  public readonly component = {
    start: (componentName: string) => {
      const meta = { componentName };
      this.logger.dev("Component start", meta);
      return `<span class="${
        TagsClassesConst.component
      } start" data-meta='${JSON.stringify(
        meta
      )}' style="display:none"></span>`;
    },

    end: (componentName: string) => {
      const meta = { componentName };
      this.logger.dev("Component end", meta);
      return `<span class="${
        TagsClassesConst.component
      } end" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
    },

    wrap: (componentName: string, content: string, withNewLines = true) => {
      const inner = withNewLines ? `\n${content}\n` : content;
      this.logger.dev("Component wrap", { componentName, content });
      return (
        this.component.start(componentName) +
        inner +
        this.component.end(componentName)
      );
    },
  };

  public readonly input = {
    start: (componentName: string, inputName: string, inputType: InputType) => {
      const meta = { componentName, inputName, inputType };
      this.logger.dev("Input start", meta);
      return `<span class="${
        TagsClassesConst.input
      }" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
    },

    end: (componentName: string, inputName: string, inputType: InputType) => {
      const meta = { componentName, inputName, inputType };
      this.logger.dev("Input end", meta);
      return `<span class="${
        TagsClassesConst.input
      } end" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
    },

    wrap: (opts: InputWrapperOptions) => {
      const {
        componentName,
        inputName,
        inputType,
        content,
        withNewLines = true,
      } = opts;
      const inner = withNewLines ? `\n${content}\n` : content;
      this.logger.dev("Input wrap", { componentName, inputName, content });
      return (
        this.input.start(componentName, inputName, inputType) +
        inner +
        this.input.end(componentName, inputName, inputType)
      );
    },
  };

  hiddenValue = (componentName: string, inputName: string, value: string) => {
    const meta = { componentName, inputName, value };
    this.logger.dev("Hidden value set", meta);
    return `<span class="${
      TagsClassesConst.hiddenValue
    }" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
  };
}

// Singleton instance
export const tagsService = new TagsService();

// Type if needed
export type TagsServiceType = typeof tagsService;
