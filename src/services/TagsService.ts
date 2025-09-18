// TagsService.ts
export class TagsService {
  public readonly component = {
    start: (componentName: string) =>
      `<span class="mdc-component" data-meta='${JSON.stringify({
        componentName,
      })}' style="display:none"></span>`,

    end: (componentName: string) =>
      `<span class="mdc-component-end" data-meta='${JSON.stringify({
        componentName,
      })}' style="display:none"></span>`,

    wrap: (componentName: string, content: string) =>
      this.component.start(componentName) +
      content +
      this.component.end(componentName),
  };

  public readonly input = {
    start: (componentName: string, inputName: string) =>
      `<span class="mdc-input" data-meta='${JSON.stringify({
        componentName,
        inputName,
      })}' style="display:none"></span>`,

    end: (componentName: string, inputName: string) =>
      `<span class="mdc-input-end" data-meta='${JSON.stringify({
        componentName,
        inputName,
      })}' style="display:none"></span>`,

    wrap: (componentName: string, inputName: string, content: string) =>
      this.input.start(componentName, inputName) +
      content +
      this.input.end(componentName, inputName),
  };

  hiddenValue = (componentName: string, inputName: string, value: string) =>
    `<span class="mdc-hidden-value" data-meta='${JSON.stringify({
      componentName,
      inputName,
      value,
    })}' style="display:none"></span>`;
}

// Singleton instance
export const tagsService = new TagsService();

// Type if needed
export type TagsServiceType = typeof tagsService;
