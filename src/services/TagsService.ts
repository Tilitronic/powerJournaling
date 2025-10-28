// TagsService.ts
import { InferTypeNode } from "typescript";
import { useLogger, LNs } from "../globals";
import { InputType } from "./InputCreator";
interface InputWrapperOptions {
  componentId?: string;
  inputId: string;
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
    start: (componentId?: string) => {
      const meta = { componentId };
      this.logger.dev("Component start", meta);
      return `<span class="$${
        TagsClassesConst.component
      } start" data-meta='${JSON.stringify(
        meta
      )}' style="display:none"></span>`;
    },

    end: (componentId?: string) => {
      const meta = { componentId };
      this.logger.dev("Component end", meta);
      return `<span class="$${
        TagsClassesConst.component
      } end" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
    },

    wrap: (
      componentId: string | undefined,
      content: string,
      withNewLines = true
    ) => {
      const inner = withNewLines ? `\n${content}\n` : content;
      this.logger.dev("Component wrap", { componentId, content });
      return (
        this.component.start(componentId) +
        inner +
        this.component.end(componentId)
      );
    },
  };

  public readonly input = {
    start: (
      componentId: string | undefined,
      inputId: string,
      inputType: InputType
    ) => {
      const meta = { componentId, inputId, inputType };
      this.logger.dev("Input start", meta);
      return `<span class="$${
        TagsClassesConst.input
      }" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
    },

    end: (
      componentId: string | undefined,
      inputId: string,
      inputType: InputType
    ) => {
      const meta = { componentId, inputId, inputType };
      this.logger.dev("Input end", meta);
      return `<span class="$${
        TagsClassesConst.input
      } end" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
    },

    wrap: (opts: InputWrapperOptions) => {
      const {
        componentId,
        inputId,
        inputType,
        content,
        withNewLines = true,
      } = opts;
      const inner = withNewLines ? `\n${content}\n` : content;
      this.logger.dev("Input wrap", { componentId, inputId, content });
      return (
        this.input.start(componentId, inputId, inputType) +
        inner +
        this.input.end(componentId, inputId, inputType)
      );
    },
  };

  hiddenValue = (
    componentId: string | undefined,
    inputId: string,
    value: string
  ) => {
    const meta = { componentId, inputId, value };
    this.logger.dev("Hidden value set", meta);
    return `<span class="$${
      TagsClassesConst.hiddenValue
    }" data-meta='${JSON.stringify(meta)}' style="display:none"></span>`;
  };
}

// Singleton instance
export const tagsService = new TagsService();

// Type if needed
export type TagsServiceType = typeof tagsService;
