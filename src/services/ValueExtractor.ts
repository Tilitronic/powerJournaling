// ValueExtractor.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { TagsClassesConst } from "./TagsService";
import { InputType } from "./InputCreator";
import { useLogger, LNs } from "../globals";

interface ExtractedInput {
  componentName: string;
  inputName: string;
  inputType: InputType;
  value: string | number | boolean | string[] | null;
  errors: string[];
}

export interface ExtractResult {
  value: string | number | boolean | string[] | null;
  errors: string[];
}

const logger = useLogger(LNs.ValueExtractor);

export class ValueExtractor {
  public extract(markdown: string): ExtractedInput[] {
    const tree = unified().use(remarkParse).parse(markdown);
    const results: ExtractedInput[] = [];
    const errors: string[] = [];

    const inputs: Record<
      string,
      { meta: any; content: string[]; hiddenValues: string[] }
    > = {};

    visit(tree, "html", (node: any) => {
      const value = node.value as string;

      if (value.includes(TagsClassesConst.input)) {
        const meta = this.getMeta(value);
        if (meta) {
          const key = this.key(meta);
          if (!inputs[key]) {
            inputs[key] = { meta, content: [], hiddenValues: [] };
          }
        }
      } else if (value.includes(TagsClassesConst.hiddenValue)) {
        const meta = this.getMeta(value);
        if (meta && meta.value) {
          const key = this.key(meta);
          if (!inputs[key]) {
            inputs[key] = { meta, content: [], hiddenValues: [] };
          }
          inputs[key].hiddenValues.push(meta.value);
        }
      }
    });

    // TODO: This is a naive approach. If multiple inputs are present, content may be incorrectly assigned.
    // Consider tracking input boundaries for more accurate extraction.
    visit(tree, (node: any) => {
      if (node.type === "html") return;

      const parent = (node.position?.start || {}).line;
      if (!parent) return;

      // naive: just accumulate raw markdown text for now
      if (node.value || node.children) {
        // for simplicity stringify node
        const raw = unified().use(remarkStringify).stringify(node);
        for (const key in inputs) {
          inputs[key].content.push(raw);
        }
      }
    });

    for (const key in inputs) {
      const { meta, content, hiddenValues } = inputs[key];
      const raw = content.join("").trim();
      const result = this.extractValue(meta.inputType, raw, hiddenValues, meta);
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
      results.push({
        componentName: meta.componentName,
        inputName: meta.inputName,
        inputType: meta.inputType,
        value: result.value,
        errors: result.errors,
      });
    }

    logger.dev("Extracted values", results);
    if (errors.length > 0) {
      logger.error("Extraction errors:", errors);
    }
    return results;
  }

  private getMeta(html: string): any | null {
    // Accepts both single and double quotes for data-meta
    const match = html.match(/data-meta=(?:'([^']+)'|"([^"]+)")/);
    if (!match) return null;
    try {
      return JSON.parse(match[1] || match[2]);
    } catch {
      return null;
    }
  }

  private key(meta: any) {
    return `${meta.componentName}::${meta.inputName}`;
  }

  private extractValue(
    type: InputType,
    raw: string,
    hiddenValues: string[],
    meta: any
  ): ExtractResult {
    const errors: string[] = [];
    let value: string | number | boolean | string[] | null = null;

    switch (type) {
      case "boolean": {
        // Only allow true/false, must be a checkbox
        if (raw.includes("[x]") || raw.includes("[X]")) {
          value = true;
        } else if (raw.includes("[ ]")) {
          value = false;
        } else {
          errors.push("Boolean input must be a markdown checkbox");
          value = null;
        }
        break;
      }
      case "text": {
        const cleaned = raw.replace(/^>\s?/gm, "").trim();
        if (meta.required && !cleaned) {
          errors.push("Text input is required");
        }
        if (meta.placeholder && cleaned === meta.placeholder) value = null;
        else value = cleaned;
        break;
      }
      case "richText": {
        const cleaned = raw.trim();
        if (meta.required && !cleaned) {
          errors.push("Rich text input is required");
        }
        if (meta.placeholder && cleaned === meta.placeholder) value = null;
        else value = cleaned;
        break;
      }
      case "multicheckbox": {
        const values: string[] = [];
        const lines = raw.split("\n");
        lines.forEach((line, idx) => {
          if (line.match(/\[(x|X)\]/)) {
            const hv = hiddenValues[idx];
            if (hv) values.push(hv);
          }
        });
        if (meta.required && values.length === 0) {
          errors.push("At least one option must be selected");
        }
        if (meta.singleChoice) {
          if (values.length > 1) {
            errors.push(
              `Multiple checked values for singleChoice input: ${
                meta.componentName
              }::${meta.inputName} [${values.join(", ")}]`
            );
          }
          value = values[0] ?? null;
        } else {
          value = values;
        }
        break;
      }
      case "number": {
        const match = raw.match(/(?<!\d)(\d+(?:[.,]\d+)?)/);
        if (!match) {
          errors.push("No number found");
          value = null;
        } else {
          value = parseFloat(match[1].replace(",", "."));
          if (
            meta.required &&
            (value === null || value === undefined || isNaN(value))
          ) {
            errors.push("Number input is required");
          }
          if (
            typeof value === "number" &&
            meta.min !== undefined &&
            value < meta.min
          ) {
            errors.push(`Number must be >= ${meta.min}`);
          }
          if (
            typeof value === "number" &&
            meta.max !== undefined &&
            value > meta.max
          ) {
            errors.push(`Number must be <= ${meta.max}`);
          }
        }
        break;
      }
      default: {
        value = raw;
      }
    }

    return { value, errors };
  }
}

// singleton
export const valueExtractor = new ValueExtractor();
