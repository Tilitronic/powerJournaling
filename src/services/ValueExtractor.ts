// ValueExtractor.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { TagsClassesConst } from "./TagsService";
import { InputType } from "./InputCreator";
import { useLogger, LNs } from "../globals";

interface ExtractedInput {
  componentId?: string;
  inputId: string;
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

    // Track input boundaries: key -> { meta, startPos, endPos, hiddenValues }
    const inputs: Record<
      string,
      {
        meta: any;
        startPos: number;
        endPos: number;
        hiddenValues: Array<{ value: string; pos: number }>;
      }
    > = {};

    // First pass: find start/end positions and hidden values using character positions
    visit(tree, (node: any) => {
      if (node.type === "html" && node.position) {
        const value = node.value as string;
        const pos = node.position.start.offset;

        if (value.includes(TagsClassesConst.input)) {
          const meta = this.getMeta(value);
          if (meta) {
            const key = this.key(meta);
            const isEnd = value.includes('end"');

            if (!isEnd) {
              // Start tag
              if (!inputs[key]) {
                inputs[key] = {
                  meta,
                  startPos: node.position.end.offset,
                  endPos: -1,
                  hiddenValues: [],
                };
              } else {
                inputs[key].startPos = node.position.end.offset;
              }
            } else {
              // End tag
              if (inputs[key]) {
                inputs[key].endPos = node.position.start.offset;
              } else {
                inputs[key] = {
                  meta,
                  startPos: -1,
                  endPos: node.position.start.offset,
                  hiddenValues: [],
                };
              }
            }
          }
        } else if (value.includes(TagsClassesConst.hiddenValue)) {
          const meta = this.getMeta(value);
          if (meta && meta.value) {
            const key = this.key(meta);
            if (!inputs[key]) {
              inputs[key] = {
                meta,
                startPos: -1,
                endPos: -1,
                hiddenValues: [],
              };
            }
            inputs[key].hiddenValues.push({ value: meta.value, pos });
          }
        }
      }
    });

    // Second pass: extract content for each input based on character positions
    for (const key in inputs) {
      const { meta, startPos, endPos, hiddenValues } = inputs[key];

      // Handle missing start or end tags
      if (startPos === -1 || endPos === -1) {
        // For text/richText inputs with only empty content or blockquote markers, treat as empty value
        if (meta.inputType === "text" || meta.inputType === "richText") {
          // Check if there's any content between tags that might be worth extracting
          if (startPos !== -1 && endPos === -1) {
            // Start tag exists but no end tag - try to find next input or end of content
            const nextInputPos = this.findNextInputTagPosition(
              markdown,
              startPos
            );
            if (nextInputPos !== -1) {
              const tempContent = markdown
                .substring(startPos, nextInputPos)
                .trim();
              const cleaned = tempContent
                .replace(/^>\s?/gm, "")
                .replace(/<[^>]+>/g, "")
                .trim();
              if (!cleaned || cleaned === ">") {
                // Empty or just blockquote marker - treat as empty, no warning
                results.push({
                  componentId: meta.componentId,
                  inputId: meta.inputId,
                  inputType: meta.inputType,
                  value: null,
                  errors: [],
                });
                continue;
              }
            }
          }
          // If no start tag or actual content exists, just treat as empty
          results.push({
            componentId: meta.componentId,
            inputId: meta.inputId,
            inputType: meta.inputType,
            value: null,
            errors: [],
          });
          continue;
        }
        // For other input types, log warning and skip
        logger.warn(`Input ${key} missing start or end tag, skipping`);
        continue;
      }

      // Extract substring from markdown
      const rawContent = markdown.substring(startPos, endPos).trim();

      // Remove HTML spans from the content (including closing tags)
      const cleanedContent = rawContent
        .replace(/<\/?span[^>]*>/gs, "") // Remove both opening and closing span tags
        .trim();

      // Extract hidden values that fall within this input's boundaries
      const relevantHiddenValues = hiddenValues
        .filter((hv) => hv.pos >= startPos && hv.pos < endPos)
        .map((hv) => hv.value);

      const result = this.extractValue(
        meta.inputType,
        cleanedContent,
        relevantHiddenValues,
        meta
      );
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
      results.push({
        componentId: meta.componentId,
        inputId: meta.inputId,
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

  /**
   * Find the position of the next input tag (start or end) after a given position
   * Returns -1 if no next tag found
   */
  private findNextInputTagPosition(markdown: string, fromPos: number): number {
    const regex = new RegExp(
      `<span[^>]*class="\\$${TagsClassesConst.input}[^"]*"`,
      "g"
    );
    regex.lastIndex = fromPos;
    const match = regex.exec(markdown);
    return match ? match.index : -1;
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
    return `${meta.componentId}::${meta.inputId}`;
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
        // Remove technical prefix from the start of each line
        let content = raw;

        // Check if raw content is just the technical prefix (empty input)
        if (
          meta.technicalPrefix &&
          raw.trim() === meta.technicalPrefix.trim()
        ) {
          value = null;
          break;
        }

        if (meta.technicalPrefix) {
          // Get the base prefix without trailing spaces
          const basePrefix = meta.technicalPrefix.trim();
          // Escape special regex characters in the base prefix
          const escapedPrefix = basePrefix.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
          // Remove prefix from start of each line (with optional spaces after)
          // This handles both ">text" and "> text" formats
          content = content.replace(
            new RegExp(`^${escapedPrefix}\\s*`, "gm"),
            ""
          );
        } else {
          // Fallback: if no technicalPrefix in metadata (old reports), remove common prefixes
          // This handles backwards compatibility with reports created before technicalPrefix was added
          content = content.replace(/^>\s*/gm, ""); // Remove blockquote markers and following spaces
        }

        // Remove HTML tags and trim
        const cleaned = content
          .replace(/<[^>]+>/g, "") // Strip HTML tags
          .trim();
        if (meta.required && !cleaned) {
          errors.push("Text input is required");
        }
        if (meta.placeholder && cleaned === meta.placeholder) value = null;
        else value = cleaned || null; // Set to null if empty string
        break;
      }
      case "richText": {
        // Remove technical prefix from the start of each line
        let content = raw;

        // Check if raw content is just the technical prefix (empty input)
        if (
          meta.technicalPrefix &&
          raw.trim() === meta.technicalPrefix.trim()
        ) {
          value = null;
          break;
        }

        if (meta.technicalPrefix) {
          // Get the base prefix without trailing spaces
          const basePrefix = meta.technicalPrefix.trim();
          // Escape special regex characters in the base prefix
          const escapedPrefix = basePrefix.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
          // Remove prefix from start of each line (with optional spaces after)
          // This handles both ">text" and "> text" formats
          content = content.replace(
            new RegExp(`^${escapedPrefix}\\s*`, "gm"),
            ""
          );
        } else {
          // Fallback: if no technicalPrefix in metadata (old reports), remove common prefixes
          // This handles backwards compatibility with reports created before technicalPrefix was added
          content = content.replace(/^>\s*/gm, ""); // Remove blockquote markers and following spaces
        }

        // Remove HTML tags and trim
        const cleaned = content
          .replace(/<[^>]+>/g, "") // Strip HTML tags
          .trim();
        if (meta.required && !cleaned) {
          errors.push("Rich text input is required");
        }
        if (meta.placeholder && cleaned === meta.placeholder) value = null;
        else value = cleaned || null; // Set to null if empty string
        break;
      }
      case "multicheckbox": {
        const values: string[] = [];
        const lines = raw.split("\n");
        let hiddenValueIdx = 0;

        lines.forEach((line) => {
          // Each line may have a hidden value span - check if this line is checked
          if (line.match(/\[(x|X)\]/)) {
            // Find the corresponding hidden value for this checked line
            if (hiddenValueIdx < hiddenValues.length) {
              values.push(hiddenValues[hiddenValueIdx]);
            }
          }
          // Increment if line contains a checkbox (checked or unchecked)
          if (line.match(/\[[ xX]\]/)) {
            hiddenValueIdx++;
          }
        });

        if (meta.required && values.length === 0) {
          errors.push("At least one option must be selected");
        }
        if (meta.singleChoice) {
          if (values.length > 1) {
            errors.push(
              `Multiple checked values for singleChoice input: ${
                meta.componentId
              }::${meta.inputId} [${values.join(", ")}]`
            );
          }
          value = values[0] ?? null;
        } else {
          value = values;
        }
        break;
      }
      case "number": {
        // Remove technical prefix if present in metadata
        let content = raw;
        if (meta.technicalPrefix) {
          const prefixPattern = meta.technicalPrefix.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
          content = content.replace(new RegExp(`^${prefixPattern}`, "gm"), "");
        }

        const match = content.match(/(?<!\d)(\d+(?:[.,]\d+)?)/);
        if (!match) {
          // No number found - only error if required
          if (meta.required) {
            errors.push("Number input is required");
          }
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

  /**
   * Extract report metadata from markdown content
   * Returns null if no metadata found
   */
  public extractReportMetadata(markdown: string): {
    reportType: string;
    reportDate: string;
    reportNumber: string;
    [key: string]: string;
  } | null {
    try {
      const tree = unified().use(remarkParse).parse(markdown);
      let metadata: any = null;

      visit(tree, (node: any) => {
        if (node.type === "html") {
          const value = node.value as string;
          if (value.includes(TagsClassesConst.reportMetadata)) {
            const meta = this.getMeta(value);
            if (meta) {
              metadata = meta;
              return false; // Stop visiting once found
            }
          }
        }
      });

      return metadata;
    } catch (error) {
      logger.error("Failed to extract report metadata", { error });
      return null;
    }
  }
}

// singleton
export const valueExtractor = new ValueExtractor();
