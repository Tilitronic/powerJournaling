// src/services/ComponentsService.ts
export class ComponentsService {
  componentsPath: string;
  config: any;

  constructor(componentsPath: string, config: any) {
    this.componentsPath = componentsPath;
    this.config = config;
  }

  init() {
    console.log(
      `[ComponentsService] Initializing components at: ${this.componentsPath}`
    );
  }

  getComponent(name: string) {
    console.log(`[ComponentsService] Fetching component: ${name}`);
    return { name, content: "mock component" };
  }
}
