// src/services/ComponentsService.ts
import fs from "fs-extra";
import path from "path";
import { createLogger, config, tp } from "../globals";

export const tags = {
  parsing: {
    meta: { open: "<!--meta<%", close: "%>meta-->" },
    script: { open: "<!--script<%", close: "%>script-->" },
    content: { open: "<!--content-start-->", close: "<!--content-end-->" },
    input: {
      open: (inputName: string) => `<!--input-start-${inputName}-->`,
      close: (inputName: string) => `<!--input-end-${inputName}-->`,
    },
  },
  render: {
    component: {
      start: (name: string, id: string) =>
        `<span class="mdc-component" data-meta='${JSON.stringify({
          name,
          id,
        })}' style="display:none"></span>`,
      end: (name: string, id: string) =>
        `<span class="mdc-component-end" data-meta='${JSON.stringify({
          name,
          id,
        })}' style="display:none"></span>`,
    },
    slot: {
      start: (comp: string, id: string, slotName: string) =>
        `<span class="mdc-slot" data-meta='${JSON.stringify({
          comp,
          id,
          slotName,
        })}' style="display:none"></span>`,
      end: (comp: string, id: string, slotName: string) =>
        `<span class="mdc-slot-end" data-meta='${JSON.stringify({
          comp,
          id,
          slotName,
        })}' style="display:none"></span>`,
    },
    input: {
      start: (comp: string, id: string, inputName: string, inputId: string) =>
        `<span class="mdc-input" data-meta='${JSON.stringify({
          comp,
          id,
          input: inputName,
          inputId,
        })}' style="display:none"></span>`,
      end: (comp: string, id: string, inputName: string, inputId: string) =>
        `<span class="mdc-input-end" data-meta='${JSON.stringify({
          comp,
          id,
          input: inputName,
          inputId,
        })}' style="display:none"></span>`,
    },
  },
} as const;

export type Tags = typeof tags;

type ScriptFn = (
  component: MdComponent,
  tags: Tags
) => {
  inserts?: Record<string, string>;
  params?: Record<string, any>;
  slots?: Record<string, MdComponent[]>;
} | void;

export function getScriptFn(
  script: ScriptFn | { default?: ScriptFn } | null
): ScriptFn | null {
  if (!script) return null;
  if (typeof script === "function") return script;
  return script.default ?? null;
}

const logComponents = createLogger("ComponentsService");

export interface ComponentDefinition {
  name: string;
  parameters?: Record<string, any>;
  slots?: string[];
  rawContent: string;
  script?: ScriptFn;
}

export class MdComponent {
  definition: ComponentDefinition;
  name: string;
  instanceId: string;
  params: Record<string, any> = {};
  slots: Record<string, MdComponent[]> = {};
  inserts: Record<string, string> = {};
  rawContent: string;
  log: (msg: string) => void;

  constructor(
    definition: ComponentDefinition,
    instanceId: string,
    params: Record<string, any> = {},
    slotContent: Record<string, MdComponent[]> = {}
  ) {
    this.definition = definition;
    this.name = definition.name;
    this.instanceId = instanceId;
    this.rawContent = definition.rawContent;
    this.log = createLogger(`MdComponent ${this.name}`);

    this._initParams(params);
    this._initSlots(slotContent);
    this._executeScript();

    this.log(`Initialized with instanceId=${this.instanceId}`);
  }

  private _initParams(params: Record<string, any>) {
    for (const [key, meta] of Object.entries(
      this.definition.parameters ?? {}
    )) {
      this.params[key] = params[key] ?? meta?.default;
    }
    for (const [k, v] of Object.entries(params)) {
      if (this.params[k] === undefined) this.params[k] = v;
    }
  }

  private _initSlots(slotContent: Record<string, MdComponent[]>) {
    for (const [slotName, children] of Object.entries(slotContent ?? {})) {
      if (!Array.isArray(children)) continue;
      this.slots[slotName] = children.map((child) =>
        (child as MdComponent) //TODO: fix this `as` and rewrite new MdComponent creating if no `child`
          ? child
          : new MdComponent(
              child.definition,
              child.instanceId,
              child.params,
              child.slots
            )
      );
    }
  }

  private _executeScript() {
    if (!this.definition.script) return;

    const scriptFn: ScriptFn | null = getScriptFn(this.definition.script);

    if (!scriptFn) return;

    try {
      const result = scriptFn(this, tags) || {};
      if (result.inserts) this.inserts = { ...this.inserts, ...result.inserts };
      if (result.params) this.params = { ...this.params, ...result.params };
      if (result.slots) this.slots = { ...this.slots, ...result.slots };
    } catch (err) {
      console.error(`Error executing script for ${this.name}:`, err);
    }
  }

  render(): string {
    let output = this.rawContent;

    // handle inserts
    for (const [insertName, value] of Object.entries(this.inserts ?? {})) {
      const inputId = `${this.instanceId}__${insertName}`;
      const replacement =
        tags.render.input.start(
          this.name,
          this.instanceId,
          insertName,
          inputId
        ) +
        "\n" +
        value +
        "\n" +
        tags.render.input.end(this.name, this.instanceId, insertName, inputId);

      output = output.replace(
        new RegExp(`\\\\insert\\{${this._escapeRegExp(insertName)}\\}`, "g"),
        replacement
      );
    }

    // handle slots
    for (const [slotName, children] of Object.entries(this.slots ?? {})) {
      const childOut = children.map((c) => c.render()).join("\n");
      const replacement =
        tags.render.slot.start(this.name, this.instanceId, slotName) +
        "\n" +
        childOut +
        "\n" +
        tags.render.slot.end(this.name, this.instanceId, slotName);

      output = output.replace(
        new RegExp(`\\\\slot\\{${this._escapeRegExp(slotName)}\\}`, "g"),
        replacement
      );
    }

    // wrap component
    output =
      tags.render.component.start(this.name, this.instanceId) +
      "\n" +
      output +
      "\n" +
      tags.render.component.end(this.name, this.instanceId);

    return output;
  }

  private _escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export class ComponentsService {
  private componentsDir: string;
  private registry: Record<string, any> = {};
  private compCounter = 1;

  constructor(componentsDir: string) {
    this.componentsDir = componentsDir;
    logComponents(`Initializing from dir: ${componentsDir}`);
    this.registry = this._loadRegistry(componentsDir);
  }

  private _makeInstanceId(name: string) {
    return `${name}-${String(this.compCounter++).padStart(3, "0")}`;
  }

  private _getKeyName(name: string) {
    return name.split(".")[0];
  }

  private _loadRegistry(dirPath: string): Record<string, any> {
    if (!fs.existsSync(dirPath)) return {};
    const node: Record<string, any> = {};

    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        node[entry.name] = this._loadRegistry(entryPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".mdc") || entry.name.endsWith(".mdc.md"))
      ) {
        const key = this._getKeyName(entry.name);
        node[key] = () => fs.readFileSync(entryPath, "utf-8");
      }
    }

    return node;
  }

  createComponent(
    pathKeys: string[],
    params: Record<string, any> = {},
    slots: Record<string, MdComponent[]> = {}
  ) {
    let node: any = this.registry;
    for (const key of pathKeys) {
      if (!node[key]) {
        logComponents(`Component not found: ${pathKeys.join(".")}`);
        return null;
      }
      node = node[key];
    }

    if (typeof node === "function") {
      const rawContent = node();
      const def = this._parseComponent(rawContent);
      if (!def) return null;
      const instanceId = this._makeInstanceId(def.name);
      return new MdComponent(def, instanceId, params, slots);
    }
    return null;
  }

  private _parseComponent(rawContent: string): ComponentDefinition | null {
    try {
      const metaMatch = rawContent.match(
        new RegExp(
          `${this._escapeRegExp(
            tags.parsing.meta.open
          )}([\\s\\S]*?)${this._escapeRegExp(tags.parsing.meta.close)}`
        )
      );
      if (!metaMatch) throw new Error("Missing meta block");
      const meta = JSON.parse(metaMatch[1]);

      const scriptMatch = rawContent.match(
        new RegExp(
          `${this._escapeRegExp(
            tags.parsing.script.open
          )}([\\s\\S]*?)${this._escapeRegExp(tags.parsing.script.close)}`
        )
      );

      let scriptFn: Function | undefined;
      if (scriptMatch) {
        const module = { exports: {} as any };
        new Function("module", "exports", scriptMatch[1])(
          module,
          module.exports
        );
        scriptFn = module.exports;
      }

      const contentMatch = rawContent.match(
        new RegExp(
          `${this._escapeRegExp(
            tags.parsing.content.open
          )}([\\s\\S]*?)${this._escapeRegExp(tags.parsing.content.close)}`
        )
      );
      if (!contentMatch) throw new Error("Missing content block");

      return {
        name: meta.name,
        parameters: meta.parameters ?? {},
        slots: meta.slots ?? [],
        rawContent: contentMatch[1].trim(),
        script: scriptFn,
      };
    } catch (err) {
      console.error("Failed to parse component:", err);
      return null;
    }
  }

  private _escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
