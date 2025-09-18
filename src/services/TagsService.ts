// TagsService.ts
import { useLogger, LNs } from "../globals";

export class TagsService {
  private logger = useLogger(LNs.TagsService);

  public readonly component = {
    start: (componentName: string) => {
      const meta = { componentName };
      this.logger.dev("Component start", meta);
      return `<span class="mdc-component" data-meta='${JSON.stringify(
        meta
      )}' style="display:none"></span>`;
    },

    end: (componentName: string) => {
      const meta = { componentName };
      this.logger.dev("Component end", meta);
      return `<span class="mdc-component-end" data-meta='${JSON.stringify(
        meta
      )}' style="display:none"></span>`;
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
    start: (componentName: string, inputName: string) => {
      const meta = { componentName, inputName };
      this.logger.dev("Input start", meta);
      return `<span class="mdc-input" data-meta='${JSON.stringify(
        meta
      )}' style="display:none"></span>`;
    },

    end: (componentName: string, inputName: string) => {
      const meta = { componentName, inputName };
      this.logger.dev("Input end", meta);
      return `<span class="mdc-input-end" data-meta='${JSON.stringify(
        meta
      )}' style="display:none"></span>`;
    },

    wrap: (
      componentName: string,
      inputName: string,
      content: string,
      withNewLines = true
    ) => {
      const inner = withNewLines ? `\n${content}\n` : content;
      this.logger.dev("Input wrap", { componentName, inputName, content });
      return (
        this.input.start(componentName, inputName) +
        inner +
        this.input.end(componentName, inputName)
      );
    },
  };

  hiddenValue = (componentName: string, inputName: string, value: string) => {
    const meta = { componentName, inputName, value };
    this.logger.dev("Hidden value set", meta);
    return `<span class="mdc-hidden-value" data-meta='${JSON.stringify(
      meta
    )}' style="display:none"></span>`;
  };
}

// Singleton instance
export const tagsService = new TagsService();

// Type if needed
export type TagsServiceType = typeof tagsService;
