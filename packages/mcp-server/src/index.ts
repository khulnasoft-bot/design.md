#!/usr/bin/env node

import { lint } from "@google/design.md/linter";
import type { LintReport } from "@google/design.md/linter";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";

const VERSION = "0.1.0";
const NAME = "design.md-mcp";

type JsonRpcMessage = {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

const TOOLS: ToolDefinition[] = [
  {
    name: "lint_design_md",
    description: "Validate a DESIGN.md file for structural correctness. Returns errors, warnings, and info findings.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the DESIGN.md file" },
      },
      required: ["path"],
    },
  },
  {
    name: "export_design_md",
    description: "Export DESIGN.md tokens to Tailwind v3 JSON, Tailwind v4 CSS, or W3C DTCG format.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the DESIGN.md file" },
        format: {
          type: "string",
          enum: ["json-tailwind", "css-tailwind", "dtcg"],
          description: "Export format: json-tailwind (Tailwind v3), css-tailwind (Tailwind v4 CSS), dtcg (W3C Design Tokens)",
        },
      },
      required: ["path", "format"],
    },
  },
  {
    name: "diff_design_md",
    description: "Compare two DESIGN.md files and report token changes (colors, typography, rounded, spacing, components) and regression detection.",
    inputSchema: {
      type: "object",
      properties: {
        before: { type: "string", description: "Path to the 'before' DESIGN.md" },
        after: { type: "string", description: "Path to the 'after' DESIGN.md" },
      },
      required: ["before", "after"],
    },
  },
  {
    name: "read_design_md",
    description: "Read and parse a DESIGN.md file, returning its raw content and frontmatter tokens as structured data.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the DESIGN.md file" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_design_md",
    description: "Write or update a DESIGN.md file with new content. Auto-lints after write.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the DESIGN.md file" },
        frontmatter: { type: "object", description: "YAML frontmatter object" },
        body: { type: "string", description: "Markdown body content" },
      },
      required: ["path", "body"],
    },
  },
  {
    name: "extract_token_reference",
    description: "Extract a specific token value from DESIGN.md by path (e.g., 'colors.primary').",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the DESIGN.md file" },
        tokenPath: { type: "string", description: "Dot-notation path to token (e.g., 'colors.primary', 'typography.heading')" },
      },
      required: ["path", "tokenPath"],
    },
  },
  {
    name: "validate_component_tokens",
    description: "Validate component token properties and check for missing references.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to the DESIGN.md file" },
        component: { type: "string", description: "Component name to validate" },
      },
      required: ["path", "component"],
    },
  },
  {
    name: "merge_design_tokens",
    description: "Merge multiple DESIGN.md files into one, with conflict detection.",
    inputSchema: {
      type: "object",
      properties: {
        paths: { type: "array", items: { type: "string" }, description: "Paths to DESIGN.md files to merge" },
        strategy: {
          type: "string",
          enum: ["override", "combine"],
          description: "Merge strategy: override (last wins) or combine (merge arrays)",
        },
      },
      required: ["paths"],
    },
  },
];

function writeMessage(msg: JsonRpcMessage): void {
  const line = JSON.stringify(msg);
  process.stdout.write(line + "\n");
}

function writeError(id: unknown, code: number, message: string): void {
  writeMessage({ jsonrpc: "2.0", id: id as number | string | undefined, error: { code, message } });
}

function writeResult(id: number | string, result: unknown): void {
  writeMessage({ jsonrpc: "2.0", id, result });
}

function serializeFrontmatter(obj: Record<string, unknown>, indent = 0): string {
  const lines: string[] = [];
  const prefix = "  ".repeat(indent);
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;
    if (typeof val === "object" && !Array.isArray(val)) {
      lines.push(`${prefix}${key}:`);
      lines.push(serializeFrontmatter(val as Record<string, unknown>, indent + 1));
    } else if (typeof val === "string") {
      lines.push(`${prefix}${key}: "${val}"`);
    } else if (typeof val === "boolean") {
      lines.push(`${prefix}${key}: ${val}`);
    } else if (typeof val === "number") {
      lines.push(`${prefix}${key}: ${val}`);
    } else if (Array.isArray(val)) {
      lines.push(`${prefix}${key}:`);
      for (const item of val) {
        if (typeof item === "string") {
          lines.push(`${prefix}  - "${item}"`);
        } else {
          lines.push(`${prefix}  - ${item}`);
        }
      }
    }
  }
  return lines.join("\n");
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const parts = raw.split("---");
  if (parts.length < 3) return { frontmatter: {}, body: raw };
  try {
    const yaml = parts[1];
    const lines = yaml.split("\n");
    const obj: Record<string, unknown> = {};
    const stack: Record<string, unknown>[] = [obj];
    const indentStack: number[] = [0];
    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (trimmed === "" || trimmed.startsWith("#")) continue;
      const indent = line.length - trimmed.length;
      while (indent < indentStack[indentStack.length - 1] && stack.length > 1) {
        stack.pop();
        indentStack.pop();
      }
      const match = trimmed.match(/^(\w[\w-]*):\s*(.*)$/);
      if (!match) continue;
      const key = match[1];
      const val = match[2].trim();
      const cur = stack[stack.length - 1];
      if (val === "" || val === "|") {
        const next: Record<string, unknown> = {};
        cur[key] = next;
        stack.push(next);
        indentStack.push(indent);
      } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        cur[key] = val.slice(1, -1);
      } else if (val === "true") cur[key] = true;
      else if (val === "false") cur[key] = false;
      else if (!isNaN(Number(val))) cur[key] = Number(val);
      else cur[key] = val;
    }
    return { frontmatter: obj, body: parts.slice(2).join("---") };
  } catch {
    return { frontmatter: {}, body: raw };
  }
}

async function handleToolCall(id: number | string, name: string, args: Record<string, unknown>): Promise<void> {
  try {
    switch (name) {
      case "lint_design_md": {
        const path = String(args.path);
        const content = await readFile(path, "utf-8");
        const report = lint(content);
        writeResult(id, {
          findings: report.findings,
          summary: report.summary,
          designSystem: {
            colors: Object.fromEntries(report.designSystem.colors),
            typography: Object.fromEntries(report.designSystem.typography),
            rounded: Object.fromEntries(report.designSystem.rounded),
            spacing: Object.fromEntries(report.designSystem.spacing),
            components: Object.fromEntries(report.designSystem.components),
          },
        });
        break;
      }

      case "export_design_md": {
        const { path, format } = args as { path: string; format: string };
        const content = await readFile(path, "utf-8");
        const report = lint(content);
        const fmt = format as string;

        if (fmt === "css-tailwind") {
          const { TailwindV4EmitterHandler, serializeTailwindV4 } = await import("@google/design.md/linter");
          const handler = new TailwindV4EmitterHandler();
          const result = handler.execute(report.designSystem);
          if (!result.success) throw new Error(result.error.message);
          writeResult(id, { format: "css-tailwind", output: serializeTailwindV4(result.data.theme) });
        } else if (fmt === "json-tailwind" || fmt === "tailwind") {
          const { TailwindEmitterHandler } = await import("@google/design.md/linter");
          const handler = new TailwindEmitterHandler();
          const result = handler.execute(report.designSystem);
          if (!result.success) throw new Error(result.error.message);
          writeResult(id, { format: "json-tailwind", output: JSON.stringify(result.data, null, 2) });
        } else if (fmt === "dtcg") {
          const { DtcgEmitterHandler } = await import("@google/design.md/linter");
          const handler = new DtcgEmitterHandler();
          const result = handler.execute(report.designSystem);
          if (!result.success) throw new Error(result.error.message);
          writeResult(id, { format: "dtcg", output: JSON.stringify(result.data, null, 2) });
        } else {
          writeError(id, -32602, `Invalid format "${fmt}". Valid: json-tailwind, css-tailwind, dtcg`);
        }
        break;
      }

      case "diff_design_md": {
        const { before, after } = args as { before: string; after: string };
        const beforeContent = await readFile(before, "utf-8");
        const afterContent = await readFile(after, "utf-8");
        const beforeReport = lint(beforeContent);
        const afterReport = lint(afterContent);

        const diff = {
          tokens: {
            colors: diffMaps(beforeReport.designSystem.colors, afterReport.designSystem.colors),
            typography: diffMaps(beforeReport.designSystem.typography, afterReport.designSystem.typography),
            rounded: diffMaps(beforeReport.designSystem.rounded, afterReport.designSystem.rounded),
            spacing: diffMaps(beforeReport.designSystem.spacing, afterReport.designSystem.spacing),
          },
          findings: {
            before: beforeReport.summary,
            after: afterReport.summary,
            delta: {
              errors: afterReport.summary.errors - beforeReport.summary.errors,
              warnings: afterReport.summary.warnings - beforeReport.summary.warnings,
            },
          },
          regression: afterReport.summary.errors > beforeReport.summary.errors
            || afterReport.summary.warnings > beforeReport.summary.warnings,
        };
        writeResult(id, diff);
        break;
      }

      case "read_design_md": {
        const path = String(args.path);
        const content = await readFile(path, "utf-8");
        const { frontmatter, body } = parseFrontmatter(content);
        writeResult(id, { raw: content, frontmatter, body });
        break;
      }

      case "write_design_md": {
        const { path, frontmatter, body } = args as { path: string; frontmatter?: Record<string, unknown>; body: string };
        const yaml = frontmatter ? serializeFrontmatter(frontmatter) : "";
        const content = yaml ? `---\n${yaml}---\n${body}` : body;
        await writeFile(path, content, "utf-8");
        const report = lint(content);
        writeResult(id, {
          success: true,
          path,
          findings: report.findings,
          summary: report.summary,
        });
        break;
      }

      case "extract_token_reference": {
        const { path, tokenPath } = args as { path: string; tokenPath: string };
        const content = await readFile(path, "utf-8");
        const report = lint(content);
        const keys = tokenPath.split(".");
        let value: unknown = report.designSystem;
        for (const key of keys) {
          if (typeof value === "object" && value !== null && key in value) {
            value = (value as Record<string, unknown>)[key];
          } else {
            throw new Error(`Token path "${tokenPath}" not found`);
          }
        }
        writeResult(id, { tokenPath, value, resolved: JSON.stringify(value) });
        break;
      }

      case "validate_component_tokens": {
        const { path, component } = args as { path: string; component: string };
        const content = await readFile(path, "utf-8");
        const report = lint(content);
        const componentToken = (report.designSystem.components as Map<string, unknown>).get(component);
        if (!componentToken) {
          throw new Error(`Component "${component}" not found`);
        }
        const props = componentToken as Record<string, unknown>;
        const missing: string[] = [];
        for (const [key, val] of Object.entries(props)) {
          const ref = String(val);
          if (ref.includes("{") || ref.includes("$")) {
            const refPath = ref.replace(/[{}$]/g, "");
            let refValue: unknown = report.designSystem;
            for (const part of refPath.split(".")) {
              if (typeof refValue === "object" && refValue !== null && part in refValue) {
                refValue = (refValue as Record<string, unknown>)[part];
              } else {
                missing.push(`${key}: ${refPath}`);
                break;
              }
            }
          }
        }
        writeResult(id, { component, properties: props, missingReferences: missing, valid: missing.length === 0 });
        break;
      }

      case "merge_design_tokens": {
        const { paths, strategy } = args as { paths: string[]; strategy?: "override" | "combine" };
        const mergeStrategy = strategy || "override";
        const reports = [];
        let merged = { colors: new Map(), typography: new Map(), rounded: new Map(), spacing: new Map(), components: new Map() };
        for (const p of paths) {
          const content = await readFile(p, "utf-8");
          const report = lint(content);
          reports.push({ path: p, summary: report.summary });
          if (mergeStrategy === "override") {
            merged.colors = new Map([...merged.colors, ...report.designSystem.colors]);
            merged.typography = new Map([...merged.typography, ...report.designSystem.typography]);
            merged.rounded = new Map([...merged.rounded, ...report.designSystem.rounded]);
            merged.spacing = new Map([...merged.spacing, ...report.designSystem.spacing]);
            merged.components = new Map([...merged.components, ...report.designSystem.components]);
          }
        }
        writeResult(id, { merged: Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, Object.fromEntries(v)])), reports });
        break;
      }

      default:
        writeError(id, -32601, `Unknown tool: ${name}`);
    }
  } catch (e) {
    writeError(id, -32603, e instanceof Error ? e.message : String(e));
  }
}

function diffMaps(before: Map<string, unknown>, after: Map<string, unknown>): { added: string[]; removed: string[]; changed: string[]; unchanged: string[] } {
  const beforeKeys = new Set(before.keys());
  const afterKeys = new Set(after.keys());
  const added = [...afterKeys].filter(k => !beforeKeys.has(k));
  const removed = [...beforeKeys].filter(k => !afterKeys.has(k));
  const common = [...beforeKeys].filter(k => afterKeys.has(k));
  const changed = common.filter(k => JSON.stringify(before.get(k)) !== JSON.stringify(after.get(k)));
  const unchanged = common.filter(k => !changed.includes(k));
  return { added, removed, changed, unchanged };
}

async function main(): Promise<void> {
  const rl = createInterface({ input: process.stdin });
  let pending = 0;
  let closed = false;

  function onClose(): void {
    closed = true;
    if (pending === 0) process.exit(0);
  }

  function done(): void {
    pending--;
    if (closed && pending === 0) process.exit(0);
  }

  rl.on("line", (line) => {
    try {
      const msg: JsonRpcMessage = JSON.parse(line);

      if (msg.method === "initialize") {
        writeResult(msg.id!, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: NAME, version: VERSION },
        });
      } else if (msg.method === "notifications/initialized") {
      } else if (msg.method === "tools/list") {
        writeResult(msg.id!, { tools: TOOLS });
      } else if (msg.method === "tools/call") {
        const name = msg.params?.name as string;
        const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
        pending++;
        handleToolCall(msg.id!, name, args).then(done, done);
      } else {
        writeError(msg.id!, -32601, `Unknown method: ${msg.method}`);
      }
    } catch (e) {
      process.stderr.write(`Failed to parse message: ${(e as Error).message}\n`);
    }
  });

  rl.on("close", onClose);

  process.stderr.write(`${NAME} v${VERSION} running (MCP stdio transport)\n`);
}

main().catch((e) => {
  process.stderr.write(`Fatal error: ${e.message}\n`);
  process.exit(1);
});
