export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'typography' | 'spacing' | 'rounded' | 'component';
}

export interface ParsedDesignMd {
  frontmatter: Record<string, unknown>;
  body: string;
  tokens: DesignToken[];
  summary: {
    colors: number;
    typography: number;
    spacing: number;
    rounded: number;
    components: number;
  };
}

export function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const parts = raw.split('---');
  if (parts.length < 3) return { frontmatter: {}, body: raw };
  try {
    const yaml = parts[1];
    const lines = yaml.split('\n');
    const obj: Record<string, unknown> = {};
    const stack: Record<string, unknown>[] = [obj];
    const indentStack: number[] = [0];

    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (trimmed === '' || trimmed.startsWith('#')) continue;
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

      if (val === '' || val === '|') {
        const next: Record<string, unknown> = {};
        cur[key] = next;
        stack.push(next);
        indentStack.push(indent);
      } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        cur[key] = val.slice(1, -1);
      } else if (val === 'true') cur[key] = true;
      else if (val === 'false') cur[key] = false;
      else if (!isNaN(Number(val))) cur[key] = Number(val);
      else cur[key] = val;
    }
    return { frontmatter: obj, body: parts.slice(2).join('---') };
  } catch {
    return { frontmatter: {}, body: raw };
  }
}

export function extractTokens(designSystem: Record<string, unknown>): DesignToken[] {
  const tokens: DesignToken[] = [];

  const categories = ['colors', 'typography', 'spacing', 'rounded', 'components'] as const;
  for (const cat of categories) {
    const items = designSystem[cat] as Record<string, unknown> | undefined;
    if (items && typeof items === 'object') {
      for (const [name, value] of Object.entries(items)) {
        const category = cat.slice(0, -1) as any;
        tokens.push({
          name,
          value: JSON.stringify(value),
          category,
        });
      }
    }
  }

  return tokens;
}

export function summarizeTokens(tokens: DesignToken[]) {
  return {
    colors: tokens.filter(t => t.category === 'color').length,
    typography: tokens.filter(t => t.category === 'typograph').length,
    spacing: tokens.filter(t => t.category === 'spacing').length,
    rounded: tokens.filter(t => t.category === 'rounded').length,
    components: tokens.filter(t => t.category === 'component').length,
  };
}
